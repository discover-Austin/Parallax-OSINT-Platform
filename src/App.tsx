import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import * as Sentry from '@sentry/react';

// Layouts
import MainLayout from './components/layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import DorkBuilder from './pages/DorkBuilder';
import AIGenerator from './pages/AIGenerator';
import Library from './pages/Library';
import NexusGraph from './pages/NexusGraph';
import Terminal from './pages/Terminal';
import ImageIntel from './pages/ImageIntel';
import VoiceCommands from './pages/VoiceCommands';
import Settings from './pages/Settings';
import FirstRun from './pages/FirstRun';

// Services
import { getAppConfig } from './services/tauri';
import { initializeGemini } from './services/gemini';

// Styles
import './styles/globals.css';

// Initialize Sentry for error tracking (production only)
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function ErrorFallback({ error, resetErrorBoundary }: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-red-600 dark:text-red-400 mb-4">
          <svg
            className="w-12 h-12 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          Something went wrong
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">
          {error.message}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="w-full btn-primary"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  async function initializeApp() {
    try {
      // Get app configuration
      const config = await getAppConfig();

      // Check if this is first run (no API key or license)
      if (!config.api_key_configured && config.license_status === 'free') {
        setIsFirstRun(true);
      } else {
        // Initialize Gemini if API key is configured
        if (config.api_key_configured) {
          try {
            await initializeGemini();
          } catch (error) {
            console.error('Failed to initialize Gemini:', error);
            // Non-fatal error - user can configure later
          }
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('App initialization failed:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Loading Parallax Intelligence Platform...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
            Initialization Error
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full btn-primary"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  if (isFirstRun) {
    return <FirstRun onComplete={() => setIsFirstRun(false)} />;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="builder" element={<DorkBuilder />} />
              <Route path="ai" element={<AIGenerator />} />
              <Route path="library" element={<Library />} />
              <Route path="graph" element={<NexusGraph />} />
              <Route path="terminal" element={<Terminal />} />
              <Route path="image-intel" element={<ImageIntel />} />
              <Route path="voice" element={<VoiceCommands />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
