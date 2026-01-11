import { useState, useEffect, useRef } from 'react';
import {
  PaperAirplaneIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  BookmarkIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { generateDork } from '../services/ai';
import {
  saveDork,
  getUsageStats,
  incrementAIUsage,
  canGenerateAI,
  getRemainingAIGenerations,
  saveConversation as saveConversationBackend,
  listConversations,
  type Conversation,
  type Message as BackendMessage,
} from '../services/tauri';
import { useLicense } from '../hooks/useLicense';
import { v4 as uuidv4 } from 'uuid';

// Use backend Message type but extend with error flag for UI
interface Message extends BackendMessage {
  error?: boolean;
}

const EXAMPLE_PROMPTS = [
  "Find exposed database backups",
  "Search for admin login pages",
  "Locate PDF documents about cybersecurity",
  "Find exposed .env files",
  "Search for camera feeds",
  "Find exposed Git repositories",
];

// Free tier constants
const FREE_TIER_DAILY_LIMIT = 10;

// Active conversation ID (for now, we'll use a single active conversation)
const ACTIVE_CONVERSATION_ID = 'active-ai-conversation';

export default function AIGenerator() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [remainingGenerations, setRemainingGenerations] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Use license hook for tier information
  const { tier, isPro, isLoading: licenseLoading } = useLicense();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversation history and usage stats on mount
  useEffect(() => {
    loadConversation();
    loadUsageStats();
  }, []);

  const loadConversation = async () => {
    try {
      const conversations = await listConversations(1);
      if (conversations.length > 0) {
        setMessages(conversations[0].messages as Message[]);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const saveConversation = async (msgs: Message[]) => {
    try {
      const conversation: Conversation = {
        id: ACTIVE_CONVERSATION_ID,
        title: msgs.length > 0 ? msgs[0].content.substring(0, 50) : 'New Conversation',
        messages: msgs,
        created_at: msgs[0]?.timestamp || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await saveConversationBackend(conversation);
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  };

  const loadUsageStats = async () => {
    try {
      const remaining = await getRemainingAIGenerations();
      setRemainingGenerations(remaining);
    } catch (error) {
      console.error('Failed to load usage stats:', error);
      setRemainingGenerations(0);
    }
  };

  const checkCanUseAI = async (): Promise<boolean> => {
    try {
      return await canGenerateAI();
    } catch (error) {
      console.error('Failed to check AI usage:', error);
      return false;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    // Check usage limits with backend
    const canUse = await checkCanUseAI();
    if (!canUse) {
      setShowUpgrade(true);
      return;
    }

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Generate dork using AI
      const response = await generateDork(input.trim());

      // Increment usage counter in backend
      const newCount = await incrementAIUsage();
      setRemainingGenerations(isPro ? Infinity : Math.max(0, FREE_TIER_DAILY_LIMIT - newCount));

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: response.explanation || `Here's a dork for that:\n\n${response.query}`,
        dork: response.query,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      await saveConversation(updatedMessages);
    } catch (error: any) {
      console.error('AI generation error:', error);

      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message || 'Failed to generate dork'}`,
        timestamp: new Date().toISOString(),
        error: true,
      };

      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
      await saveConversation(updatedMessages);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExampleClick = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleClear = async () => {
    if (confirm('Are you sure you want to clear the conversation?')) {
      setMessages([]);
      await saveConversation([]);
    }
  };

  const handleCopyDork = async (dork: string) => {
    try {
      await navigator.clipboard.writeText(dork);
      // Could show a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleSaveDork = async (dork: string, description: string) => {
    try {
      await saveDork({
        id: uuidv4(),
        name: description.substring(0, 50) + (description.length > 50 ? '...' : ''),
        query: dork,
        category: 'AI Generated',
        tags: ['AI Generated'],
        created_at: new Date().toISOString(),
      });
      // Could show a success notification here
    } catch (error) {
      console.error('Failed to save dork:', error);
    }
  };

  const handleTrySearch = (dork: string) => {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(dork)}`;
    window.open(searchUrl, '_blank');
  };

  const getRemainingGenerations = () => {
    if (isPro) return 'Unlimited';
    return remainingGenerations;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SparklesIcon className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Generator</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Natural language to Google dorks
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Remaining today</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {getRemainingGenerations()}
            </p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Clear conversation"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          /* Empty State with Examples */
          <div className="max-w-3xl mx-auto mt-12">
            <div className="text-center mb-8">
              <SparklesIcon className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Generate Google Dorks with AI
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Describe what you're looking for in plain English, and I'll create the perfect Google dork
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {EXAMPLE_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(prompt)}
                  className="p-4 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-md transition-all"
                >
                  <p className="text-sm text-gray-900 dark:text-white">{prompt}</p>
                </button>
              ))}
            </div>

            {tier === 'free' && (
              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 Free tier: {FREE_TIER_DAILY_LIMIT} AI generations per day.
                  <button
                    onClick={() => setShowUpgrade(true)}
                    className="ml-1 underline hover:no-underline"
                  >
                    Upgrade to Pro
                  </button> for unlimited generations.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Messages */
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : message.error
                      ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {/* Message content */}
                  <p className={`whitespace-pre-wrap ${
                    message.role === 'user'
                      ? 'text-white'
                      : message.error
                      ? 'text-red-800 dark:text-red-200'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {message.content}
                  </p>

                  {/* Dork display and actions (for assistant messages) */}
                  {message.role === 'assistant' && message.dork && !message.error && (
                    <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
                      <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 mb-3">
                        <code className="text-sm text-purple-600 dark:text-purple-400 break-all">
                          {message.dork}
                        </code>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopyDork(message.dork!)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <ClipboardDocumentIcon className="w-4 h-4" />
                          Copy
                        </button>
                        <button
                          onClick={() => handleSaveDork(message.dork!, message.content)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <BookmarkIcon className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={() => handleTrySearch(message.dork!)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                        >
                          <MagnifyingGlassIcon className="w-4 h-4" />
                          Try Search
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Error icon */}
                  {message.error && (
                    <div className="mt-2">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                    </div>
                  )}

                  {/* Timestamp */}
                  <p className={`text-xs mt-2 ${
                    message.role === 'user'
                      ? 'text-purple-200'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Generating...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your request... (e.g., 'Find exposed S3 buckets with SQL files')"
              className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={2}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white relative">
              <button
                onClick={() => setShowUpgrade(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold mb-2">Daily Limit Reached</h2>
              <p className="text-purple-100">
                You've used all {FREE_TIER_DAILY_LIMIT} AI generations for today. Upgrade to Pro for unlimited access!
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="border-2 border-purple-500 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20">
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-xl font-bold">Parallax Pro</h3>
                  <div>
                    <span className="text-3xl font-bold">$79</span>
                    <span className="text-gray-600 dark:text-gray-400 ml-1">one-time</span>
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Unlimited AI generations
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Unlimited vault storage
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    100+ pre-built templates
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Export to PDF/CSV/JSON
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Priority email support
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Lifetime updates
                  </li>
                </ul>
              </div>

              <a
                href="https://gumroad.com/l/parallax-pro"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold text-center hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Upgrade to Pro
              </a>

              <button
                onClick={() => setShowUpgrade(false)}
                className="block w-full text-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 py-2"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
