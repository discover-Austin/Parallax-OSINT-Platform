use anyhow::{Context, Result};
use rusqlite::{Connection, params};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DorkQuery {
    pub id: String,
    pub name: String,
    pub query: String,
    pub category: String,
    pub tags: Vec<String>,
    pub created_at: String,
    pub updated_at: Option<String>,
}

pub struct VaultService {
    conn: Arc<Mutex<Connection>>,
}

impl VaultService {
    pub fn new() -> Result<Self> {
        let vault_path = Self::get_vault_path()?;

        let conn = Connection::open(&vault_path)
            .context("Failed to open vault database")?;

        // Initialize schema
        conn.execute(
            "CREATE TABLE IF NOT EXISTS dorks (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                query TEXT NOT NULL,
                category TEXT NOT NULL,
                tags TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT
            )",
            [],
        ).context("Failed to create dorks table")?;

        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_dorks_category ON dorks(category)",
            [],
        ).context("Failed to create category index")?;

        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_dorks_created_at ON dorks(created_at DESC)",
            [],
        ).context("Failed to create created_at index")?;

        tracing::info!("Vault database initialized at {:?}", vault_path);

        Ok(Self {
            conn: Arc::new(Mutex::new(conn)),
        })
    }

    fn get_vault_path() -> Result<PathBuf> {
        let data_dir = dirs::data_dir()
            .ok_or_else(|| anyhow::anyhow!("Could not determine data directory"))?
            .join("Parallax")
            .join("vault");

        std::fs::create_dir_all(&data_dir)
            .context("Failed to create vault directory")?;

        Ok(data_dir.join("vault.db"))
    }

    pub async fn save_dork(&self, dork: DorkQuery) -> Result<()> {
        let conn = self.conn.lock().await;

        let tags_json = serde_json::to_string(&dork.tags)
            .context("Failed to serialize tags")?;

        conn.execute(
            "INSERT OR REPLACE INTO dorks (id, name, query, category, tags, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                dork.id,
                dork.name,
                dork.query,
                dork.category,
                tags_json,
                dork.created_at,
                chrono::Utc::now().to_rfc3339(),
            ],
        ).context("Failed to save dork")?;

        tracing::debug!("Dork saved: {} ({})", dork.name, dork.id);
        Ok(())
    }

    pub async fn get_all_dorks(&self) -> Result<Vec<DorkQuery>> {
        let conn = self.conn.lock().await;

        let mut stmt = conn.prepare(
            "SELECT id, name, query, category, tags, created_at, updated_at
             FROM dorks
             ORDER BY created_at DESC"
        ).context("Failed to prepare query")?;

        let dorks = stmt.query_map([], |row| {
            let tags_json: String = row.get(4)?;
            let tags: Vec<String> = serde_json::from_str(&tags_json)
                .unwrap_or_default();

            Ok(DorkQuery {
                id: row.get(0)?,
                name: row.get(1)?,
                query: row.get(2)?,
                category: row.get(3)?,
                tags,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .context("Failed to query dorks")?
        .collect::<Result<Vec<_>, _>>()
        .context("Failed to collect dorks")?;

        Ok(dorks)
    }

    pub async fn get_dork_by_id(&self, id: &str) -> Result<Option<DorkQuery>> {
        let conn = self.conn.lock().await;

        let mut stmt = conn.prepare(
            "SELECT id, name, query, category, tags, created_at, updated_at
             FROM dorks
             WHERE id = ?1"
        ).context("Failed to prepare query")?;

        let result = stmt.query_row(params![id], |row| {
            let tags_json: String = row.get(4)?;
            let tags: Vec<String> = serde_json::from_str(&tags_json)
                .unwrap_or_default();

            Ok(DorkQuery {
                id: row.get(0)?,
                name: row.get(1)?,
                query: row.get(2)?,
                category: row.get(3)?,
                tags,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        });

        match result {
            Ok(dork) => Ok(Some(dork)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e).context("Failed to get dork by ID"),
        }
    }

    pub async fn delete_dork(&self, id: &str) -> Result<()> {
        let conn = self.conn.lock().await;

        let rows_affected = conn.execute(
            "DELETE FROM dorks WHERE id = ?1",
            params![id],
        ).context("Failed to delete dork")?;

        if rows_affected == 0 {
            anyhow::bail!("Dork not found: {}", id);
        }

        tracing::debug!("Dork deleted: {}", id);
        Ok(())
    }

    pub async fn search_dorks(&self, query: &str) -> Result<Vec<DorkQuery>> {
        let conn = self.conn.lock().await;

        let search_pattern = format!("%{}%", query);

        let mut stmt = conn.prepare(
            "SELECT id, name, query, category, tags, created_at, updated_at
             FROM dorks
             WHERE name LIKE ?1 OR query LIKE ?1 OR category LIKE ?1
             ORDER BY created_at DESC"
        ).context("Failed to prepare search query")?;

        let dorks = stmt.query_map(params![search_pattern], |row| {
            let tags_json: String = row.get(4)?;
            let tags: Vec<String> = serde_json::from_str(&tags_json)
                .unwrap_or_default();

            Ok(DorkQuery {
                id: row.get(0)?,
                name: row.get(1)?,
                query: row.get(2)?,
                category: row.get(3)?,
                tags,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .context("Failed to search dorks")?
        .collect::<Result<Vec<_>, _>>()
        .context("Failed to collect search results")?;

        Ok(dorks)
    }

    pub async fn get_categories(&self) -> Result<Vec<String>> {
        let conn = self.conn.lock().await;

        let mut stmt = conn.prepare(
            "SELECT DISTINCT category FROM dorks ORDER BY category"
        ).context("Failed to prepare categories query")?;

        let categories = stmt.query_map([], |row| row.get(0))
            .context("Failed to query categories")?
            .collect::<Result<Vec<_>, _>>()
            .context("Failed to collect categories")?;

        Ok(categories)
    }

    pub async fn export_vault(&self) -> Result<String> {
        let dorks = self.get_all_dorks().await?;

        serde_json::to_string_pretty(&dorks)
            .context("Failed to serialize vault data")
    }

    pub async fn import_vault(&self, json_data: &str) -> Result<usize> {
        let dorks: Vec<DorkQuery> = serde_json::from_str(json_data)
            .context("Failed to parse import data")?;

        let count = dorks.len();

        for dork in dorks {
            self.save_dork(dork).await?;
        }

        tracing::info!("Imported {} dorks into vault", count);
        Ok(count)
    }

    pub async fn clear_vault(&self) -> Result<()> {
        let conn = self.conn.lock().await;

        conn.execute("DELETE FROM dorks", [])
            .context("Failed to clear vault")?;

        tracing::warn!("Vault cleared - all dorks deleted");
        Ok(())
    }

    pub async fn get_stats(&self) -> Result<serde_json::Value> {
        let conn = self.conn.lock().await;

        let total: i64 = conn.query_row(
            "SELECT COUNT(*) FROM dorks",
            [],
            |row| row.get(0),
        ).context("Failed to count total dorks")?;

        let categories: i64 = conn.query_row(
            "SELECT COUNT(DISTINCT category) FROM dorks",
            [],
            |row| row.get(0),
        ).context("Failed to count categories")?;

        Ok(serde_json::json!({
            "total_dorks": total,
            "total_categories": categories,
        }))
    }
}

impl Default for VaultService {
    fn default() -> Self {
        Self::new().expect("Failed to create VaultService")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;

    #[tokio::test]
    async fn test_vault_operations() {
        // Use a temporary database for testing
        let service = VaultService::new().unwrap();

        let test_dork = DorkQuery {
            id: Uuid::new_v4().to_string(),
            name: "Test Dork".to_string(),
            query: "intitle:test".to_string(),
            category: "testing".to_string(),
            tags: vec!["test".to_string(), "example".to_string()],
            created_at: chrono::Utc::now().to_rfc3339(),
            updated_at: None,
        };

        // Save
        service.save_dork(test_dork.clone()).await.unwrap();

        // Retrieve
        let retrieved = service.get_dork_by_id(&test_dork.id).await.unwrap();
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().name, "Test Dork");

        // Search
        let results = service.search_dorks("Test").await.unwrap();
        assert!(!results.is_empty());

        // Delete
        service.delete_dork(&test_dork.id).await.unwrap();
        let deleted = service.get_dork_by_id(&test_dork.id).await.unwrap();
        assert!(deleted.is_none());
    }
}
