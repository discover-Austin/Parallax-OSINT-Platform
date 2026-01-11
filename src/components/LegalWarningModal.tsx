import { useState } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface LegalWarningModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onCancel: () => void;
  dorkName: string;
  warning: string;
}

export function LegalWarningModal({
  isOpen,
  onAccept,
  onCancel,
  dorkName,
  warning,
}: LegalWarningModalProps) {
  const [accepted, setAccepted] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleAccept = () => {
    if (dontShowAgain) {
      sessionStorage.setItem('skipLegalWarning', 'true');
    }
    onAccept();
    setAccepted(false);
    setDontShowAgain(false);
  };

  const handleCancel = () => {
    onCancel();
    setAccepted(false);
    setDontShowAgain(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Legal Warning
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Dork Name */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
              High-Risk Dork: {dorkName}
            </p>
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              This dork may access sensitive or restricted information.
            </p>
          </div>

          {/* Warning Message */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm font-bold text-red-900 dark:text-red-100 mb-2">
              ⚠️ You MUST have authorization
            </p>
            <p className="text-xs text-red-800 dark:text-red-200 mb-3">
              {warning}
            </p>
            <ul className="text-xs text-red-800 dark:text-red-200 space-y-1 list-disc list-inside">
              <li>Unauthorized access is illegal under CFAA and similar laws</li>
              <li>You may face criminal prosecution and civil liability</li>
              <li>Only use on systems you own or have permission to test</li>
            </ul>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                I have explicit written authorization to perform this search on the target
                systems
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="mt-1 w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Don't show this warning again this session
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAccept}
            disabled={!accepted}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition ${
              accepted
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            I Accept Responsibility
          </button>
        </div>
      </div>
    </div>
  );
}
