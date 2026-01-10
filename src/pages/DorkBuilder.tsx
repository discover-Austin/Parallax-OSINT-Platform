import { useState } from 'react';
import { saveDork } from '../services/tauri';
import { v4 as uuidv4 } from 'uuid';

interface Operator {
  name: string;
  syntax: string;
  description: string;
  example: string;
  category: 'Basic' | 'Files' | 'Content' | 'URL' | 'Advanced';
}

const OPERATORS: Operator[] = [
  // Basic
  { name: 'Site', syntax: 'site:', description: 'Search within a specific domain', example: 'site:example.com', category: 'Basic' },
  { name: 'Intitle', syntax: 'intitle:', description: 'Search for terms in page title', example: 'intitle:"index of"', category: 'Basic' },
  { name: 'Inurl', syntax: 'inurl:', description: 'Search for terms in URL', example: 'inurl:admin', category: 'Basic' },
  { name: 'Intext', syntax: 'intext:', description: 'Search for terms in page body', example: 'intext:password', category: 'Basic' },

  // Files
  { name: 'Filetype', syntax: 'filetype:', description: 'Search for specific file types', example: 'filetype:pdf', category: 'Files' },
  { name: 'Ext', syntax: 'ext:', description: 'Search for file extensions', example: 'ext:sql', category: 'Files' },

  // Content
  { name: 'Allintitle', syntax: 'allintitle:', description: 'All terms must be in title', example: 'allintitle:admin panel login', category: 'Content' },
  { name: 'Allinurl', syntax: 'allinurl:', description: 'All terms must be in URL', example: 'allinurl:admin php', category: 'Content' },
  { name: 'Allintext', syntax: 'allintext:', description: 'All terms must be in text', example: 'allintext:username password', category: 'Content' },

  // URL
  { name: 'Inanchor', syntax: 'inanchor:', description: 'Search in link anchor text', example: 'inanchor:click here', category: 'URL' },
  { name: 'Cache', syntax: 'cache:', description: 'View cached version of page', example: 'cache:example.com', category: 'URL' },

  // Advanced
  { name: 'Related', syntax: 'related:', description: 'Find related websites', example: 'related:github.com', category: 'Advanced' },
  { name: 'Info', syntax: 'info:', description: 'Get info about a page', example: 'info:example.com', category: 'Advanced' },
  { name: 'Define', syntax: 'define:', description: 'Get definition of a term', example: 'define:phishing', category: 'Advanced' },
];

const TEMPLATES = [
  {
    name: 'Exposed Directories',
    query: 'intitle:"index of" inurl:ftp',
    description: 'Find exposed FTP directories',
    category: 'Files',
  },
  {
    name: 'Login Pages',
    query: 'inurl:admin inurl:login',
    description: 'Find admin login pages',
    category: 'Authentication',
  },
  {
    name: 'Database Files',
    query: 'filetype:sql intext:password',
    description: 'Find SQL files containing passwords',
    category: 'Databases',
  },
  {
    name: 'Configuration Files',
    query: 'ext:env OR ext:config intext:api_key',
    description: 'Find configuration files with API keys',
    category: 'Files',
  },
];

export default function DorkBuilder() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [dorkName, setDorkName] = useState('');
  const [savingCategory, setSavingCategory] = useState('General');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const categories = ['All', ...Array.from(new Set(OPERATORS.map(op => op.category)))];

  const filteredOperators = selectedCategory === 'All'
    ? OPERATORS
    : OPERATORS.filter(op => op.category === selectedCategory);

  const addOperator = (operator: Operator) => {
    const newQuery = query ? `${query} ${operator.syntax}` : operator.syntax;
    setQuery(newQuery);
  };

  const loadTemplate = (template: typeof TEMPLATES[0]) => {
    setQuery(template.query);
  };

  const handleSave = async () => {
    if (!dorkName.trim() || !query.trim()) {
      return;
    }

    try {
      await saveDork({
        id: uuidv4(),
        name: dorkName,
        query: query,
        category: savingCategory,
        tags: [],
        created_at: new Date().toISOString(),
      });

      setSuccessMessage('Dork saved successfully!');
      setShowSaveDialog(false);
      setDorkName('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save dork:', error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(query);
    setSuccessMessage('Copied to clipboard!');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  const executeSearch = () => {
    if (query.trim()) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dork Builder
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Construct advanced search queries with powerful operators
        </p>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-lg">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Operators */}
        <div className="lg:col-span-2 space-y-6">
          {/* Query Builder */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Query Builder
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Query
                </label>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Start building your dork query..."
                  className="textarea w-full h-24 font-mono text-sm"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <button onClick={executeSearch} disabled={!query.trim()} className="btn-primary">
                  🔍 Search on Google
                </button>
                <button onClick={copyToClipboard} disabled={!query.trim()} className="btn-secondary">
                  📋 Copy Query
                </button>
                <button
                  onClick={() => setShowSaveDialog(true)}
                  disabled={!query.trim()}
                  className="btn-secondary"
                >
                  💾 Save to Library
                </button>
                <button onClick={() => setQuery('')} className="btn-ghost">
                  🗑️ Clear
                </button>
              </div>
            </div>
          </div>

          {/* Operators */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Operators
              </h2>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input w-auto"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredOperators.map((op) => (
                <button
                  key={op.name}
                  onClick={() => addOperator(op)}
                  className="text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {op.name}
                    </span>
                    <code className="text-xs text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/20 px-2 py-1 rounded">
                      {op.syntax}
                    </code>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {op.description}
                  </p>
                  <code className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                    {op.example}
                  </code>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Templates & Tips */}
        <div className="space-y-6">
          {/* Templates */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Templates
            </h2>
            <div className="space-y-2">
              {TEMPLATES.map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => loadTemplate(template)}
                  className="w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
                >
                  <div className="font-semibold text-gray-900 dark:text-white mb-1">
                    {template.name}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {template.description}
                  </p>
                  <code className="text-xs text-gray-500 dark:text-gray-500 font-mono block truncate">
                    {template.query}
                  </code>
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              💡 Pro Tips
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• Use quotes for exact phrases</li>
              <li>• Combine operators with AND, OR, -</li>
              <li>• Use * as a wildcard</li>
              <li>• Test queries before running</li>
              <li>• Save useful queries to your library</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Save Dork Query
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={dorkName}
                  onChange={(e) => setDorkName(e.target.value)}
                  placeholder="e.g., Exposed Admin Panels"
                  className="input w-full"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={savingCategory}
                  onChange={(e) => setSavingCategory(e.target.value)}
                  className="input w-full"
                >
                  <option value="General">General</option>
                  <option value="Files">Files</option>
                  <option value="Authentication">Authentication</option>
                  <option value="Databases">Databases</option>
                  <option value="Vulnerabilities">Vulnerabilities</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Query Preview
                </label>
                <code className="block p-3 bg-gray-100 dark:bg-gray-900 rounded text-sm font-mono text-gray-900 dark:text-white">
                  {query}
                </code>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={handleSave} disabled={!dorkName.trim()} className="btn-primary flex-1">
                  Save
                </button>
                <button onClick={() => setShowSaveDialog(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
