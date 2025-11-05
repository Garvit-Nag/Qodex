'use client';

import { useState } from 'react';
import { Repository, UserProfile } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

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
  const [hoveredRepo, setHoveredRepo] = useState<string | null>(null);
  const [deletingRepo, setDeletingRepo] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, repoId: string) => {
    e.stopPropagation();
    setDeletingRepo(repoId);
    await onRepoDelete(repoId);
    setDeletingRepo(null);
  };

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
    <div className="h-full flex flex-col">
      {/* Header - Exact height match with chat header */}
      <div className="px-6 py-4 border-b border-gray-300 dark:border-white/20 bg-white/90 dark:bg-white/5 backdrop-blur-md flex items-center" style={{ minHeight: '73px' }}>
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 hover:bg-gray-800 dark:bg-gray-200 dark:hover:bg-gray-300 text-white dark:text-black rounded-xl transition-all duration-300 font-medium shadow-lg"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Repository List with custom scrollbar */}
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-white/50 dark:bg-white/10 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : repositories.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-white/60 text-sm py-8">
            <p className="mb-2">No repositories yet</p>
            <button
              onClick={onNewChat}
              className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
            >
              Upload your first repository
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {repositories.map((repo) => {
              const isSelected = selectedRepo?.$id === repo.$id;
              const currentStatus = getRepoStatus(repo);
              const isReady = currentStatus.toLowerCase() === 'ready';

              return (
                <div
                  key={repo.$id}
                  className={`relative rounded-xl p-3 transition-all duration-300 ${isReady ? 'cursor-pointer' : 'cursor-default'
                    } ${isSelected
                      ? 'bg-white/80 dark:bg-white/10 shadow-lg border border-gray-300 dark:border-white/30'
                      : isReady
                        ? 'hover:bg-gray-100 dark:hover:bg-white/5'
                        : 'opacity-50'
                    }`}
                  onClick={() => handleRepoClick(repo)}
                  onMouseEnter={() => setHoveredRepo(repo.$id)}
                  onMouseLeave={() => setHoveredRepo(null)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {repo.name}
                      </p>
                    </div>

                    {isReady && hoveredRepo === repo.$id && (
                      <button
                        onClick={(e) => handleDelete(e, repo.$id)}
                        disabled={deletingRepo === repo.$id}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors group"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* User Info Footer - Exact height match with input area */}
      <div className="px-4 py-4 border-t border-gray-300 dark:border-white/20 bg-white/50 dark:bg-white/5" style={{ minHeight: '65px' }}>
        <div className="text-xs text-gray-600 dark:text-white/60 space-y-1 flex flex-col justify-center h-full">
          <div className="flex justify-between">
            <span>Plan</span>
            <span className="capitalize font-medium">{userProfile?.subscription_tier || 'free'}</span>
          </div>
          <div className="flex justify-between">
            <span>This Month</span>
            <span className="font-medium">{userProfile?.repos_uploaded_this_month || 0}/{userProfile?.max_repos_allowed || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}