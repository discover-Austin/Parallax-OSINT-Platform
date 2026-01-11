import { useState, useEffect, useMemo } from 'react';
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ClipboardDocumentIcon,
  TrashIcon,
  PencilSquareIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  CheckIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';
import { BookOpenIcon } from '@heroicons/react/24/solid';
import { DORK_TEMPLATES, TEMPLATE_CATEGORIES, type DorkTemplate } from '../data/dorkTemplates';
import { getAllDorks, saveDork, deleteDork, type DorkQuery } from '../services/tauri';
import { useNavigate } from 'react-router-dom';

type ViewMode = 'grid' | 'list';
type SortOption = 'recent' | 'name-asc' | 'name-desc' | 'category';

interface SavedDork extends DorkTemplate {
  saved_at: string;
  custom?: boolean;
}

export default function Library() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [selectedDorks, setSelectedDorks] = useState<Set<string>>(new Set());
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDork, setEditingDork] = useState<SavedDork | null>(null);
  const [dorks, setDorks] = useState<SavedDork[]>([]);

  // Load dorks on mount (combining templates + custom saved dorks)
  useEffect(() => {
    loadDorks();
  }, []);

  const loadDorks = async () => {
    try {
      // Load custom saved dorks from Rust backend vault
      const savedFromVault = await getAllDorks();
      const customDorks: SavedDork[] = savedFromVault.map(d => ({
        id: d.id,
        name: d.name,
        query: d.query,
        description: d.name, // Using name as description for now
        category: d.category,
        tags: d.tags,
        saved_at: d.created_at,
        custom: true,
      }));

      // Combine templates with custom dorks
      const templateDorks: SavedDork[] = DORK_TEMPLATES.map(t => ({
        ...t,
        saved_at: new Date().toISOString(),
        custom: false,
      }));

      setDorks([...customDorks, ...templateDorks]);
    } catch (error) {
      console.error('Failed to load dorks:', error);
      // Fallback to just templates if vault fails
      const templateDorks: SavedDork[] = DORK_TEMPLATES.map(t => ({
        ...t,
        saved_at: new Date().toISOString(),
        custom: false,
      }));
      setDorks(templateDorks);
    }
  };

  // Filter and sort dorks
  const filteredDorks = useMemo(() => {
    let result = [...dorks];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.name.toLowerCase().includes(query) ||
        d.query.toLowerCase().includes(query) ||
        d.description.toLowerCase().includes(query) ||
        d.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(d => d.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'recent':
        result.sort((a, b) => new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime());
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'category':
        result.sort((a, b) => a.category.localeCompare(b.category));
        break;
    }

    return result;
  }, [dorks, searchQuery, selectedCategory, sortBy]);

  // Stats
  const stats = useMemo(() => {
    const categories = new Set(dorks.map(d => d.category));
    return {
      total: dorks.length,
      categories: categories.size,
      custom: dorks.filter(d => d.custom).length,
    };
  }, [dorks]);

  const handleCopy = async (dork: string) => {
    try {
      await navigator.clipboard.writeText(dork);
      // Could show toast notification
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleTrySearch = (dork: string) => {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(dork)}`, '_blank');
  };

  const handleEdit = (dork: SavedDork) => {
    if (!dork.custom) {
      alert('Template dorks cannot be edited. Save a copy to customize.');
      return;
    }
    setEditingDork(dork);
    setShowEditModal(true);
  };

  const handleDelete = async (dorkId: string) => {
    const dork = dorks.find(d => d.id === dorkId);
    if (!dork?.custom) {
      alert('Template dorks cannot be deleted.');
      return;
    }

    if (confirm('Are you sure you want to delete this dork?')) {
      try {
        await deleteDork(dorkId);
        const updated = dorks.filter(d => d.id !== dorkId);
        setDorks(updated);
      } catch (error) {
        console.error('Failed to delete dork:', error);
        alert('Failed to delete dork. Please try again.');
      }
    }
  };

  const handleBulkDelete = async () => {
    const toDelete = Array.from(selectedDorks);
    const customToDelete = toDelete.filter(id => dorks.find(d => d.id === id)?.custom);

    if (customToDelete.length === 0) {
      alert('Only custom dorks can be deleted.');
      return;
    }

    if (confirm(`Delete ${customToDelete.length} custom dork(s)?`)) {
      try {
        // Delete each dork from backend
        await Promise.all(customToDelete.map(id => deleteDork(id)));
        const updated = dorks.filter(d => !selectedDorks.has(d.id));
        setDorks(updated);
        setSelectedDorks(new Set());
      } catch (error) {
        console.error('Failed to delete dorks:', error);
        alert('Failed to delete some dorks. Please try again.');
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedDorks.size === filteredDorks.length) {
      setSelectedDorks(new Set());
    } else {
      setSelectedDorks(new Set(filteredDorks.map(d => d.id)));
    }
  };

  const handleExport = () => {
    const toExport = dorks.filter(d => selectedDorks.size === 0 || selectedDorks.has(d.id));
    const json = JSON.stringify(toExport, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parallax-dorks-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const imported = JSON.parse(text) as SavedDork[];

        // Save each imported dork to backend
        let successCount = 0;
        for (const dork of imported) {
          try {
            await saveDork({
              id: dork.id,
              name: dork.name,
              query: dork.query,
              category: dork.category,
              tags: dork.tags,
              created_at: new Date().toISOString(),
            });
            successCount++;
          } catch (error) {
            console.error(`Failed to import dork ${dork.name}:`, error);
          }
        }

        // Reload dorks from backend
        await loadDorks();
        alert(`Imported ${successCount} of ${imported.length} dork(s)`);
      } catch (error) {
        alert('Failed to import file. Make sure it\'s a valid JSON file.');
      }
    };
    input.click();
  };

  const handleSaveEdit = async () => {
    if (!editingDork) return;

    try {
      await saveDork({
        id: editingDork.id,
        name: editingDork.name,
        query: editingDork.query,
        category: editingDork.category,
        tags: editingDork.tags,
        created_at: editingDork.saved_at,
      });

      // Update local state
      const updated = dorks.map(d => d.id === editingDork.id ? editingDork : d);
      setDorks(updated);
      setShowEditModal(false);
      setEditingDork(null);
    } catch (error) {
      console.error('Failed to save dork:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BookOpenIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Library</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stats.total} dorks • {stats.categories} categories
              </p>
            </div>
          </div>

          {/* View Toggle & Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleImport}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <ArrowUpTrayIcon className="w-4 h-4" />
              Import
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Export {selectedDorks.size > 0 ? `(${selectedDorks.size})` : ''}
            </button>

            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dorks..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            <option value="recent">Sort: Recent</option>
            <option value="name-asc">Sort: Name (A-Z)</option>
            <option value="name-desc">Sort: Name (Z-A)</option>
            <option value="category">Sort: Category</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 overflow-x-auto">
        <div className="flex gap-2 py-3">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              selectedCategory === 'All'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          {['All Categories', ...TEMPLATE_CATEGORIES].slice(1).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedDorks.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-6 py-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {selectedDorks.size} selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                <TrashIcon className="w-4 h-4" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedDorks(new Set())}
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="p-6">
        {filteredDorks.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery || selectedCategory !== 'All' ? 'No dorks found' : 'No dorks saved yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || selectedCategory !== 'All'
                ? 'Try adjusting your search or filters'
                : 'Start building queries or use AI to generate them'}
            </p>
            {!searchQuery && selectedCategory === 'All' && (
              <button
                onClick={() => navigate('/builder')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Your First Dork
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDorks.map((dork) => (
              <div
                key={dork.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                {/* Selection Checkbox */}
                <div className="flex items-start justify-between mb-3">
                  <input
                    type="checkbox"
                    checked={selectedDorks.has(dork.id)}
                    onChange={(e) => {
                      const newSet = new Set(selectedDorks);
                      if (e.target.checked) {
                        newSet.add(dork.id);
                      } else {
                        newSet.delete(dork.id);
                      }
                      setSelectedDorks(newSet);
                    }}
                    className="mt-1"
                  />
                  <div className="flex gap-1">
                    <span className={`px-2 py-1 text-xs rounded ${
                      dork.severity === 'Critical'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                        : dork.severity === 'High'
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200'
                        : dork.severity === 'Medium'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                    }`}>
                      {dork.severity}
                    </span>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{dork.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {dork.description}
                </p>

                <div className="bg-gray-50 dark:bg-gray-900 rounded p-2 mb-3">
                  <code className="text-xs text-purple-600 dark:text-purple-400 break-all line-clamp-2">
                    {dork.query}
                  </code>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {dork.tags.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {dork.tags.length > 3 && (
                    <span className="px-2 py-0.5 text-xs text-gray-500">
                      +{dork.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(dork.query)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <ClipboardDocumentIcon className="w-4 h-4" />
                    Copy
                  </button>
                  <button
                    onClick={() => handleTrySearch(dork.query)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <MagnifyingGlassIcon className="w-4 h-4" />
                    Search
                  </button>
                  {dork.custom && (
                    <>
                      <button
                        onClick={() => handleEdit(dork)}
                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(dork.id)}
                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedDorks.size === filteredDorks.length && filteredDorks.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Query</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Severity</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDorks.map((dork) => (
                  <tr key={dork.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedDorks.has(dork.id)}
                        onChange={(e) => {
                          const newSet = new Set(selectedDorks);
                          if (e.target.checked) {
                            newSet.add(dork.id);
                          } else {
                            newSet.delete(dork.id);
                          }
                          setSelectedDorks(newSet);
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{dork.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{dork.description}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{dork.category}</td>
                    <td className="px-4 py-3">
                      <code className="text-xs text-purple-600 dark:text-purple-400 line-clamp-1">{dork.query}</code>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded ${
                        dork.severity === 'Critical'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                          : dork.severity === 'High'
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200'
                          : dork.severity === 'Medium'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                      }`}>
                        {dork.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleCopy(dork.query)}
                          className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600"
                          title="Copy"
                        >
                          <ClipboardDocumentIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleTrySearch(dork.query)}
                          className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600"
                          title="Search"
                        >
                          <MagnifyingGlassIcon className="w-4 h-4" />
                        </button>
                        {dork.custom && (
                          <>
                            <button
                              onClick={() => handleEdit(dork)}
                              className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600"
                              title="Edit"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(dork.id)}
                              className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600"
                              title="Delete"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingDork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
            <div className="bg-blue-600 p-4 text-white flex items-center justify-between">
              <h2 className="text-xl font-bold">Edit Dork</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white/80 hover:text-white"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editingDork.name}
                  onChange={(e) => setEditingDork({ ...editingDork, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Query
                </label>
                <textarea
                  value={editingDork.query}
                  onChange={(e) => setEditingDork({ ...editingDork, query: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={editingDork.description}
                  onChange={(e) => setEditingDork({ ...editingDork, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
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
