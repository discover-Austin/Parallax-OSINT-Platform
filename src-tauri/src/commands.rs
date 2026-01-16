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
    #[serde(default)]
    pub metadata: serde_json::Value,
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
            // CSV export implementation
            export_to_csv(&file_path, &options.data, &options.metadata)
                .map_err(|e| format!("CSV export failed: {}", e))?;
        },
        "pdf" => {
            // PDF export implementation
            export_to_pdf(&file_path, &options.data, &options.metadata)
                .map_err(|e| format!("PDF export failed: {}", e))?;
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
    _app: tauri::AppHandle,
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

// ========================================================================
// USAGE TRACKING COMMANDS
// ========================================================================

#[tauri::command]
pub async fn get_usage_stats(
    vault: State<'_, Arc<VaultService>>,
) -> Result<crate::vault::UsageStats, String> {
    vault.get_usage_stats().await
        .map_err(|e| format!("Failed to get usage stats: {}", e))
}

#[tauri::command]
pub async fn increment_ai_usage(
    vault: State<'_, Arc<VaultService>>,
) -> Result<i32, String> {
    vault.increment_ai_usage().await
        .map_err(|e| format!("Failed to increment AI usage: {}", e))
}

#[tauri::command]
pub async fn can_generate_ai(
    vault: State<'_, Arc<VaultService>>,
    license: State<'_, Arc<LicenseService>>,
) -> Result<bool, String> {
    let license_info = license.get_license_info().await
        .map_err(|e| format!("Failed to get license info: {}", e))?;

    let tier = if license_info.activated && license_info.status == "active" {
        license_info.tier
    } else {
        "free".to_string()
    };

    vault.can_generate_ai(&tier).await
        .map_err(|e| format!("Failed to check AI generation permission: {}", e))
}

#[tauri::command]
pub async fn can_save_dork(
    vault: State<'_, Arc<VaultService>>,
    license: State<'_, Arc<LicenseService>>,
) -> Result<bool, String> {
    let license_info = license.get_license_info().await
        .map_err(|e| format!("Failed to get license info: {}", e))?;

    let tier = if license_info.activated && license_info.status == "active" {
        license_info.tier
    } else {
        "free".to_string()
    };

    vault.can_save_dork(&tier).await
        .map_err(|e| format!("Failed to check dork save permission: {}", e))
}

#[tauri::command]
pub async fn get_remaining_ai_generations(
    vault: State<'_, Arc<VaultService>>,
    license: State<'_, Arc<LicenseService>>,
) -> Result<i32, String> {
    let license_info = license.get_license_info().await
        .map_err(|e| format!("Failed to get license info: {}", e))?;

    let tier = if license_info.activated && license_info.status == "active" {
        license_info.tier
    } else {
        "free".to_string()
    };

    // Pro/Team/Enterprise: return -1 (unlimited)
    if matches!(tier.as_str(), "professional" | "team" | "enterprise") {
        return Ok(-1);
    }

    // Free tier: calculate remaining
    let stats = vault.get_usage_stats().await
        .map_err(|e| format!("Failed to get usage stats: {}", e))?;

    Ok(10 - stats.ai_generations_today)
}

// ========================================================================
// CONVERSATION PERSISTENCE COMMANDS
// ========================================================================

#[tauri::command]
pub async fn save_conversation(
    conversation: crate::vault::Conversation,
    vault: State<'_, Arc<VaultService>>,
) -> Result<(), String> {
    vault.save_conversation(&conversation).await
        .map_err(|e| format!("Failed to save conversation: {}", e))
}

#[tauri::command]
pub async fn get_conversation(
    id: String,
    vault: State<'_, Arc<VaultService>>,
) -> Result<crate::vault::Conversation, String> {
    vault.get_conversation(&id).await
        .map_err(|e| format!("Failed to get conversation: {}", e))
}

#[tauri::command]
pub async fn list_conversations(
    limit: Option<i32>,
    vault: State<'_, Arc<VaultService>>,
) -> Result<Vec<crate::vault::Conversation>, String> {
    vault.list_conversations(limit).await
        .map_err(|e| format!("Failed to list conversations: {}", e))
}

#[tauri::command]
pub async fn delete_conversation(
    id: String,
    vault: State<'_, Arc<VaultService>>,
) -> Result<(), String> {
    vault.delete_conversation(&id).await
        .map_err(|e| format!("Failed to delete conversation: {}", e))
}

// ========================================================================
// ENHANCED LICENSE COMMANDS
// ========================================================================

#[tauri::command]
pub async fn get_license_tier(
    license: State<'_, Arc<LicenseService>>,
) -> Result<String, String> {
    let license_info = license.get_license_info().await
        .map_err(|e| format!("Failed to get license info: {}", e))?;

    if license_info.activated && license_info.status == "active" {
        Ok(license_info.tier)
    } else {
        Ok("free".to_string())
    }
}

#[tauri::command]
pub async fn has_feature(
    feature: String,
    license: State<'_, Arc<LicenseService>>,
) -> Result<bool, String> {
    let license_info = license.get_license_info().await
        .map_err(|e| format!("Failed to get license info: {}", e))?;

    if !license_info.activated || license_info.status != "active" {
        return Ok(false);
    }

    Ok(license_info.features.contains(&feature))
}

// ========================================================================
// EXPORT HELPER FUNCTIONS
// ========================================================================

/// Export data to CSV format
fn export_to_csv(
    file_path: &std::path::Path,
    data: &serde_json::Value,
    metadata: &serde_json::Value,
) -> anyhow::Result<()> {
    use csv::Writer;

    let mut writer = Writer::from_path(file_path)?;

    // Handle data as array of objects
    let items = data
        .as_array()
        .ok_or_else(|| anyhow::anyhow!("Data must be an array for CSV export"))?;

    if items.is_empty() {
        return Err(anyhow::anyhow!("No data to export"));
    }

    // Extract headers from first object
    let first_item = &items[0];
    let headers: Vec<String> = if let Some(obj) = first_item.as_object() {
        obj.keys().map(|k| k.clone()).collect()
    } else {
        return Err(anyhow::anyhow!("Data items must be objects"));
    };

    // Write header row
    writer.write_record(&headers)?;

    // Write data rows
    for item in items {
        if let Some(obj) = item.as_object() {
            let row: Vec<String> = headers
                .iter()
                .map(|header| {
                    obj.get(header)
                        .map(|v| format_json_value_for_csv(v))
                        .unwrap_or_default()
                })
                .collect();
            writer.write_record(&row)?;
        }
    }

    writer.flush()?;
    Ok(())
}

/// Export data to PDF format
fn export_to_pdf(
    file_path: &std::path::Path,
    data: &serde_json::Value,
    metadata: &serde_json::Value,
) -> anyhow::Result<()> {
    use printpdf::*;

    // Create PDF document
    let (doc, page1, layer1) = PdfDocument::new(
        metadata
            .get("title")
            .and_then(|v| v.as_str())
            .unwrap_or("Parallax Export"),
        Mm(210.0),
        Mm(297.0),
        "Layer 1",
    );

    let current_layer = doc.get_page(page1).get_layer(layer1);

    // Use built-in fonts (Helvetica)
    let font = doc.add_builtin_font(BuiltinFont::Helvetica)?;
    let font_bold = doc.add_builtin_font(BuiltinFont::HelveticaBold)?;

    // Starting position
    let mut y_pos = 270.0; // Start from top
    let x_margin = 20.0;
    let page_width = 210.0;

    // Write title
    let title = metadata
        .get("title")
        .and_then(|v| v.as_str())
        .unwrap_or("Parallax Data Export");

    current_layer.use_text(title, 16.0, Mm(x_margin), Mm(y_pos), &font_bold);
    y_pos -= 10.0;

    // Write metadata
    if let Some(description) = metadata.get("description").and_then(|v| v.as_str()) {
        current_layer.use_text(description, 10.0, Mm(x_margin), Mm(y_pos), &font);
        y_pos -= 7.0;
    }

    let timestamp = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S UTC").to_string();
    current_layer.use_text(
        &format!("Generated: {}", timestamp),
        9.0,
        Mm(x_margin),
        Mm(y_pos),
        &font,
    );
    y_pos -= 15.0;

    // Handle data as array
    let items = data
        .as_array()
        .ok_or_else(|| anyhow::anyhow!("Data must be an array for PDF export"))?;

    for (index, item) in items.iter().enumerate() {
        // Check if we need a new page
        if y_pos < 30.0 {
            let (page, layer) = doc.add_page(Mm(210.0), Mm(297.0), "Layer 1");
            let current_layer = doc.get_page(page).get_layer(layer);
            y_pos = 270.0;
        }

        // Write item number
        current_layer.use_text(
            &format!("Item {} of {}", index + 1, items.len()),
            11.0,
            Mm(x_margin),
            Mm(y_pos),
            &font_bold,
        );
        y_pos -= 7.0;

        // Write item fields
        if let Some(obj) = item.as_object() {
            for (key, value) in obj {
                if y_pos < 30.0 {
                    let (page, layer) = doc.add_page(Mm(210.0), Mm(297.0), "Layer 1");
                    let current_layer = doc.get_page(page).get_layer(layer);
                    y_pos = 270.0;
                }

                let value_str = format_json_value_for_pdf(value);
                let truncated = truncate_text(&value_str, 80);

                let line = format!("{}: {}", key, truncated);
                current_layer.use_text(&line, 9.0, Mm(x_margin + 5.0), Mm(y_pos), &font);
                y_pos -= 5.0;
            }
        }

        y_pos -= 5.0; // Extra spacing between items
    }

    // Save PDF
    doc.save(&mut std::io::BufWriter::new(std::fs::File::create(
        file_path,
    )?))?;

    Ok(())
}

/// Format JSON value for CSV
fn format_json_value_for_csv(value: &serde_json::Value) -> String {
    match value {
        serde_json::Value::String(s) => s.clone(),
        serde_json::Value::Number(n) => n.to_string(),
        serde_json::Value::Bool(b) => b.to_string(),
        serde_json::Value::Null => String::new(),
        serde_json::Value::Array(arr) => {
            arr.iter()
                .map(|v| format_json_value_for_csv(v))
                .collect::<Vec<_>>()
                .join("; ")
        }
        serde_json::Value::Object(_) => serde_json::to_string(value).unwrap_or_default(),
    }
}

/// Format JSON value for PDF
fn format_json_value_for_pdf(value: &serde_json::Value) -> String {
    match value {
        serde_json::Value::String(s) => s.clone(),
        serde_json::Value::Number(n) => n.to_string(),
        serde_json::Value::Bool(b) => b.to_string(),
        serde_json::Value::Null => "null".to_string(),
        serde_json::Value::Array(arr) => {
            format!("[{}]", arr.iter()
                .map(|v| format_json_value_for_pdf(v))
                .collect::<Vec<_>>()
                .join(", "))
        }
        serde_json::Value::Object(obj) => {
            format!("{{{}}}", obj.iter()
                .map(|(k, v)| format!("{}: {}", k, format_json_value_for_pdf(v)))
                .collect::<Vec<_>>()
                .join(", "))
        }
    }
}

/// Truncate text to maximum length
fn truncate_text(text: &str, max_len: usize) -> String {
    if text.len() > max_len {
        format!("{}...", &text[..max_len - 3])
    } else {
        text.to_string()
    }
}

// Audit Logging Commands
use crate::audit::{AuditEventType, AuditLogger, Severity};
use chrono::DateTime;

#[tauri::command]
pub async fn get_audit_log(
    limit: Option<usize>,
    event_type: Option<String>,
    start_date: Option<String>,
    end_date: Option<String>,
) -> Result<Vec<serde_json::Value>, String> {
    let data_dir = dirs::data_dir()
        .ok_or("Failed to get data directory")?
        .join("com.parallax.app");

    let logger = AuditLogger::new(data_dir)
        .map_err(|e| format!("Failed to create audit logger: {}", e))?;

    // Parse event type
    let parsed_event_type = event_type.and_then(|et| match et.as_str() {
        "LicenseActivated" => Some(AuditEventType::LicenseActivated),
        "LicenseDeactivated" => Some(AuditEventType::LicenseDeactivated),
        "DorkCreated" => Some(AuditEventType::DorkCreated),
        "DorkDeleted" => Some(AuditEventType::DorkDeleted),
        "ExportPerformed" => Some(AuditEventType::ExportPerformed),
        _ => None,
    });

    // Parse dates
    let parsed_start = start_date.and_then(|s| DateTime::parse_from_rfc3339(&s).ok().map(|d| d.with_timezone(&chrono::Utc)));
    let parsed_end = end_date.and_then(|s| DateTime::parse_from_rfc3339(&s).ok().map(|d| d.with_timezone(&chrono::Utc)));

    let events = logger
        .get_events(limit, parsed_event_type, parsed_start, parsed_end)
        .map_err(|e| format!("Failed to get events: {}", e))?;

    // Convert to JSON values
    let json_events: Vec<serde_json::Value> = events
        .into_iter()
        .map(|e| serde_json::to_value(e).unwrap_or(serde_json::Value::Null))
        .collect();

    Ok(json_events)
}

#[tauri::command]
pub async fn export_audit_log(
    format: String,
    output_path: String,
) -> Result<String, String> {
    let data_dir = dirs::data_dir()
        .ok_or("Failed to get data directory")?
        .join("com.parallax.app");

    let logger = AuditLogger::new(data_dir)
        .map_err(|e| format!("Failed to create audit logger: {}", e))?;

    logger
        .export_logs(std::path::PathBuf::from(&output_path), &format)
        .map_err(|e| format!("Failed to export logs: {}", e))?;

    Ok(output_path)
}

#[tauri::command]
pub async fn verify_audit_integrity() -> Result<bool, String> {
    let data_dir = dirs::data_dir()
        .ok_or("Failed to get data directory")?
        .join("com.parallax.app");

    let logger = AuditLogger::new(data_dir)
        .map_err(|e| format!("Failed to create audit logger: {}", e))?;

    logger
        .verify_integrity()
        .map_err(|e| format!("Failed to verify integrity: {}", e))
}
