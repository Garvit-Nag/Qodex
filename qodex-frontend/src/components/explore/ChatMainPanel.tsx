'use client';

import { Repository, UserProfile } from '@/types';
import ChatInterface from '@/components/explore/ChatInterface';
import { Bot, Sparkles, Code, MessageSquare } from 'lucide-react';

interface ChatMainPanelProps {
  selectedRepo: Repository | null;
  userProfile: UserProfile | null;
}

export default function ChatMainPanel({ selectedRepo, userProfile }: ChatMainPanelProps) {
  if (!selectedRepo) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center max-w-md mx-auto px-6">
          {/* Bot Avatar */}
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center border border-gray-200 dark:border-gray-700">
              <img
                src="/agent.png"
                alt="QODEX AI Assistant"
                className="w-16 h-16 object-contain"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-black flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Welcome Message */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Welcome to QODEX AI
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Your intelligent code assistant is ready to help you explore, understand, 
            and analyze your repositories. Select a repository from the sidebar to start chatting.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-xl p-4">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-3">
                <Code className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                Code Analysis
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Deep understanding of your codebase structure and patterns
              </p>
            </div>

            <div className="bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-xl p-4">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3">
                <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                Natural Language
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Ask questions in plain English about your code
              </p>
            </div>

            <div className="bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-xl p-4">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3">
                <Bot className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                AI Powered
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Advanced AI models trained on software engineering
              </p>
            </div>

            <div className="bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-xl p-4">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-3">
                <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                Smart Insights
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Get suggestions and explanations with code references
              </p>
            </div>
          </div>

          {/* Plan Info - MONTHLY QUOTA */}
          {userProfile && (
            <div className="text-xs text-gray-500 dark:text-gray-500">
              <span className="capitalize">{userProfile.subscription_tier}</span> Plan • 
              {userProfile.subscription_tier === 'premium' ? ' Unlimited' : ' 25'} messages per repository •
              {' '}{userProfile.repos_uploaded_this_month}/{userProfile.max_repos_allowed} repos this month
            </div>
          )}
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
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center max-w-md mx-auto px-6">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center ${statusInfo.icon}`}>
            <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            {statusInfo.title}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {statusInfo.message}
          </p>

          <div className="bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-xl p-4">
            <p className="text-sm text-gray-900 dark:text-white font-medium">
              {selectedRepo.name}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Processing usually takes 2-5 minutes depending on repository size
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show chat interface for ready repositories
  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-black">
      <ChatInterface repository={selectedRepo} />
    </div>
  );
}