// Module declarations
mod commands;
mod security;
mod licensing;
mod vault;

use std::sync::Arc;
use tauri::Manager;
use tracing_subscriber::{fmt, prelude::*, EnvFilter};

/// Initialize logging and monitoring
fn init_logging() {
    // Set up structured logging
    let fmt_layer = fmt::layer()
        .with_target(true)
        .with_thread_ids(true)
        .with_line_number(true);

    let filter_layer = EnvFilter::try_from_default_env()
        .or_else(|_| EnvFilter::try_new("info"))
        .unwrap();

    tracing_subscriber::registry()
        .with(filter_layer)
        .with(fmt_layer)
        .init();

    tracing::info!("Parallax Intelligence Platform v{} starting", env!("CARGO_PKG_VERSION"));
}

/// Initialize Sentry for crash reporting
fn init_sentry() -> Option<sentry::ClientInitGuard> {
    // In production, set SENTRY_DSN environment variable
    if let Ok(dsn) = std::env::var("SENTRY_DSN") {
        let guard = sentry::init((
            dsn,
            sentry::ClientOptions {
                release: Some(env!("CARGO_PKG_VERSION").into()),
                environment: Some(
                    if cfg!(debug_assertions) {
                        "development"
                    } else {
                        "production"
                    }
                    .into(),
                ),
                attach_stacktrace: true,
                before_send: Some(Arc::new(|mut event| {
                    // Scrub sensitive data
                    if let Some(user) = &mut event.user {
                        user.email = None;
                        user.ip_address = None;
                    }
                    Some(event)
                })),
                ..Default::default()
            },
        ));

        tracing::info!("Sentry crash reporting initialized");
        Some(guard)
    } else {
        tracing::debug!("Sentry not configured (SENTRY_DSN not set)");
        None
    }
}

/// Initialize all application services
fn init_services() -> Result<
    (
        Arc<security::SecurityService>,
        Arc<licensing::LicenseService>,
        Arc<vault::VaultService>,
    ),
    anyhow::Error,
> {
    let security = Arc::new(security::SecurityService::new());
    let license = Arc::new(licensing::LicenseService::new()?);
    let vault = Arc::new(vault::VaultService::new()?);

    tracing::info!("All services initialized successfully");

    Ok((security, license, vault))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize logging first
    init_logging();

    // Initialize crash reporting
    let _sentry_guard = init_sentry();

    // Initialize services
    let (security, license, vault) = match init_services() {
        Ok(services) => services,
        Err(e) => {
            tracing::error!("Failed to initialize services: {}", e);
            eprintln!("Fatal error: Failed to initialize application services: {}", e);
            std::process::exit(1);
        }
    };

    // Build and run Tauri application
    let result = tauri::Builder::default()
        // Manage state
        .manage(security)
        .manage(license)
        .manage(vault)
        // Register plugins
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        // Register command handlers
        .invoke_handler(tauri::generate_handler![
            commands::get_app_config,
            commands::store_gemini_api_key,
            commands::get_gemini_api_key,
            commands::delete_gemini_api_key,
            commands::activate_license,
            commands::deactivate_license,
            commands::validate_license,
            commands::save_dork,
            commands::get_all_dorks,
            commands::delete_dork,
            commands::export_data,
            commands::get_system_info,
            commands::check_for_updates,
            commands::open_external_url,
            // Usage tracking commands
            commands::get_usage_stats,
            commands::increment_ai_usage,
            commands::can_generate_ai,
            commands::can_save_dork,
            commands::get_remaining_ai_generations,
            // Conversation persistence commands
            commands::save_conversation,
            commands::get_conversation,
            commands::list_conversations,
            commands::delete_conversation,
            // Enhanced license commands
            commands::get_license_tier,
            commands::has_feature,
        ])
        // Setup handler
        .setup(|app| {
            tracing::info!("Tauri application setup complete");

            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }

            Ok(())
        })
        // Run the application
        .run(tauri::generate_context!());

    if let Err(e) = result {
        tracing::error!("Fatal application error: {}", e);
        sentry::capture_message(&format!("Fatal application error: {}", e), sentry::Level::Fatal);
        eprintln!("Fatal error: {}", e);
        std::process::exit(1);
    }
}
