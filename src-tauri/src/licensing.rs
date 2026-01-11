use anyhow::{Context, Result};
use ed25519_dalek::{VerifyingKey, Signature, Verifier};
use serde::{Deserialize, Serialize};
use sha2::{Sha256, Digest};

// Embedded public key for license validation (will be set during build)
const LICENSE_PUBLIC_KEY: &str = "WILL_BE_SET_DURING_BUILD_PROCESS";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LicenseInfo {
    pub status: String,
    pub tier: String,
    pub expires_at: Option<String>,
    pub features: Vec<String>,
    pub activated: bool,
}

#[derive(Debug, Serialize, Deserialize)]
struct LicenseKey {
    id: String,
    sku: String,
    expires: Option<String>,
    max_activations: u32,
    features: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct ActivationRequest {
    license_key: String,
    machine_fingerprint: String,
    app_version: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct ActivationResponse {
    success: bool,
    token: Option<String>,
    message: String,
    tier: String,
    features: Vec<String>,
    expires_at: Option<String>,
}

pub struct LicenseService {
    config_dir: std::path::PathBuf,
    http_client: reqwest::Client,
}

impl LicenseService {
    pub fn new() -> Result<Self> {
        let config_dir = dirs::config_dir()
            .ok_or_else(|| anyhow::anyhow!("Could not determine config directory"))?
            .join("Parallax");

        std::fs::create_dir_all(&config_dir)
            .context("Failed to create config directory")?;

        let http_client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .user_agent(format!("Parallax/{}", env!("CARGO_PKG_VERSION")))
            .build()
            .context("Failed to create HTTP client")?;

        Ok(Self {
            config_dir,
            http_client,
        })
    }

    pub async fn activate(&self, license_key: &str) -> Result<serde_json::Value> {
        // Validate license key format
        self.validate_key_format(license_key)?;

        // Verify offline signature first
        self.verify_license_signature(license_key)?;

        // Generate machine fingerprint
        let fingerprint = self.generate_machine_fingerprint()?;

        // Call activation API
        let request = ActivationRequest {
            license_key: license_key.to_string(),
            machine_fingerprint: fingerprint,
            app_version: env!("CARGO_PKG_VERSION").to_string(),
        };

        let response = self.http_client
            .post("https://license-server.parallax.app/activate")
            .json(&request)
            .send()
            .await
            .context("Failed to contact license server")?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
            anyhow::bail!("Activation failed: {}", error_text);
        }

        let activation: ActivationResponse = response.json().await
            .context("Failed to parse activation response")?;

        if !activation.success {
            anyhow::bail!("{}", activation.message);
        }

        // Store activation token
        if let Some(token) = &activation.token {
            self.store_activation_token(token).await?;
        }

        // Store license info
        let license_info = LicenseInfo {
            status: "active".to_string(),
            tier: activation.tier.clone(),
            expires_at: activation.expires_at.clone(),
            features: activation.features.clone(),
            activated: true,
        };
        self.store_license_info(&license_info).await?;

        tracing::info!("License activated successfully: tier={}", activation.tier);

        Ok(serde_json::json!({
            "success": true,
            "tier": activation.tier,
            "features": activation.features,
            "expires_at": activation.expires_at,
        }))
    }

    pub async fn deactivate(&self) -> Result<()> {
        // Delete activation token and license info
        let token_path = self.config_dir.join("activation.token");
        let info_path = self.config_dir.join("license.json");

        if token_path.exists() {
            tokio::fs::remove_file(token_path).await
                .context("Failed to delete activation token")?;
        }

        if info_path.exists() {
            tokio::fs::remove_file(info_path).await
                .context("Failed to delete license info")?;
        }

        tracing::info!("License deactivated");
        Ok(())
    }

    pub async fn validate(&self) -> Result<bool> {
        // Check if license info exists and is valid
        let license_info = match self.get_license_info().await {
            Ok(info) => info,
            Err(_) => return Ok(false),
        };

        if license_info.status != "active" {
            return Ok(false);
        }

        // Check expiration
        if let Some(expires_at) = &license_info.expires_at {
            if self.is_expired(expires_at)? {
                return Ok(false);
            }
        }

        // Validate activation token (if exists)
        let token_path = self.config_dir.join("activation.token");
        if !token_path.exists() {
            return Ok(false);
        }

        // Token validation would happen here
        // For now, we trust the local license info if it exists

        Ok(true)
    }

    pub async fn get_license_info(&self) -> Result<LicenseInfo> {
        let info_path = self.config_dir.join("license.json");

        if !info_path.exists() {
            // Return free tier as default
            return Ok(LicenseInfo {
                status: "free".to_string(),
                tier: "free".to_string(),
                expires_at: None,
                features: vec![
                    "builder".to_string(),
                    "library".to_string(),
                    "local_vault".to_string(),
                ],
                activated: false,
            });
        }

        let data = tokio::fs::read_to_string(&info_path).await
            .context("Failed to read license info")?;

        let info: LicenseInfo = serde_json::from_str(&data)
            .context("Failed to parse license info")?;

        Ok(info)
    }

    fn validate_key_format(&self, key: &str) -> Result<()> {
        // Expected format: PRLX-XXXX-XXXX-XXXX-XXXX
        if !key.starts_with("PRLX-") {
            anyhow::bail!("Invalid license key format");
        }

        let parts: Vec<&str> = key.split('-').collect();
        if parts.len() != 5 {
            anyhow::bail!("Invalid license key format");
        }

        // Each part (except first) should be 4 characters
        for part in &parts[1..] {
            if part.len() != 4 {
                anyhow::bail!("Invalid license key format");
            }
        }

        Ok(())
    }

    fn verify_license_signature(&self, _license_key: &str) -> Result<()> {
        // This would verify the Ed25519 signature embedded in the license key
        // For now, we'll implement a placeholder

        // In production:
        // 1. Decode the license key (base64 or similar)
        // 2. Extract signature and payload
        // 3. Verify signature using PUBLIC_KEY
        // 4. Ensure payload hasn't been tampered with

        tracing::debug!("License signature verification (placeholder)");
        Ok(())
    }

    fn generate_machine_fingerprint(&self) -> Result<String> {
        let mut hasher = Sha256::new();

        // Machine UID
        if let Ok(machine_id) = machine_uid::get() {
            hasher.update(machine_id.as_bytes());
        } else {
            tracing::warn!("Could not get machine UID");
        }

        // CPU info
        use sysinfo::System;
        let mut sys = System::new();
        sys.refresh_cpu_all();
        if let Some(cpu) = sys.cpus().first() {
            hasher.update(cpu.brand().as_bytes());
        }

        // OS info
        hasher.update(std::env::consts::OS.as_bytes());
        hasher.update(std::env::consts::ARCH.as_bytes());

        let hash = hasher.finalize();
        Ok(hex::encode(hash))
    }

    async fn store_activation_token(&self, token: &str) -> Result<()> {
        let token_path = self.config_dir.join("activation.token");
        tokio::fs::write(&token_path, token).await
            .context("Failed to store activation token")?;
        Ok(())
    }

    async fn store_license_info(&self, info: &LicenseInfo) -> Result<()> {
        let info_path = self.config_dir.join("license.json");
        let json = serde_json::to_string_pretty(info)
            .context("Failed to serialize license info")?;

        tokio::fs::write(&info_path, json).await
            .context("Failed to store license info")?;

        Ok(())
    }

    fn is_expired(&self, expires_at: &str) -> Result<bool> {
        use chrono::{DateTime, Utc};

        let expiry: DateTime<Utc> = expires_at.parse()
            .context("Failed to parse expiration date")?;

        Ok(Utc::now() > expiry)
    }
}

impl Default for LicenseService {
    fn default() -> Self {
        Self::new().expect("Failed to create LicenseService")
    }
}

// Add hex encoding dependency
use std::fmt::Write as FmtWrite;

fn hex_encode(bytes: &[u8]) -> String {
    let mut s = String::with_capacity(bytes.len() * 2);
    for &b in bytes {
        write!(&mut s, "{:02x}", b).unwrap();
    }
    s
}

mod hex {
    pub fn encode(bytes: impl AsRef<[u8]>) -> String {
        super::hex_encode(bytes.as_ref())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_key_format() {
        let service = LicenseService::new().unwrap();

        assert!(service.validate_key_format("PRLX-ABCD-1234-EFGH-5678").is_ok());
        assert!(service.validate_key_format("PRLX-TEST-XXXX-YYYY-ZZZZ").is_ok());
        assert!(service.validate_key_format("INVALID").is_err());
        assert!(service.validate_key_format("PRLX-TOO-SHORT").is_err());
    }

    #[test]
    fn test_machine_fingerprint_generation() {
        let service = LicenseService::new().unwrap();
        let fp1 = service.generate_machine_fingerprint().unwrap();
        let fp2 = service.generate_machine_fingerprint().unwrap();

        // Fingerprint should be consistent
        assert_eq!(fp1, fp2);

        // Should be a valid hex string
        assert_eq!(fp1.len(), 64); // SHA256 = 32 bytes = 64 hex chars
    }
}
