import { useState, useRef, useEffect } from 'react';
import { Terminal, Search, ArrowDown, Copy, Check, Download, ShieldCheck, Trash2 } from 'lucide-react';

interface LogTerminalProps {
  logs: string;
  title?: string;
  isStreaming?: boolean;
  onClear?: () => void;
}

export const LogTerminal = ({
  logs,
  title = 'Console Output',
  isStreaming = false,
  onClear,
}: LogTerminalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleCopy = () => {
    navigator.clipboard.writeText(logs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([logs], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '_')}_logs.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const lines = logs.split('\n');
  const filteredLines = searchQuery
    ? lines.filter((line) => line.toLowerCase().includes(searchQuery.toLowerCase()))
    : lines;

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-lg overflow-hidden font-mono text-xs shadow-2xl">
      {/* Terminal Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-slate-400">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-slate-200 font-medium flex items-center">
            <Terminal className="w-3.5 h-3.5 mr-1.5 text-brand-400" />
            {title}
          </span>
          {isStreaming && (
            <span className="flex items-center text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
              LIVE
            </span>
          )}
          <span className="flex items-center text-[10px] text-purple-400 bg-purple-950/60 border border-purple-800 px-2 py-0.5 rounded-full font-sans">
            <ShieldCheck className="w-3 h-3 mr-1 text-purple-400" />
            Secrets Masked
          </span>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2 top-1.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 pl-7 pr-2 py-1 rounded text-[11px] focus:outline-none focus:border-brand-500 w-36"
            />
          </div>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
              autoScroll ? 'text-brand-400' : 'text-slate-500'
            }`}
            title={autoScroll ? 'Auto-scroll Enabled' : 'Auto-scroll Disabled'}
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Copy logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Download log file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {onClear && (
            <button
              onClick={onClear}
              className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
              title="Clear logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Terminal Content Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-0.5 text-slate-300 select-text">
        {filteredLines.length === 0 ? (
          <div className="text-slate-600 text-center py-8">No log entries matching search query.</div>
        ) : (
          filteredLines.map((line, idx) => {
            const isError = /error|fatal|exception|fail/i.test(line);
            const isWarn = /warn/i.test(line);
            const isSuccess = /success|ready|done|connected/i.test(line);

            return (
              <div
                key={idx}
                className={`leading-relaxed whitespace-pre-wrap ${
                  isError
                    ? 'text-red-400 font-semibold'
                    : isWarn
                    ? 'text-amber-300'
                    : isSuccess
                    ? 'text-emerald-400'
                    : 'text-slate-300'
                }`}
              >
                <span className="text-slate-600 select-none mr-3 text-[10px]">
                  {String(idx + 1).padStart(3, '0')}
                </span>
                {line}
              </div>
            );
          })
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Footer */}
      <div className="px-4 py-1.5 bg-slate-900 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
        <span>{filteredLines.length} lines shown</span>
        <span>UTF-8 • Unix (LF)</span>
      </div>
    </div>
  );
};
