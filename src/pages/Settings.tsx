import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getAppConfig,
  storeGeminiApiKey,
  deleteGeminiApiKey,
  deactivateLicense,
  getSystemInfo,
} from '../services/tauri';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'general' | 'apikey' | 'license' | 'about'>('general');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { data: config, refetch: refetchConfig } = useQuery({
    queryKey: ['appConfig'],
    queryFn: getAppConfig,
  });

  const { data: systemInfo } = useQuery({
    queryKey: ['systemInfo'],
    queryFn: getSystemInfo,
  });

  const saveApiKeyMutation = useMutation({
    mutationFn: storeGeminiApiKey,
    onSuccess: () => {
      setSuccessMessage('API key saved successfully');
      setApiKey('');
      refetchConfig();
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save API key');
      setTimeout(() => setErrorMessage(''), 5000);
    },
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: deleteGeminiApiKey,
    onSuccess: () => {
      setSuccessMessage('API key deleted successfully');
      refetchConfig();
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete API key');
      setTimeout(() => setErrorMessage(''), 5000);
    },
  });

  const deactivateLicenseMutation = useMutation({
    mutationFn: deactivateLicense,
    onSuccess: () => {
      setSuccessMessage('License deactivated successfully');
      refetchConfig();
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to deactivate license');
      setTimeout(() => setErrorMessage(''), 5000);
    },
  });

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      setErrorMessage('Please enter an API key');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    saveApiKeyMutation.mutate(apiKey);
  };

  const tabs = [
    { id: 'general' as const, name: 'General', icon: '⚙️' },
    { id: 'apikey' as const, name: 'API Key', icon: '🔑' },
    { id: 'license' as const, name: 'License', icon: '⭐' },
    { id: 'about' as const, name: 'About', icon: 'ℹ️' },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-lg">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-lg">
          {errorMessage}
        </div>
      )}

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Appearance
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Toggle between light and dark themes
                  </p>
                </div>
                <button className="btn-secondary">Coming Soon</button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Preferences
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Auto-Updates</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Automatically download and install updates
                  </p>
                </div>
                <button className="btn-secondary">Enabled</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Key Tab */}
      {activeTab === 'apikey' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Google Gemini API Key
            </h2>

            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-lg">
              <p className="text-sm">
                Your API key is stored securely in your system's credential manager (Windows
                Credential Manager, macOS Keychain, or Linux Secret Service).
              </p>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    config?.api_key_configured
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}
                >
                  {config?.api_key_configured ? 'Configured' : 'Not Configured'}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Gemini API key"
                    className="input flex-1"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="btn-secondary px-4"
                  >
                    {showApiKey ? '🙈' : '👁️'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Get your API key from{' '}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveApiKey}
                  disabled={saveApiKeyMutation.isPending || !apiKey.trim()}
                  className="btn-primary"
                >
                  {saveApiKeyMutation.isPending ? 'Saving...' : 'Save API Key'}
                </button>
                {config?.api_key_configured && (
                  <button
                    onClick={() => deleteApiKeyMutation.mutate()}
                    disabled={deleteApiKeyMutation.isPending}
                    className="btn-destructive"
                  >
                    {deleteApiKeyMutation.isPending ? 'Deleting...' : 'Delete API Key'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* License Tab */}
      {activeTab === 'license' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              License Information
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tier</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {config?.tier || 'Free'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {config?.license_status || 'Free'}
                  </p>
                </div>
              </div>

              {config?.tier !== 'free' && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to deactivate your license?')) {
                        deactivateLicenseMutation.mutate();
                      }
                    }}
                    disabled={deactivateLicenseMutation.isPending}
                    className="btn-destructive"
                  >
                    {deactivateLicenseMutation.isPending ? 'Deactivating...' : 'Deactivate License'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {config?.tier === 'free' && (
            <div className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Upgrade to Professional
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Unlock unlimited AI requests, advanced features, and priority support.
              </p>
              <button className="btn-primary">Upgrade Now</button>
            </div>
          )}
        </div>
      )}

      {/* About Tab */}
      {activeTab === 'about' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Parallax Intelligence Platform
              </h2>
              <p className="text-gray-500 dark:text-gray-400">Intelligence from every angle</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Version {config?.version || '1.0.0'}
              </p>
            </div>

            <div className="space-y-3">
              <InfoRow label="Platform" value={systemInfo?.os || 'Unknown'} />
              <InfoRow label="Architecture" value={systemInfo?.arch || 'Unknown'} />
              <InfoRow
                label="Memory"
                value={`${((systemInfo?.used_memory || 0) / 1024 / 1024 / 1024).toFixed(1)} GB / ${((systemInfo?.total_memory || 0) / 1024 / 1024 / 1024).toFixed(1)} GB`}
              />
              <InfoRow label="CPU Cores" value={(systemInfo?.cpu_count || 0).toString()} />
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-center gap-4">
                <a
                  href="https://github.com/yourusername/Parallax-OSINT-Platform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 hover:underline"
                >
                  GitHub
                </a>
                <a
                  href="https://docs.parallax.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 hover:underline"
                >
                  Documentation
                </a>
                <a
                  href="https://parallax.app/support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 hover:underline"
                >
                  Support
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}
