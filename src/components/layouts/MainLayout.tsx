import { Outlet, NavLink } from 'react-router-dom';
import {
  HomeIcon,
  WrenchScrewdriverIcon,
  SparklesIcon,
  BookOpenIcon,
  ShareIcon,
  CommandLineIcon,
  PhotoIcon,
  MicrophoneIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Builder', href: '/builder', icon: WrenchScrewdriverIcon },
  { name: 'AI Generator', href: '/ai', icon: SparklesIcon },
  { name: 'Library', href: '/library', icon: BookOpenIcon },
  { name: 'Nexus Graph', href: '/graph', icon: ShareIcon },
  { name: 'Terminal', href: '/terminal', icon: CommandLineIcon },
  { name: 'Image Intel', href: '/image-intel', icon: PhotoIcon },
  { name: 'Voice', href: '/voice', icon: MicrophoneIcon },
];

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
            Parallax
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-900 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}

          {/* Settings at bottom */}
          <div className="absolute bottom-4 left-4 right-4">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-900 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`
              }
            >
              <Cog6ToothIcon className="w-5 h-5 mr-3" />
              Settings
            </NavLink>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
