/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { Repository, UserProfile } from '@/types';
import ChatInterface from '@/components/explore/ChatInterface';
import { useState } from 'react';

interface ChatMainPanelProps {
  selectedRepo: Repository | null;
  userProfile: UserProfile | null;
}

export default function ChatMainPanel({ selectedRepo, userProfile }: ChatMainPanelProps) {
  // Developer quotes for motivation
  const quotes = [
    "Code is poetry written in logic.",
    "Every expert was once a beginner.",
    "The best code is no code at all.",
    "Simplicity is the ultimate sophistication.",
    "Clean code always looks like it was written by someone who cares.",
    "Programming is the art of telling another human what one wants the computer to do.",
    "The most important property of a program is whether it accomplishes the intention of its user.",
    "First, solve the problem. Then, write the code.",
    "Code never lies, comments sometimes do.",
    "Make it work, make it right, make it fast."
  ];

  const [currentQuote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

  if (!selectedRepo) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="mb-8">
            <p className="text-xl italic text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              &quot;{currentQuote}&quot;
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Select a repository from the sidebar to start exploring your codebase
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state if repository is not ready
  if (selectedRepo.status?.toLowerCase() !== 'ready') {
    const getStatusInfo = () => {
      switch (selectedRepo.status?.toLowerCase()) {
        case 'processing':
          return {
            title: 'Processing Repository',
            message: 'AI is analyzing your code structure and content...',
            icon: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
          };
        case 'failed':
          return {
            title: 'Processing Failed',
            message: 'There was an error processing your repository. Please try re-uploading.',
            icon: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          };
        default:
          return {
            title: 'Repository Pending',
            message: 'Your repository is queued for processing...',
            icon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
          };
      }
    };

    const statusInfo = getStatusInfo();

    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center ${statusInfo.icon}`}>
            <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            {statusInfo.title}
          </h2>

          <p className="text-gray-600 dark:text-white/70 mb-6">
            {statusInfo.message}
          </p>

          <div className="bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-xl p-4 shadow-lg">
            <p className="text-sm text-gray-900 dark:text-white font-medium">
              {selectedRepo.name}
            </p>
            <p className="text-xs text-gray-600 dark:text-white/60 mt-1">
              Processing usually takes 2-5 minutes depending on repository size
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show chat interface for ready repositories
  return <ChatInterface repository={selectedRepo} />;
}