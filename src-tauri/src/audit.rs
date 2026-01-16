use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fs::{File, OpenOptions};
use std::io::{BufRead, BufReader, Write};
use std::path::PathBuf;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum AuditEventType {
    LicenseActivated,
    LicenseDeactivated,
    LicenseValidated,
    ApiKeyChanged,
    DorkCreated,
    DorkModified,
    DorkDeleted,
    DorkExecuted,
    ExportPerformed,
    SettingsChanged,
    AuthenticationFailed,
    VaultAccessed,
    ConversationSaved,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Severity {
    Info,
    Warning,
    Error,
    Critical,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AuditEvent {
    pub id: String,
    pub timestamp: DateTime<Utc>,
    pub event_type: AuditEventType,
    pub severity: Severity,
    pub user_action: String,
    pub result: String,
    pub metadata: serde_json::Value,
    pub hash: String,
}

pub struct AuditLogger {
    log_dir: PathBuf,
    current_log: PathBuf,
    max_file_size: u64,
}

impl AuditLogger {
    /// Create new audit logger
    pub fn new(data_dir: PathBuf) -> anyhow::Result<Self> {
        let log_dir = data_dir.join("audit");
        std::fs::create_dir_all(&log_dir)?;

        let current_log = log_dir.join("audit.log");

        Ok(Self {
            log_dir,
            current_log,
            max_file_size: 10 * 1024 * 1024, // 10MB
        })
    }

    /// Log an audit event
    pub fn log_event(
        &self,
        event_type: AuditEventType,
        severity: Severity,
        user_action: String,
        result: String,
        metadata: serde_json::Value,
    ) -> anyhow::Result<()> {
        // Generate event ID
        let id = Uuid::new_v4().to_string();
        let timestamp = Utc::now();

        // Get previous hash for chain
        let previous_hash = self.get_last_hash()?;

        // Create event
        let mut event = AuditEvent {
            id,
            timestamp,
            event_type,
            severity,
            user_action,
            result,
            metadata,
            hash: String::new(),
        };

        // Calculate hash
        event.hash = self.calculate_hash(&event, &previous_hash)?;

        // Serialize to JSON
        let json = serde_json::to_string(&event)?;

        // Check if rotation is needed
        if let Ok(metadata) = std::fs::metadata(&self.current_log) {
            if metadata.len() > self.max_file_size {
                self.rotate_logs()?;
            }
        }

        // Append to log file
        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.current_log)?;

        writeln!(file, "{}", json)?;

        Ok(())
    }

    /// Get all audit events
    pub fn get_events(
        &self,
        limit: Option<usize>,
        event_type: Option<AuditEventType>,
        start_date: Option<DateTime<Utc>>,
        end_date: Option<DateTime<Utc>>,
    ) -> anyhow::Result<Vec<AuditEvent>> {
        let file = File::open(&self.current_log)?;
        let reader = BufReader::new(file);

        let mut events = Vec::new();

        for line in reader.lines() {
            if let Ok(line) = line {
                if let Ok(event) = serde_json::from_str::<AuditEvent>(&line) {
                    // Apply filters
                    let mut include = true;

                    if let Some(ref filter_type) = event_type {
                        if !matches!(&event.event_type, filter_type) {
                            include = false;
                        }
                    }

                    if let Some(start) = start_date {
                        if event.timestamp < start {
                            include = false;
                        }
                    }

                    if let Some(end) = end_date {
                        if event.timestamp > end {
                            include = false;
                        }
                    }

                    if include {
                        events.push(event);
                    }
                }
            }
        }

        // Sort by timestamp (newest first)
        events.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

        // Apply limit
        if let Some(limit) = limit {
            events.truncate(limit);
        }

        Ok(events)
    }

    /// Verify audit log integrity
    pub fn verify_integrity(&self) -> anyhow::Result<bool> {
        let file = File::open(&self.current_log)?;
        let reader = BufReader::new(file);

        let mut previous_hash = String::from("genesis");
        let mut is_valid = true;

        for line in reader.lines() {
            if let Ok(line) = line {
                if let Ok(event) = serde_json::from_str::<AuditEvent>(&line) {
                    let calculated_hash = self.calculate_hash(&event, &previous_hash)?;

                    if calculated_hash != event.hash {
                        eprintln!(
                            "Integrity violation detected at event ID: {}",
                            event.id
                        );
                        is_valid = false;
                        break;
                    }

                    previous_hash = event.hash.clone();
                }
            }
        }

        Ok(is_valid)
    }

    /// Export audit logs
    pub fn export_logs(&self, output_path: PathBuf, format: &str) -> anyhow::Result<()> {
        let events = self.get_events(None, None, None, None)?;

        match format {
            "json" => {
                let json = serde_json::to_string_pretty(&events)?;
                std::fs::write(output_path, json)?;
            }
            "csv" => {
                let mut wtr = csv::Writer::from_path(output_path)?;

                // Write header
                wtr.write_record(&[
                    "ID",
                    "Timestamp",
                    "Event Type",
                    "Severity",
                    "User Action",
                    "Result",
                    "Metadata",
                ])?;

                // Write records
                for event in events {
                    wtr.write_record(&[
                        &event.id,
                        &event.timestamp.to_rfc3339(),
                        &format!("{:?}", event.event_type),
                        &format!("{:?}", event.severity),
                        &event.user_action,
                        &event.result,
                        &event.metadata.to_string(),
                    ])?;
                }

                wtr.flush()?;
            }
            _ => {
                return Err(anyhow::anyhow!("Unsupported export format"));
            }
        }

        Ok(())
    }

    /// Get last hash from log
    fn get_last_hash(&self) -> anyhow::Result<String> {
        if !self.current_log.exists() {
            return Ok(String::from("genesis"));
        }

        let file = File::open(&self.current_log)?;
        let reader = BufReader::new(file);

        let mut last_hash = String::from("genesis");

        for line in reader.lines() {
            if let Ok(line) = line {
                if let Ok(event) = serde_json::from_str::<AuditEvent>(&line) {
                    last_hash = event.hash;
                }
            }
        }

        Ok(last_hash)
    }

    /// Calculate hash for event
    fn calculate_hash(
        &self,
        event: &AuditEvent,
        previous_hash: &str,
    ) -> anyhow::Result<String> {
        let mut hasher = Sha256::new();

        // Hash: previous_hash + event_data
        hasher.update(previous_hash.as_bytes());
        hasher.update(event.id.as_bytes());
        hasher.update(event.timestamp.to_rfc3339().as_bytes());
        hasher.update(format!("{:?}", event.event_type).as_bytes());
        hasher.update(event.user_action.as_bytes());
        hasher.update(event.result.as_bytes());

        let result = hasher.finalize();
        Ok(hex::encode(result))
    }

    /// Rotate log files
    fn rotate_logs(&self) -> anyhow::Result<()> {
        let timestamp = Utc::now().format("%Y%m%d%H%M%S");
        let archived_log = self.log_dir.join(format!("audit_{}.log", timestamp));

        std::fs::rename(&self.current_log, archived_log)?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn test_audit_logger_creation() {
        let temp_dir = TempDir::new().unwrap();
        let logger = AuditLogger::new(temp_dir.path().to_path_buf());
        assert!(logger.is_ok());
    }

    #[test]
    fn test_log_event() {
        let temp_dir = TempDir::new().unwrap();
        let logger = AuditLogger::new(temp_dir.path().to_path_buf()).unwrap();

        let result = logger.log_event(
            AuditEventType::DorkCreated,
            Severity::Info,
            "User created a dork".to_string(),
            "success".to_string(),
            serde_json::json!({"dork_id": "123"}),
        );

        assert!(result.is_ok());
    }

    #[test]
    fn test_get_events() {
        let temp_dir = TempDir::new().unwrap();
        let logger = AuditLogger::new(temp_dir.path().to_path_buf()).unwrap();

        // Log some events
        logger
            .log_event(
                AuditEventType::DorkCreated,
                Severity::Info,
                "Create dork".to_string(),
                "success".to_string(),
                serde_json::json!({}),
            )
            .unwrap();

        logger
            .log_event(
                AuditEventType::DorkDeleted,
                Severity::Warning,
                "Delete dork".to_string(),
                "success".to_string(),
                serde_json::json!({}),
            )
            .unwrap();

        let events = logger.get_events(None, None, None, None).unwrap();
        assert_eq!(events.len(), 2);
    }

    #[test]
    fn test_verify_integrity() {
        let temp_dir = TempDir::new().unwrap();
        let logger = AuditLogger::new(temp_dir.path().to_path_buf()).unwrap();

        logger
            .log_event(
                AuditEventType::LicenseActivated,
                Severity::Info,
                "Activate license".to_string(),
                "success".to_string(),
                serde_json::json!({}),
            )
            .unwrap();

        let is_valid = logger.verify_integrity().unwrap();
        assert!(is_valid);
    }
}
