import { SparklesIcon } from '@heroicons/react/24/outline';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

/**
 * LoadingScreen component for displaying loading states
 *
 * Usage:
 * ```tsx
 * <LoadingScreen message="Loading application..." />
 * <LoadingScreen message="Syncing data..." fullScreen={false} />
 * ```
 */
export function LoadingScreen({
  message = 'Loading...',
  fullScreen = true
}: LoadingScreenProps) {
  const containerClass = fullScreen
    ? 'min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClass}>
      <div className="text-center">
        {/* Animated logo/icon */}
        <div className="relative mb-6">
          <SparklesIcon className="w-16 h-16 text-purple-600 mx-auto animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 border-4 border-purple-200 dark:border-purple-900 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Loading message */}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Parallax Intelligence Platform
        </h2>
        <p className="text-gray-600 dark:text-gray-400">{message}</p>

        {/* Loading dots animation */}
        <div className="flex justify-center gap-1 mt-4">
          <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline loading spinner for use within components
 */
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`${sizeClasses[size]} border-purple-200 dark:border-purple-900 border-t-purple-600 rounded-full animate-spin`}></div>
  );
}

export default LoadingScreen;
