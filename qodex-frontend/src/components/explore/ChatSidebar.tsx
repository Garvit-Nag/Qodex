'use client';

import { useState } from 'react';
import { Repository, UserProfile } from '@/types';
import { Plus, MoreHorizontal, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface ChatSidebarProps {
  repositories: Repository[];
  selectedRepo: Repository | null;
  onRepoSelect: (repo: Repository) => void;
  onNewChat: () => void;
  onRepoDelete: (repoId: string) => Promise<void>;
  loading: boolean;
  userProfile: UserProfile | null;
  getRepoStatus: (repo: Repository) => string;
}

export default function ChatSidebar({
  repositories,
  selectedRepo,
  onRepoSelect,
  onNewChat,
  onRepoDelete,
  loading,
  userProfile,
  getRepoStatus
}: ChatSidebarProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [deletingRepo, setDeletingRepo] = useState<string | null>(null);

  const handleDelete = async (repoId: string) => {
    setDeletingRepo(repoId);
    await onRepoDelete(repoId);
    setDeletingRepo(null);
    setActiveDropdown(null);
  };

  // 🔥 ENHANCED: Better click handler
  const handleRepoClick = (repo: Repository) => {
    const currentStatus = getRepoStatus(repo);
    console.log('🖱️ Sidebar: Repository clicked:', repo.name, 'Status:', currentStatus);
    
    if (currentStatus.toLowerCase() === 'ready') {
      onRepoSelect(repo);
    } else {
      console.log('⚠️ Sidebar: Repository not ready for chat');
    }
  };

  return (
    <div className="w-1/4 h-full bg-white/90 dark:bg-white/5 backdrop-blur-md border-r border-gray-200/50 dark:border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200/50 dark:border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <Image
            src="/agent.png"
            alt="QODEX AI"
            width={24}
            height={24}
            className="object-contain"
          />
          <span className="font-medium text-gray-900 dark:text-white">QODEX AI</span>
        </div>
        
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-3 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-gray-200 dark:hover:bg-gray-300 text-white dark:text-black rounded-lg transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New chat
        </button>
      </div>

      {/* Repository List */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
            ))}
          </div>
        ) : repositories.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-400 text-sm">
            <p>No repositories yet</p>
            <button
              onClick={onNewChat}
              className="text-purple-600 dark:text-purple-400 hover:underline"
            >
              Upload your first repository
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {repositories.map((repo) => {
              const isSelected = selectedRepo?.$id === repo.$id;
              const currentStatus = getRepoStatus(repo);
              const isReady = currentStatus.toLowerCase() === 'ready';
              
              return (
                <div
                  key={repo.$id}
                  className={`group relative rounded-lg p-2 transition-colors ${
                    isReady ? 'cursor-pointer' : 'cursor-default'
                  } ${
                    isSelected
                      ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800'
                      : isReady
                      ? 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
                      : 'opacity-60'
                  }`}
                  onClick={() => handleRepoClick(repo)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {repo.name}
                      </p>
                      <p className={`text-xs ${
                        isReady 
                          ? 'text-green-600 dark:text-green-400' 
                          : currentStatus.toLowerCase() === 'processing'
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : currentStatus.toLowerCase() === 'failed'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}>
                        {currentStatus.toLowerCase() === 'ready' ? 'Ready to chat' :
                         currentStatus.toLowerCase() === 'processing' ? 'Processing...' :
                         currentStatus.toLowerCase() === 'failed' ? 'Failed' :
                         'Pending'}
                      </p>
                    </div>
                    
                    {isReady && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(activeDropdown === repo.$id ? null : repo.$id);
                          }}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        >
                          <MoreHorizontal className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-600 rounded-r"></div>
                  )}

                  {/* Dropdown Menu */}
                  {activeDropdown === repo.$id && (
                    <div className="absolute right-2 top-8 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[100px]">
                      <button
                        onClick={() => handleDelete(repo.$id)}
                        disabled={deletingRepo === repo.$id}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        {deletingRepo === repo.$id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* User Info Footer */}
      {userProfile && (
        <div className="p-4 border-t border-gray-200/50 dark:border-white/10">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <div className="flex justify-between mb-1">
              <span>Plan</span>
              <span className="capitalize">{userProfile.subscription_tier}</span>
            </div>
            <div className="flex justify-between">
              <span>This Month</span>
              <span>{userProfile.repos_uploaded_this_month}/{userProfile.max_repos_allowed}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}