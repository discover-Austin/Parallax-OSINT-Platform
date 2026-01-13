import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MicrophoneIcon, SpeakerWaveIcon, StopIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
}

// Command interface
interface Command {
  patterns: string[];
  action: () => void;
  description: string;
  category: string;
}

export default function VoiceCommands() {
  const navigate = useNavigate();

  // State management
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // Settings
  const [language, setLanguage] = useState('en-US');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [continuousMode, setContinuousMode] = useState(false);

  // Refs
  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition || !window.speechSynthesis) {
      setIsSupported(false);
      setError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition() as SpeechRecognitionInterface;
    recognition.continuous = continuousMode;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      setError('');
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      let errorMessage = 'Speech recognition error: ';

      switch (event.error) {
        case 'no-speech':
          errorMessage += 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage += 'No microphone was found.';
          break;
        case 'not-allowed':
          errorMessage += 'Microphone permission denied.';
          break;
        case 'network':
          errorMessage += 'Network error occurred.';
          break;
        default:
          errorMessage += event.error;
      }

      setError(errorMessage);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          final += transcript;
          setConfidence(event.results[i][0].confidence);
        } else {
          interim += transcript;
        }
      }

      setInterimTranscript(interim);

      if (final) {
        setTranscript(final);
        processCommand(final);
      }
    };

    recognitionRef.current = recognition;
    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [language, continuousMode]);

  // Voice commands definition
  const commands: Command[] = [
    // Navigation
    {
      patterns: ['go to dashboard', 'open dashboard', 'show dashboard'],
      action: () => {
        navigate('/dashboard');
        speak('Opening dashboard');
      },
      description: 'Navigate to Dashboard',
      category: 'Navigation'
    },
    {
      patterns: ['go to builder', 'open builder', 'show builder', 'dork builder'],
      action: () => {
        navigate('/builder');
        speak('Opening Dork Builder');
      },
      description: 'Navigate to Dork Builder',
      category: 'Navigation'
    },
    {
      patterns: ['go to ai', 'open ai', 'ai generator', 'show ai generator'],
      action: () => {
        navigate('/ai');
        speak('Opening AI Generator');
      },
      description: 'Navigate to AI Generator',
      category: 'Navigation'
    },
    {
      patterns: ['go to library', 'open library', 'show library'],
      action: () => {
        navigate('/library');
        speak('Opening Library');
      },
      description: 'Navigate to Library',
      category: 'Navigation'
    },
    {
      patterns: ['go to graph', 'open graph', 'show graph', 'nexus graph'],
      action: () => {
        navigate('/graph');
        speak('Opening Nexus Graph');
      },
      description: 'Navigate to Nexus Graph',
      category: 'Navigation'
    },
    {
      patterns: ['go to terminal', 'open terminal', 'show terminal'],
      action: () => {
        navigate('/terminal');
        speak('Opening Terminal');
      },
      description: 'Navigate to Terminal',
      category: 'Navigation'
    },
    {
      patterns: ['go to image intel', 'open image intel', 'image intelligence'],
      action: () => {
        navigate('/image-intel');
        speak('Opening Image Intelligence');
      },
      description: 'Navigate to Image Intel',
      category: 'Navigation'
    },
    {
      patterns: ['go to settings', 'open settings', 'show settings'],
      action: () => {
        navigate('/settings');
        speak('Opening Settings');
      },
      description: 'Navigate to Settings',
      category: 'Navigation'
    },
    // System commands
    {
      patterns: ['stop listening', 'stop recording', 'deactivate'],
      action: () => {
        stopListening();
        speak('Voice recognition stopped');
      },
      description: 'Stop voice recognition',
      category: 'System'
    },
    {
      patterns: ['help', 'show commands', 'what can you do'],
      action: () => {
        speak('I can navigate to different pages, perform searches, and control the application. Say "show commands" to see all available commands.');
      },
      description: 'Show available commands',
      category: 'System'
    },
    {
      patterns: ['clear history', 'clear transcript', 'reset'],
      action: () => {
        setCommandHistory([]);
        setTranscript('');
        speak('History cleared');
      },
      description: 'Clear command history',
      category: 'System'
    }
  ];

  // Process voice command
  const processCommand = (text: string) => {
    const lowerText = text.toLowerCase().trim();

    // Add to history
    setCommandHistory(prev => [text, ...prev].slice(0, 10));

    // Find matching command
    for (const command of commands) {
      for (const pattern of command.patterns) {
        if (lowerText.includes(pattern)) {
          command.action();
          return;
        }
      }
    }

    // No command found
    speak('Sorry, I did not understand that command. Try saying "help" for available commands.');
  };

  // Text-to-speech
  const speak = (text: string) => {
    if (!voiceEnabled || !synthRef.current) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  // Start listening
  const startListening = () => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.start();
      speak('Listening');
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setError('Failed to start voice recognition');
    }
  };

  // Stop listening
  const stopListening = () => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.error('Failed to stop recognition:', error);
    }
  };

  // Group commands by category
  const groupedCommands = commands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {} as Record<string, Command[]>);

  if (!isSupported) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Voice Commands</h1>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
              Not Supported
            </h3>
            <p className="text-red-700 dark:text-red-300">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Voice Commands
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Control Parallax with your voice
            </p>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn-secondary flex items-center gap-2"
          >
            <Cog6ToothIcon className="w-5 h-5" />
            Settings
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Voice Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="input"
                  disabled={isListening}
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es-ES">Spanish</option>
                  <option value="fr-FR">French</option>
                  <option value="de-DE">German</option>
                  <option value="it-IT">Italian</option>
                  <option value="pt-BR">Portuguese (Brazil)</option>
                  <option value="ja-JP">Japanese</option>
                  <option value="zh-CN">Chinese (Simplified)</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Voice Feedback
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Enable text-to-speech responses
                  </p>
                </div>
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    voiceEnabled
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {voiceEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Continuous Mode
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Keep listening after each command
                  </p>
                </div>
                <button
                  onClick={() => setContinuousMode(!continuousMode)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    continuousMode
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                  disabled={isListening}
                >
                  {continuousMode ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Voice Control Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 mb-6">
          <div className="flex flex-col items-center">
            {/* Microphone Button */}
            <button
              onClick={isListening ? stopListening : startListening}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${
                isListening
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                  : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {isListening ? (
                <StopIcon className="w-12 h-12 text-white" />
              ) : (
                <MicrophoneIcon className="w-12 h-12 text-white" />
              )}

              {/* Pulse animation for listening state */}
              {isListening && (
                <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
              )}
            </button>

            {/* Status Text */}
            <div className="mt-6 text-center">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Click to start'}
              </p>

              {/* Live Transcript */}
              {(transcript || interimTranscript) && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg max-w-2xl">
                  <p className="text-gray-900 dark:text-white">
                    {transcript}
                    <span className="text-gray-400 dark:text-gray-500">{interimTranscript}</span>
                  </p>
                  {confidence > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Confidence: {(confidence * 100).toFixed(0)}%
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Speaking Indicator */}
            {isSpeaking && (
              <div className="mt-4 flex items-center gap-2 text-primary-600 dark:text-primary-400">
                <SpeakerWaveIcon className="w-5 h-5 animate-pulse" />
                <span className="text-sm">Speaking...</span>
              </div>
            )}
          </div>
        </div>

        {/* Command History */}
        {commandHistory.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Commands
              </h2>
              <button
                onClick={() => setCommandHistory([])}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Clear
              </button>
            </div>

            <div className="space-y-2">
              {commandHistory.map((cmd, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white"
                >
                  {cmd}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Commands */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Available Commands
          </h2>

          <div className="space-y-6">
            {Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-primary-600 dark:text-primary-400 mb-3">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {cmds.map((command, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <p className="font-medium text-gray-900 dark:text-white mb-2">
                        {command.description}
                      </p>
                      <div className="space-y-1">
                        {command.patterns.slice(0, 2).map((pattern, pIndex) => (
                          <p key={pIndex} className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                            "{pattern}"
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Tip:</strong> Make sure your microphone is enabled and try speaking clearly.
            Voice recognition works best in quiet environments.
          </p>
        </div>
      </div>
    </div>
  );
}
