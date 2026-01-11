import { useState, useEffect } from 'react';
import {
  KeyIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import {
  storeGeminiApiKey,
  getGeminiApiKey,
  deleteGeminiApiKey,
  validateLicense,
  activateLicense,
  deactivateLicense,
} from '../services/tauri';
import { useLicense } from '../hooks/useLicense';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [apiKeyStatus, setApiKeyStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [apiKeyMessage, setApiKeyMessage] = useState('');

  const [licenseKey, setLicenseKey] = useState('');
  const [licenseStatus, setLicenseStatus] = useState<'idle' | 'activating' | 'success' | 'error'>('idle');
  const [licenseMessage, setLicenseMessage] = useState('');

  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const { tier, refreshLicense } = useLicense();

  // Load existing API key on mount
  useEffect(() => {
    loadApiKey();
    loadTheme();
  }, []);

  const loadApiKey = async () => {
    try {
      const key = await getGeminiApiKey();
      if (key) {
        // Show partial key for security
        setApiKey(key.substring(0, 10) + '...' + key.substring(key.length - 4));
        setApiKeyStatus('success');
        setApiKeyMessage('API key is configured');
      }
    } catch (error) {
      // No key found - that's okay
      console.log('No API key configured yet');
    }
  };

  const loadTheme = () => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  };

  const applyTheme = (newTheme: 'light' | 'dark') => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', newTheme);
  };

  const handleSaveApiKey = async () => {
    if (!apiKey || apiKey.length < 20) {
      setApiKeyStatus('error');
      setApiKeyMessage('Please enter a valid API key');
      return;
    }

    setApiKeyStatus('saving');
    setApiKeyMessage('');

    try {
      await storeGeminiApiKey(apiKey);
      setApiKeyStatus('success');
      setApiKeyMessage('API key saved successfully!');

      // Clear the input after a few seconds
      setTimeout(() => {
        setApiKeyMessage('API key is configured');
      }, 3000);
    } catch (error) {
      setApiKeyStatus('error');
      setApiKeyMessage(error instanceof Error ? error.message : 'Failed to save API key');
    }
  };

  const handleDeleteApiKey = async () => {
    if (!confirm('Are you sure you want to delete your API key?')) {
      return;
    }

    try {
      await deleteGeminiApiKey();
      setApiKey('');
      setApiKeyStatus('idle');
      setApiKeyMessage('');
    } catch (error) {
      setApiKeyStatus('error');
      setApiKeyMessage('Failed to delete API key');
    }
  };

  const handleActivateLicense = async () => {
    if (!licenseKey || licenseKey.length < 10) {
      setLicenseStatus('error');
      setLicenseMessage('Please enter a valid license key');
      return;
    }

    setLicenseStatus('activating');
    setLicenseMessage('');

    try {
      const result = await activateLicense(licenseKey);
      setLicenseStatus('success');
      setLicenseMessage(`License activated! Tier: ${result.tier}`);
      setLicenseKey('');
      await refreshLicense();

      setTimeout(() => {
        setLicenseMessage('');
        setLicenseStatus('idle');
      }, 5000);
    } catch (error) {
      setLicenseStatus('error');
      setLicenseMessage(error instanceof Error ? error.message : 'Failed to activate license');
    }
  };

  const handleDeactivateLicense = async () => {
    if (!confirm('Are you sure you want to deactivate your license?')) {
      return;
    }

    try {
      await deactivateLicense();
      setLicenseStatus('success');
      setLicenseMessage('License deactivated');
      await refreshLicense();
    } catch (error) {
      setLicenseStatus('error');
      setLicenseMessage('Failed to deactivate license');
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Configure your Parallax Intelligence Platform
        </p>

        <div className="space-y-6">
          {/* API Configuration */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <KeyIcon className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                API Configuration
              </h2>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter your Google Gemini API key to enable AI-powered dork generation.
              Get a free key at{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline"
              >
                https://aistudio.google.com/app/apikey
              </a>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gemini API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIza..."
                    className="input flex-1"
                    disabled={apiKeyStatus === 'saving'}
                  />
                  <button
                    onClick={handleSaveApiKey}
                    disabled={apiKeyStatus === 'saving'}
                    className="btn-primary"
                  >
                    {apiKeyStatus === 'saving' ? 'Saving...' : 'Save'}
                  </button>
                  {apiKeyStatus === 'success' && (
                    <button
                      onClick={handleDeleteApiKey}
                      className="btn-destructive"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {apiKeyMessage && (
                <div
                  className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
                    apiKeyStatus === 'success'
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                  }`}
                >
                  {apiKeyStatus === 'success' ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    <ExclamationCircleIcon className="w-5 h-5" />
                  )}
                  {apiKeyMessage}
                </div>
              )}
            </div>
          </div>

          {/* License Management */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                License Management
              </h2>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Tier</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {tier}
                  </p>
                </div>
                {tier !== 'free' && (
                  <button
                    onClick={handleDeactivateLicense}
                    className="btn-ghost text-sm"
                  >
                    Deactivate
                  </button>
                )}
              </div>
            </div>

            {tier === 'free' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enter your license key to unlock Pro features.
                  Purchase at{' '}
                  <a
                    href="https://gumroad.com/l/parallax-pro"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Gumroad
                  </a>
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    License Key
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={licenseKey}
                      onChange={(e) => setLicenseKey(e.target.value)}
                      placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
                      className="input flex-1"
                      disabled={licenseStatus === 'activating'}
                    />
                    <button
                      onClick={handleActivateLicense}
                      disabled={licenseStatus === 'activating'}
                      className="btn-primary"
                    >
                      {licenseStatus === 'activating' ? 'Activating...' : 'Activate'}
                    </button>
                  </div>
                </div>

                {licenseMessage && (
                  <div
                    className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
                      licenseStatus === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                    }`}
                  >
                    {licenseStatus === 'success' ? (
                      <CheckCircleIcon className="w-5 h-5" />
                    ) : (
                      <ExclamationCircleIcon className="w-5 h-5" />
                    )}
                    {licenseMessage}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Appearance */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <PaintBrushIcon className="w-6 h-6 text-pink-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Appearance
              </h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                    theme === 'light'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  ☀️ Light
                </button>
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                    theme === 'dark'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  🌙 Dark
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
