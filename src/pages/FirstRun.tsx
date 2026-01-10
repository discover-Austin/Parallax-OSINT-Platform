import { useState } from 'react';
import { storeGeminiApiKey, activateLicense } from '../services/tauri';

type WizardStep = 'welcome' | 'license' | 'apikey' | 'complete';

export default function FirstRun({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<WizardStep>('welcome');
  const [licenseKey, setLicenseKey] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLicenseActivation = async () => {
    if (!licenseKey.trim()) {
      setError('Please enter a license key');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await activateLicense(licenseKey);
      setStep('apikey');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Activation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApiKeySetup = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your Gemini API key');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await storeGeminiApiKey(apiKey);
      setStep('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to store API key');
    } finally {
      setLoading(false);
    }
  };

  const skipLicense = () => setStep('apikey');
  const skipApiKey = () => setStep('complete');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-2xl w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          {/* Progress indicator */}
          <div className="flex justify-center mb-8">
            {['welcome', 'license', 'apikey', 'complete'].map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step === s || ['welcome', 'license', 'apikey', 'complete'].indexOf(step) > i
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}
                >
                  {i + 1}
                </div>
                {i < 3 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      ['welcome', 'license', 'apikey', 'complete'].indexOf(step) > i
                        ? 'bg-primary-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Welcome Step */}
          {step === 'welcome' && (
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to Parallax
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Intelligence from every angle
              </p>
              <div className="space-y-4 text-left mb-8">
                <Feature icon="🔍" title="Advanced Dork Builder" description="Create powerful search queries with ease" />
                <Feature icon="✨" title="AI-Powered Generation" description="Let Gemini create queries from natural language" />
                <Feature icon="🕸️" title="Nexus Graph" description="Visualize infrastructure relationships" />
                <Feature icon="🖼️" title="Image Intelligence" description="Extract insights from images" />
              </div>
              <button onClick={() => setStep('license')} className="btn-primary w-full text-lg py-3">
                Get Started
              </button>
            </div>
          )}

          {/* License Step */}
          {step === 'license' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Activate Your License
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Enter your license key to unlock premium features, or continue with the free tier.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    License Key
                  </label>
                  <input
                    type="text"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    placeholder="PRLX-XXXX-XXXX-XXXX-XXXX"
                    className="input w-full"
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleLicenseActivation}
                    disabled={loading || !licenseKey.trim()}
                    className="btn-primary flex-1"
                  >
                    {loading ? 'Activating...' : 'Activate License'}
                  </button>
                  <button onClick={skipLicense} className="btn-secondary flex-1" disabled={loading}>
                    Use Free Tier
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* API Key Step */}
          {step === 'apikey' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Configure Gemini AI
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Enter your Google Gemini API key to enable AI-powered features. Your key is stored securely in your system's credential manager.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIza..."
                    className="input w-full"
                    disabled={loading}
                  />
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

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleApiKeySetup}
                    disabled={loading || !apiKey.trim()}
                    className="btn-primary flex-1"
                  >
                    {loading ? 'Saving...' : 'Save API Key'}
                  </button>
                  <button onClick={skipApiKey} className="btn-secondary flex-1" disabled={loading}>
                    Skip for Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Complete Step */}
          {step === 'complete' && (
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                You're All Set!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Parallax is ready to help you gather intelligence from every angle.
              </p>
              <button onClick={onComplete} className="btn-primary w-full text-lg py-3">
                Start Exploring
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
          Need help?{' '}
          <a href="https://docs.parallax.app" className="text-primary-600 hover:underline">
            View Documentation
          </a>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-2xl">{icon}</div>
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
}
