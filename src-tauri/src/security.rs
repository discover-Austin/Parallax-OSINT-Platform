use anyhow::{Context, Result};
use keyring::Entry;
use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use rand::RngCore;
use sha2::{Sha256, Digest};

const SERVICE_NAME: &str = "ParallaxIntelligence";
const GEMINI_KEY_NAME: &str = "gemini_api_key";

pub struct SecurityService {
    keyring_available: bool,
}

impl SecurityService {
    pub fn new() -> Self {
        Self {
            keyring_available: Self::check_keyring_availability(),
        }
    }

    fn check_keyring_availability() -> bool {
        // Test if OS keyring is available
        match Entry::new(SERVICE_NAME, "test") {
            Ok(_) => true,
            Err(_) => {
                tracing::warn!("OS keyring not available, will use encrypted fallback");
                false
            }
        }
    }

    // Gemini API Key Management
    pub async fn store_gemini_api_key(&self, api_key: &str) -> Result<()> {
        if self.keyring_available {
            self.store_in_keyring(GEMINI_KEY_NAME, api_key)?;
        } else {
            self.store_encrypted_fallback(GEMINI_KEY_NAME, api_key).await?;
        }

        tracing::info!("Gemini API key stored securely");
        Ok(())
    }

    pub async fn get_gemini_api_key(&self) -> Result<String> {
        if self.keyring_available {
            self.get_from_keyring(GEMINI_KEY_NAME)
        } else {
            self.get_encrypted_fallback(GEMINI_KEY_NAME).await
        }
    }

    pub async fn has_gemini_api_key(&self) -> Result<bool> {
        match self.get_gemini_api_key().await {
            Ok(_) => Ok(true),
            Err(_) => Ok(false),
        }
    }

    pub async fn delete_gemini_api_key(&self) -> Result<()> {
        if self.keyring_available {
            self.delete_from_keyring(GEMINI_KEY_NAME)?;
        } else {
            self.delete_encrypted_fallback(GEMINI_KEY_NAME).await?;
        }

        tracing::info!("Gemini API key deleted");
        Ok(())
    }

    // OS Keyring operations
    fn store_in_keyring(&self, key_name: &str, value: &str) -> Result<()> {
        let entry = Entry::new(SERVICE_NAME, key_name)
            .context("Failed to create keyring entry")?;

        entry.set_password(value)
            .context("Failed to store in OS keyring")?;

        Ok(())
    }

    fn get_from_keyring(&self, key_name: &str) -> Result<String> {
        let entry = Entry::new(SERVICE_NAME, key_name)
            .context("Failed to create keyring entry")?;

        entry.get_password()
            .context("Failed to retrieve from OS keyring")
    }

    fn delete_from_keyring(&self, key_name: &str) -> Result<()> {
        let entry = Entry::new(SERVICE_NAME, key_name)
            .context("Failed to create keyring entry")?;

        entry.delete_credential()
            .context("Failed to delete from OS keyring")?;

        Ok(())
    }

    // Encrypted fallback for systems without keyring
    async fn store_encrypted_fallback(&self, key_name: &str, value: &str) -> Result<()> {
        let data_dir = self.get_secure_data_dir()?;
        let file_path = data_dir.join(format!("{}.enc", key_name));

        // Derive encryption key from machine-specific data
        let encryption_key = self.derive_machine_key()?;

        let cipher = Aes256Gcm::new(&encryption_key.into());

        // Generate random nonce
        let mut nonce_bytes = [0u8; 12];
        OsRng.fill_bytes(&mut nonce_bytes);
        let nonce = Nonce::from_slice(&nonce_bytes);

        // Encrypt the value
        let ciphertext = cipher.encrypt(nonce, value.as_bytes())
            .map_err(|e| anyhow::anyhow!("Encryption failed: {}", e))?;

        // Combine nonce + ciphertext
        let mut output = nonce_bytes.to_vec();
        output.extend_from_slice(&ciphertext);

        tokio::fs::write(&file_path, output).await
            .context("Failed to write encrypted file")?;

        Ok(())
    }

    async fn get_encrypted_fallback(&self, key_name: &str) -> Result<String> {
        let data_dir = self.get_secure_data_dir()?;
        let file_path = data_dir.join(format!("{}.enc", key_name));

        let data = tokio::fs::read(&file_path).await
            .context("Failed to read encrypted file")?;

        if data.len() < 12 {
            anyhow::bail!("Invalid encrypted data");
        }

        // Split nonce and ciphertext
        let (nonce_bytes, ciphertext) = data.split_at(12);
        let nonce = Nonce::from_slice(nonce_bytes);

        // Derive same encryption key
        let encryption_key = self.derive_machine_key()?;
        let cipher = Aes256Gcm::new(&encryption_key.into());

        // Decrypt
        let plaintext = cipher.decrypt(nonce, ciphertext)
            .map_err(|e| anyhow::anyhow!("Decryption failed: {}", e))?;

        String::from_utf8(plaintext)
            .context("Invalid UTF-8 in decrypted data")
    }

    async fn delete_encrypted_fallback(&self, key_name: &str) -> Result<()> {
        let data_dir = self.get_secure_data_dir()?;
        let file_path = data_dir.join(format!("{}.enc", key_name));

        if file_path.exists() {
            tokio::fs::remove_file(&file_path).await
                .context("Failed to delete encrypted file")?;
        }

        Ok(())
    }

    fn get_secure_data_dir(&self) -> Result<std::path::PathBuf> {
        let data_dir = dirs::data_dir()
            .ok_or_else(|| anyhow::anyhow!("Could not determine data directory"))?
            .join("Parallax")
            .join("secure");

        std::fs::create_dir_all(&data_dir)
            .context("Failed to create secure data directory")?;

        Ok(data_dir)
    }

    fn derive_machine_key(&self) -> Result<[u8; 32]> {
        // Derive encryption key from machine-specific identifiers
        // This provides some protection but is not as secure as OS keyring
        let mut hasher = Sha256::new();

        // Add machine UID
        if let Ok(machine_id) = machine_uid::get() {
            hasher.update(machine_id.as_bytes());
        }

        // Add OS-specific identifiers
        hasher.update(std::env::consts::OS.as_bytes());
        hasher.update(std::env::consts::ARCH.as_bytes());

        // Add application identifier
        hasher.update(SERVICE_NAME.as_bytes());

        let hash = hasher.finalize();
        let mut key = [0u8; 32];
        key.copy_from_slice(&hash);

        Ok(key)
    }
}

impl Default for SecurityService {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_store_and_retrieve_api_key() {
        let service = SecurityService::new();
        let test_key = "test-api-key-12345";

        service.store_gemini_api_key(test_key).await.unwrap();
        let retrieved = service.get_gemini_api_key().await.unwrap();

        assert_eq!(retrieved, test_key);

        service.delete_gemini_api_key().await.unwrap();
    }
}
