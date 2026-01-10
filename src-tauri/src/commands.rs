use crate::security::SecurityService;
use crate::licensing::LicenseService;
use crate::vault::{VaultService, DorkQuery};
use serde::{Deserialize, Serialize};
use tauri::State;
use std::sync::Arc;

#[derive(Debug, Serialize, Deserialize)]
pub struct AppConfig {
    pub version: String,
    pub api_key_configured: bool,
    pub license_status: String,
    pub tier: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExportOptions {
    pub format: String, // "pdf", "csv", "json"
    pub data: serde_json::Value,
    pub filename: String,
}

// Get application configuration and status
#[tauri::command]
pub async fn get_app_config(
    security: State<'_, Arc<SecurityService>>,
    license: State<'_, Arc<LicenseService>>,
) -> Result<AppConfig, String> {
    let has_api_key = security.has_gemini_api_key().await
        .map_err(|e| format!("Failed to check API key: {}", e))?;

    let license_info = license.get_license_info().await
        .map_err(|e| format!("Failed to get license info: {}", e))?;

    Ok(AppConfig {
        version: env!("CARGO_PKG_VERSION").to_string(),
        api_key_configured: has_api_key,
        license_status: license_info.status,
        tier: license_info.tier,
    })
}

// Secure API key storage
#[tauri::command]
pub async fn store_gemini_api_key(
    api_key: String,
    security: State<'_, Arc<SecurityService>>,
) -> Result<(), String> {
    security.store_gemini_api_key(&api_key).await
        .map_err(|e| format!("Failed to store API key: {}", e))
}

#[tauri::command]
pub async fn get_gemini_api_key(
    security: State<'_, Arc<SecurityService>>,
) -> Result<String, String> {
    security.get_gemini_api_key().await
        .map_err(|e| format!("Failed to retrieve API key: {}", e))
}

#[tauri::command]
pub async fn delete_gemini_api_key(
    security: State<'_, Arc<SecurityService>>,
) -> Result<(), String> {
    security.delete_gemini_api_key().await
        .map_err(|e| format!("Failed to delete API key: {}", e))
}

// License activation
#[tauri::command]
pub async fn activate_license(
    license_key: String,
    license: State<'_, Arc<LicenseService>>,
) -> Result<serde_json::Value, String> {
    license.activate(&license_key).await
        .map_err(|e| format!("License activation failed: {}", e))
}

#[tauri::command]
pub async fn deactivate_license(
    license: State<'_, Arc<LicenseService>>,
) -> Result<(), String> {
    license.deactivate().await
        .map_err(|e| format!("License deactivation failed: {}", e))
}

#[tauri::command]
pub async fn validate_license(
    license: State<'_, Arc<LicenseService>>,
) -> Result<bool, String> {
    license.validate().await
        .map_err(|e| format!("License validation failed: {}", e))
}

// Vault operations
#[tauri::command]
pub async fn save_dork(
    dork: DorkQuery,
    vault: State<'_, Arc<VaultService>>,
) -> Result<(), String> {
    vault.save_dork(dork).await
        .map_err(|e| format!("Failed to save dork: {}", e))
}

#[tauri::command]
pub async fn get_all_dorks(
    vault: State<'_, Arc<VaultService>>,
) -> Result<Vec<DorkQuery>, String> {
    vault.get_all_dorks().await
        .map_err(|e| format!("Failed to retrieve dorks: {}", e))
}

#[tauri::command]
pub async fn delete_dork(
    id: String,
    vault: State<'_, Arc<VaultService>>,
) -> Result<(), String> {
    vault.delete_dork(&id).await
        .map_err(|e| format!("Failed to delete dork: {}", e))
}

// Export functionality
#[tauri::command]
pub async fn export_data(
    options: ExportOptions,
) -> Result<String, String> {
    use std::path::PathBuf;

    // Get documents directory
    let docs_dir = dirs::document_dir()
        .ok_or_else(|| "Could not determine documents directory".to_string())?;

    let export_dir = docs_dir.join("Parallax").join("Exports");
    std::fs::create_dir_all(&export_dir)
        .map_err(|e| format!("Failed to create export directory: {}", e))?;

    let file_path = export_dir.join(&options.filename);

    match options.format.as_str() {
        "json" => {
            std::fs::write(&file_path, serde_json::to_string_pretty(&options.data)
                .map_err(|e| format!("JSON serialization failed: {}", e))?)
                .map_err(|e| format!("Failed to write JSON file: {}", e))?;
        },
        "csv" => {
            // CSV export implementation would go here
            return Err("CSV export not yet implemented".to_string());
        },
        "pdf" => {
            // PDF export implementation would go here
            return Err("PDF export not yet implemented".to_string());
        },
        _ => return Err(format!("Unsupported export format: {}", options.format)),
    }

    Ok(file_path.to_string_lossy().to_string())
}

// System information for diagnostics
#[tauri::command]
pub async fn get_system_info() -> Result<serde_json::Value, String> {
    use sysinfo::System;

    let mut sys = System::new_all();
    sys.refresh_all();

    Ok(serde_json::json!({
        "os": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
        "total_memory": sys.total_memory(),
        "used_memory": sys.used_memory(),
        "cpu_count": sys.cpus().len(),
    }))
}

// Check for updates
#[tauri::command]
pub async fn check_for_updates(
    app: tauri::AppHandle,
) -> Result<serde_json::Value, String> {
    // This will be implemented with tauri-plugin-updater
    Ok(serde_json::json!({
        "available": false,
        "current_version": env!("CARGO_PKG_VERSION"),
    }))
}

// Open external URL safely
#[tauri::command]
pub async fn open_external_url(
    url: String,
) -> Result<(), String> {
    // Validate URL before opening
    if !url.starts_with("http://") && !url.starts_with("https://") {
        return Err("Invalid URL protocol".to_string());
    }

    // Additional validation could be added here

    Ok(())
}
