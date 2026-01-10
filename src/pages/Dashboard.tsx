import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAppConfig, getAllDorks } from '../services/tauri';

export default function Dashboard() {
  const [greeting, setGreeting] = useState('');

  const { data: config } = useQuery({
    queryKey: ['appConfig'],
    queryFn: getAppConfig,
  });

  const { data: dorks } = useQuery({
    queryKey: ['dorks'],
    queryFn: getAllDorks,
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {greeting}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome to Parallax Intelligence Platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Version"
          value={config?.version || 'Loading...'}
          icon="🚀"
        />
        <StatsCard
          title="License Tier"
          value={config?.tier || 'Free'}
          icon="⭐"
        />
        <StatsCard
          title="Saved Dorks"
          value={dorks?.length?.toString() || '0'}
          icon="📚"
        />
        <StatsCard
          title="API Status"
          value={config?.api_key_configured ? 'Configured' : 'Not Set'}
          icon={config?.api_key_configured ? '✅' : '⚠️'}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionButton
            title="Build a Dork"
            description="Create custom search queries"
            href="/builder"
            icon="🔧"
          />
          <QuickActionButton
            title="AI Generator"
            description="Generate dorks with AI"
            href="/ai"
            icon="✨"
          />
          <QuickActionButton
            title="Browse Library"
            description="Explore saved queries"
            href="/library"
            icon="📖"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Recent Dorks
        </h2>
        {dorks && dorks.length > 0 ? (
          <div className="space-y-3">
            {dorks.slice(0, 5).map((dork) => (
              <div
                key={dork.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {dork.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {dork.query}
                  </p>
                </div>
                <span className="px-2 py-1 text-xs rounded bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400">
                  {dork.category}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No dorks saved yet. Create your first one!
          </p>
        )}
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function QuickActionButton({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
}) {
  return (
    <a
      href={href}
      className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
    >
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </a>
  );
}
