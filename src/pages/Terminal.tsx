import { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { invoke } from '@tauri-apps/api/core';
import 'xterm/css/xterm.css';

export default function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentLine, setCurrentLine] = useState('');

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    // Initialize XTerm with VSCode theme
    const term = new XTerm({
      cursorBlink: true,
      cursorStyle: 'block',
      fontFamily: '"Cascadia Code", "Fira Code", "Courier New", monospace',
      fontSize: 14,
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#e5e5e5',
      },
      lineHeight: 1.2,
      scrollback: 1000,
      tabStopWidth: 4,
    });

    // Initialize FitAddon
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    // Open terminal
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Welcome message
    term.writeln('\x1b[1;36m╔══════════════════════════════════════════════════════════╗\x1b[0m');
    term.writeln('\x1b[1;36m║       Parallax Intelligence Platform - Terminal         ║\x1b[0m');
    term.writeln('\x1b[1;36m╚══════════════════════════════════════════════════════════╝\x1b[0m');
    term.writeln('');
    term.writeln('\x1b[1;33mType "help" for available commands\x1b[0m');
    term.writeln('');
    writePrompt(term);

    // Handle input
    let currentCommand = '';
    let cursorPosition = 0;

    term.onData((data) => {
      const code = data.charCodeAt(0);

      // Handle Enter
      if (code === 13) {
        term.writeln('');
        if (currentCommand.trim()) {
          handleCommand(term, currentCommand.trim());
          setCommandHistory((prev) => [...prev, currentCommand.trim()]);
          setHistoryIndex(-1);
        } else {
          writePrompt(term);
        }
        currentCommand = '';
        cursorPosition = 0;
        setCurrentLine('');
        return;
      }

      // Handle Backspace
      if (code === 127) {
        if (cursorPosition > 0) {
          currentCommand = currentCommand.slice(0, cursorPosition - 1) + currentCommand.slice(cursorPosition);
          cursorPosition--;
          term.write('\b \b');
          setCurrentLine(currentCommand);
        }
        return;
      }

      // Handle Ctrl+C
      if (code === 3) {
        term.writeln('^C');
        currentCommand = '';
        cursorPosition = 0;
        writePrompt(term);
        setCurrentLine('');
        return;
      }

      // Handle Ctrl+L (clear)
      if (code === 12) {
        term.clear();
        writePrompt(term);
        return;
      }

      // Handle Arrow Up (history)
      if (data === '\x1b[A') {
        if (commandHistory.length > 0) {
          const newIndex = historyIndex < 0 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
          setHistoryIndex(newIndex);
          const historicalCommand = commandHistory[newIndex];

          // Clear current line
          term.write('\x1b[2K\r');
          writePrompt(term);
          term.write(historicalCommand);

          currentCommand = historicalCommand;
          cursorPosition = historicalCommand.length;
          setCurrentLine(currentCommand);
        }
        return;
      }

      // Handle Arrow Down (history)
      if (data === '\x1b[B') {
        if (historyIndex >= 0) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);

          let historicalCommand = '';
          if (newIndex < commandHistory.length) {
            historicalCommand = commandHistory[newIndex];
          }

          // Clear current line
          term.write('\x1b[2K\r');
          writePrompt(term);
          term.write(historicalCommand);

          currentCommand = historicalCommand;
          cursorPosition = historicalCommand.length;
          setCurrentLine(currentCommand);
        }
        return;
      }

      // Handle printable characters
      if (code >= 32 && code < 127) {
        currentCommand = currentCommand.slice(0, cursorPosition) + data + currentCommand.slice(cursorPosition);
        cursorPosition++;
        term.write(data);
        setCurrentLine(currentCommand);
      }
    });

    // Handle window resize
    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  const writePrompt = (term: XTerm) => {
    term.write('\x1b[1;32m$\x1b[0m ');
  };

  const handleCommand = async (term: XTerm, command: string) => {
    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    try {
      switch (cmd) {
        case 'help':
          term.writeln('\x1b[1;36mAvailable Commands:\x1b[0m');
          term.writeln('');
          term.writeln('  \x1b[1;33mhelp\x1b[0m              Show this help message');
          term.writeln('  \x1b[1;33mclear\x1b[0m             Clear the terminal screen');
          term.writeln('  \x1b[1;33mdork <query>\x1b[0m      Perform a dork search');
          term.writeln('  \x1b[1;33mlibrary\x1b[0m           List all saved dorks');
          term.writeln('  \x1b[1;33mexport <format>\x1b[0m   Export data (json|csv|pdf)');
          term.writeln('  \x1b[1;33mlicense\x1b[0m           Show license status');
          term.writeln('  \x1b[1;33mwhoami\x1b[0m            Show current user information');
          term.writeln('  \x1b[1;33mdate\x1b[0m              Show current date and time');
          term.writeln('  \x1b[1;33mecho <text>\x1b[0m       Echo text back');
          term.writeln('  \x1b[1;33mversion\x1b[0m           Show app version');
          term.writeln('  \x1b[1;33msysinfo\x1b[0m           Show system information');
          break;

        case 'clear':
          term.clear();
          break;

        case 'dork':
          if (args.length === 0) {
            term.writeln('\x1b[1;31mError: Please provide a search query\x1b[0m');
            term.writeln('Usage: dork <query>');
          } else {
            const query = args.join(' ');
            term.writeln(`\x1b[1;36mSearching for:\x1b[0m ${query}`);
            const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            await invoke('open_external_url', { url });
            term.writeln('\x1b[1;32m✓ Opened in browser\x1b[0m');
          }
          break;

        case 'library':
          term.writeln('\x1b[1;36mFetching saved dorks...\x1b[0m');
          try {
            const dorks = await invoke<any[]>('get_all_dorks');
            term.writeln('');
            term.writeln(`\x1b[1;33mTotal saved dorks: ${dorks.length}\x1b[0m`);
            term.writeln('');
            dorks.slice(0, 10).forEach((dork, index) => {
              term.writeln(`  ${index + 1}. \x1b[1;36m${dork.name}\x1b[0m`);
              term.writeln(`     ${dork.query.substring(0, 60)}${dork.query.length > 60 ? '...' : ''}`);
            });
            if (dorks.length > 10) {
              term.writeln(`  ... and ${dorks.length - 10} more`);
            }
          } catch (error) {
            term.writeln(`\x1b[1;31mError: ${error}\x1b[0m`);
          }
          break;

        case 'export':
          if (args.length === 0) {
            term.writeln('\x1b[1;31mError: Please specify format (json|csv|pdf)\x1b[0m');
            term.writeln('Usage: export <format>');
          } else {
            const format = args[0].toLowerCase();
            if (!['json', 'csv', 'pdf'].includes(format)) {
              term.writeln('\x1b[1;31mError: Invalid format. Use json, csv, or pdf\x1b[0m');
            } else {
              term.writeln(`\x1b[1;36mExporting data as ${format.toUpperCase()}...\x1b[0m`);
              try {
                const dorks = await invoke<any[]>('get_all_dorks');
                const filename = `parallax-export-${Date.now()}.${format}`;
                const filepath = await invoke<string>('export_data', {
                  options: {
                    format,
                    data: dorks,
                    filename,
                    metadata: {
                      title: 'Parallax Dork Library Export',
                      description: 'Exported from Parallax Intelligence Platform',
                    },
                  },
                });
                term.writeln(`\x1b[1;32m✓ Exported to: ${filepath}\x1b[0m`);
              } catch (error) {
                term.writeln(`\x1b[1;31mError: ${error}\x1b[0m`);
              }
            }
          }
          break;

        case 'license':
          term.writeln('\x1b[1;36mChecking license status...\x1b[0m');
          try {
            const config = await invoke<any>('get_app_config');
            term.writeln('');
            term.writeln(`  License Status: \x1b[1;33m${config.license_status}\x1b[0m`);
            term.writeln(`  Current Tier:   \x1b[1;33m${config.tier}\x1b[0m`);
          } catch (error) {
            term.writeln(`\x1b[1;31mError: ${error}\x1b[0m`);
          }
          break;

        case 'whoami':
          term.writeln(`\x1b[1;36m${process.env.USER || process.env.USERNAME || 'user'}\x1b[0m`);
          break;

        case 'date':
          const now = new Date();
          term.writeln(`\x1b[1;36m${now.toLocaleString()}\x1b[0m`);
          break;

        case 'echo':
          term.writeln(args.join(' '));
          break;

        case 'version':
          try {
            const config = await invoke<any>('get_app_config');
            term.writeln(`\x1b[1;36mParallax v${config.version}\x1b[0m`);
          } catch (error) {
            term.writeln(`\x1b[1;31mError: ${error}\x1b[0m`);
          }
          break;

        case 'sysinfo':
          term.writeln('\x1b[1;36mSystem Information:\x1b[0m');
          try {
            const info = await invoke<any>('get_system_info');
            term.writeln('');
            term.writeln(`  OS:           \x1b[1;33m${info.os}\x1b[0m`);
            term.writeln(`  Architecture: \x1b[1;33m${info.arch}\x1b[0m`);
            term.writeln(`  CPU Cores:    \x1b[1;33m${info.cpu_count}\x1b[0m`);
            term.writeln(`  Total Memory: \x1b[1;33m${Math.round(info.total_memory / 1024 / 1024)} MB\x1b[0m`);
            term.writeln(`  Used Memory:  \x1b[1;33m${Math.round(info.used_memory / 1024 / 1024)} MB\x1b[0m`);
          } catch (error) {
            term.writeln(`\x1b[1;31mError: ${error}\x1b[0m`);
          }
          break;

        case '':
          // Empty command, do nothing
          break;

        default:
          term.writeln(`\x1b[1;31mCommand not found: ${cmd}\x1b[0m`);
          term.writeln('Type "help" for available commands');
          break;
      }
    } catch (error) {
      term.writeln(`\x1b[1;31mError executing command: ${error}\x1b[0m`);
    }

    term.writeln('');
    writePrompt(term);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">Terminal</h1>
        <p className="text-gray-400 text-sm">Command-line interface for Parallax operations</p>
      </div>
      <div
        ref={terminalRef}
        className="flex-1 rounded-lg overflow-hidden border border-gray-700"
        style={{ minHeight: '500px' }}
      />
    </div>
  );
}
