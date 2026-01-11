import { invoke } from '@tauri-apps/api/core';

export interface AppConfig {
  version: string;
  api_key_configured: boolean;
  license_status: string;
  tier: string;
}

export interface DorkQuery {
  id: string;
  name: string;
  query: string;
  category: string;
  tags: string[];
  created_at: string;
  updated_at?: string;
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf';
  data: unknown;
  filename: string;
}

export interface SystemInfo {
  os: string;
  arch: string;
  total_memory: number;
  used_memory: number;
  cpu_count: number;
}

export interface LicenseActivationResult {
  success: boolean;
  tier: string;
  features: string[];
  expires_at?: string;
}

export interface UsageStats {
  ai_generations_today: number;
  last_reset_date: string;
  total_dorks: number;
  total_conversations: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  dork?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

/**
 * Get current application configuration and status
 */
export async function getAppConfig(): Promise<AppConfig> {
  return await invoke<AppConfig>('get_app_config');
}

/**
 * Store Gemini API key securely in OS keyring
 */
export async function storeGeminiApiKey(apiKey: string): Promise<void> {
  await invoke('store_gemini_api_key', { apiKey });
}

/**
 * Retrieve Gemini API key from OS keyring
 */
export async function getGeminiApiKey(): Promise<string> {
  return await invoke<string>('get_gemini_api_key');
}

/**
 * Delete Gemini API key from OS keyring
 */
export async function deleteGeminiApiKey(): Promise<void> {
  await invoke('delete_gemini_api_key');
}

/**
 * Activate license with provided license key
 */
export async function activateLicense(
  licenseKey: string
): Promise<LicenseActivationResult> {
  return await invoke<LicenseActivationResult>('activate_license', {
    licenseKey,
  });
}

/**
 * Deactivate current license
 */
export async function deactivateLicense(): Promise<void> {
  await invoke('deactivate_license');
}

/**
 * Validate current license
 */
export async function validateLicense(): Promise<boolean> {
  return await invoke<boolean>('validate_license');
}

/**
 * Save a dork query to the vault
 */
export async function saveDork(dork: DorkQuery): Promise<void> {
  await invoke('save_dork', { dork });
}

/**
 * Get all dork queries from the vault
 */
export async function getAllDorks(): Promise<DorkQuery[]> {
  return await invoke<DorkQuery[]>('get_all_dorks');
}

/**
 * Delete a dork query from the vault
 */
export async function deleteDork(id: string): Promise<void> {
  await invoke('delete_dork', { id });
}

/**
 * Export data in specified format
 */
export async function exportData(options: ExportOptions): Promise<string> {
  return await invoke<string>('export_data', { options });
}

/**
 * Get system information for diagnostics
 */
export async function getSystemInfo(): Promise<SystemInfo> {
  return await invoke<SystemInfo>('get_system_info');
}

/**
 * Check for application updates
 */
export async function checkForUpdates(): Promise<{
  available: boolean;
  current_version: string;
  latest_version?: string;
}> {
  return await invoke('check_for_updates');
}

/**
 * Open external URL safely
 */
export async function openExternalUrl(url: string): Promise<void> {
  await invoke('open_external_url', { url });
}

/**
 * Error handling wrapper for Tauri commands
 */
export async function executeTauriCommand<T>(
  command: () => Promise<T>,
  errorMessage: string = 'Command execution failed'
): Promise<T> {
  try {
    return await command();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    throw new Error(
      `${errorMessage}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// ============================================================================
// USAGE TRACKING
// ============================================================================

/**
 * Get current usage statistics for free tier enforcement
 */
export async function getUsageStats(): Promise<UsageStats> {
  return await invoke<UsageStats>('get_usage_stats');
}

/**
 * Increment AI generation counter and return new count
 */
export async function incrementAIUsage(): Promise<number> {
  return await invoke<number>('increment_ai_usage');
}

/**
 * Check if user can generate AI dork (respects tier limits)
 */
export async function canGenerateAI(): Promise<boolean> {
  return await invoke<boolean>('can_generate_ai');
}

/**
 * Check if user can save dork (respects tier limits)
 */
export async function canSaveDork(): Promise<boolean> {
  return await invoke<boolean>('can_save_dork');
}

/**
 * Get remaining AI generations for today
 */
export async function getRemainingAIGenerations(): Promise<number> {
  return await invoke<number>('get_remaining_ai_generations');
}

// ============================================================================
// CONVERSATION PERSISTENCE
// ============================================================================

/**
 * Save conversation to encrypted vault
 */
export async function saveConversation(conversation: Conversation): Promise<void> {
  await invoke('save_conversation', { conversation });
}

/**
 * Get conversation by ID from vault
 */
export async function getConversation(id: string): Promise<Conversation> {
  return await invoke<Conversation>('get_conversation', { id });
}

/**
 * List all conversations (optionally limited)
 */
export async function listConversations(limit?: number): Promise<Conversation[]> {
  return await invoke<Conversation[]>('list_conversations', { limit });
}

/**
 * Delete conversation from vault
 */
export async function deleteConversation(id: string): Promise<void> {
  await invoke('delete_conversation', { id });
}

// ============================================================================
// ENHANCED LICENSE FUNCTIONS
// ============================================================================

/**
 * Get current license tier (free, professional, team, enterprise)
 */
export async function getLicenseTier(): Promise<string> {
  return await invoke<string>('get_license_tier');
}

/**
 * Check if license includes specific feature
 */
export async function hasFeature(feature: string): Promise<boolean> {
  return await invoke<boolean>('has_feature', { feature });
}
