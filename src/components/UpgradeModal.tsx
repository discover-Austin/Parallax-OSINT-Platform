import { XMarkIcon } from '@heroicons/react/24/outline';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: 'ai_limit' | 'vault_limit' | 'feature';
  currentTier?: string;
}

const MESSAGES = {
  ai_limit: {
    title: 'Daily AI Generation Limit Reached',
    description: "You've used all 10 AI generations for today. Upgrade to Pro for unlimited generations.",
  },
  vault_limit: {
    title: 'Vault Storage Limit Reached',
    description: "You've saved 50 dorks (free tier limit). Upgrade to Pro for unlimited storage.",
  },
  feature: {
    title: 'Pro Feature',
    description: 'This feature is only available in the Pro version.',
  },
};

export default function UpgradeModal({
  isOpen,
  onClose,
  reason = 'feature',
  currentTier: _currentTier = 'free'
}: UpgradeModalProps) {
  if (!isOpen) return null;

  const msg = MESSAGES[reason];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold mb-2">{msg.title}</h2>
          <p className="text-blue-100">{msg.description}</p>
        </div>

        {/* Pricing */}
        <div className="p-6 space-y-4">
          <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Parallax Pro</h3>
              <div>
                <span className="text-3xl font-bold text-gray-900 dark:text-white">$79</span>
                <span className="text-gray-600 dark:text-gray-400 ml-1 text-sm">one-time</span>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-center">
                <span className="text-green-500 mr-2 text-lg">✓</span>
                Unlimited AI generations
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2 text-lg">✓</span>
                Unlimited vault storage
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2 text-lg">✓</span>
                100+ pre-built templates
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2 text-lg">✓</span>
                Export to PDF/CSV/JSON
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2 text-lg">✓</span>
                Priority email support
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2 text-lg">✓</span>
                Lifetime updates
              </li>
            </ul>
          </div>

          {/* CTA */}
          <a
            href="https://gumroad.com/l/parallax-pro"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold text-center hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            Upgrade to Pro
          </a>

          <button
            onClick={onClose}
            className="block w-full text-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 py-2 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
