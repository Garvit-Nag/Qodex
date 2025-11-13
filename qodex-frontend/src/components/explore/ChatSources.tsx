'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface Source {
  file_path?: string;
  start_line?: number;
  end_line?: number;
  similarity?: number;
  preview?: string;
  content?: string;
}

interface ChatSourcesProps {
  sources: Source[];
}

export default function ChatSources({ sources }: ChatSourcesProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-6 pt-4 border-t border-gray-300 dark:border-white/30">
      <p className="text-xs font-semibold text-gray-600 dark:text-white/70 mb-4">
        Sources ({sources.length} found):
      </p>
      <div className="space-y-4">
        {sources.map((source, index) => (
          <div key={index} className="border border-gray-300 dark:border-white/30 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-white/90 dark:bg-white/5 backdrop-blur-md border-b border-gray-300 dark:border-white/20">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2 h-2 bg-gray-900 dark:bg-gray-200 rounded-full"></div>
                <span className="font-mono text-xs font-medium text-gray-700 dark:text-white/80 truncate">
                  {source.file_path || 'Unknown file'}
                </span>
                <span className="text-xs text-gray-500 dark:text-white/50 whitespace-nowrap">
                  Lines {source.start_line || 0}-{source.end_line || 0}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(source.preview || source.content || '', index)}
                className="p-1.5 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                {copiedIndex === index ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-500 dark:text-white/50" />
                )}
              </button>
            </div>

            <div className="p-4">
              <pre className="text-xs font-mono text-gray-700 dark:text-white/80 whitespace-pre-wrap overflow-x-auto">
                {source.preview || source.content || 'No content available'}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}