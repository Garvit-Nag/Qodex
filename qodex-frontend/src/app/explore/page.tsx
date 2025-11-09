/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { databases, DATABASE_ID, REPOSITORIES_COLLECTION_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { Repository } from '@/types';
import Navbar from '@/components/layout/Navbar';
import LiquidEther from '@/components/LiquidEther';
import ChatSidebar from '@/components/explore/ChatSidebar';
import ChatMainPanel from '@/components/explore/ChatMainPanel';
import RepoUploadModal from '@/components/explore/RepoUploadModal';
import DeleteConfirmModal from '@/components/explore/DeleteConfirmModal';
import CustomDropdown from '@/components/explore/CustomDropdown';
import { SquarePen, Trash2 } from 'lucide-react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import CustomLoader from '@/components/ui/LoaderComponent';

export default function ExplorePage() {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const router = useRouter();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [repoStatuses, setRepoStatuses] = useState<{ [key: string]: string }>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [repoToDelete, setRepoToDelete] = useState<{ id: string, name: string } | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchRepositories();
    }
  }, [user]);

  useEffect(() => {
    const checkStatuses = async () => {
      for (const repo of repositories) {
        if (repo.repository_id && repo.status !== 'ready') {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_QODEX_API_URL}/api/v1/repositories/${repo.repository_id}/status`, {
              headers: {
                'X-Client-Secret': process.env.NEXT_PUBLIC_QODEX_CLIENT_SECRET!,
                'X-User-ID': repo.user_id,
              }
            });

            if (response.ok) {
              const statusData = await response.json();
              const newStatus = statusData.status;

              setRepoStatuses(prev => ({
                ...prev,
                [repo.$id]: newStatus
              }));

              if (newStatus !== repo.status) {
                await databases.updateDocument(
                  DATABASE_ID,
                  REPOSITORIES_COLLECTION_ID,
                  repo.$id,
                  { status: newStatus }
                );

                setRepositories(prev => prev.map(r =>
                  r.$id === repo.$id ? { ...r, status: newStatus } : r
                ));

                if (newStatus.toLowerCase() === 'ready' && !selectedRepo) {
                  console.log('🎯 Auto-selecting newly ready repository:', repo.name);
                  const updatedRepo = { ...repo, status: newStatus };
                  setSelectedRepo(updatedRepo);
                }
              }
            }
          } catch (error) {
            console.error('Failed to check status for repo:', repo.repository_id, error);
          }
        }
      }
    };

    if (repositories.length > 0) {
      checkStatuses();
      const interval = setInterval(checkStatuses, 10000);
      return () => clearInterval(interval);
    }
  }, [repositories, selectedRepo]);

  const fetchRepositories = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        REPOSITORIES_COLLECTION_ID,
        [Query.equal('user_id', user!.$id)]
      );

      const repos = response.documents as unknown as Repository[];
      setRepositories(repos);

      if (!selectedRepo) {
        const readyRepo = repos.find(repo => repo.status?.toLowerCase() === 'ready');
        if (readyRepo) {
          console.log('🎯 Auto-selecting first ready repository:', readyRepo.name);
          setSelectedRepo(readyRepo);
        }
      }

      if (repos.length === 0) {
        setShowUploadModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
      setRepositories([]);
    } finally {
      setLoading(false);
    }
  };

  const getRepoStatus = (repo: Repository) => {
    return repoStatuses[repo.$id] || repo.status || 'pending';
  };

  const handleNewChat = () => {
    setShowUploadModal(true);
  };

  const handleUploadSuccess = () => {
    setSelectedRepo(null);
    fetchRepositories();
    refreshUserProfile();
    setShowUploadModal(false);
  };

  const handleRepoSelect = (repo: Repository) => {
    const currentStatus = getRepoStatus(repo);
    console.log('🖱️ Repository clicked:', repo.name, 'Status:', currentStatus);

    if (currentStatus.toLowerCase() === 'ready') {
      const updatedRepo = { ...repo, status: currentStatus };
      setSelectedRepo(updatedRepo);
      console.log('✅ Repository selected for chat:', repo.name);
    } else {
      console.log('⚠️ Repository not ready yet:', currentStatus);
    }
  };

  const handleRepoDelete = async (repoId: string) => {
    const repo = repositories.find(r => r.$id === repoId);
    if (repo) {
      setRepoToDelete({ id: repoId, name: repo.name });
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = async () => {
    if (!repoToDelete) return;

    try {
      await databases.deleteDocument(DATABASE_ID, REPOSITORIES_COLLECTION_ID, repoToDelete.id);
      setRepositories(prev => prev.filter(repo => repo.$id !== repoToDelete.id));

      if (selectedRepo?.$id === repoToDelete.id) {
        setSelectedRepo(null);

        const remainingRepos = repositories.filter(repo => repo.$id !== repoToDelete.id);
        const nextReadyRepo = remainingRepos.find(repo =>
          getRepoStatus(repo).toLowerCase() === 'ready'
        );
        if (nextReadyRepo) {
          setSelectedRepo(nextReadyRepo);
        }
      }

      refreshUserProfile();
      setShowDeleteModal(false);
      setRepoToDelete(null);
    } catch (error) {
      console.error('Failed to delete repository:', error);
    }
  };

  if (!user) {
    return (
      <CustomLoader />
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />

      {/* Background */}
      <div className="fixed inset-0 z-0">
        <LiquidEther
          colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
          mouseForce={15}
          cursorSize={80}
          resolution={0.4}
          autoDemo={true}
          autoSpeed={0.3}
          autoIntensity={1.8}
        />
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>

      {/* Main Content */}
      <div className="relative z-10 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-[calc(100vh-5rem)] py-6">

            {/* Desktop Layout - Hidden on mobile */}
            <div className="hidden md:block h-full">
              <ResizablePanelGroup direction="horizontal" className="h-full gap-4">
                {/* Sidebar Panel */}
                <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="min-w-[280px]">
                  <div className="h-full bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-3xl shadow-2xl overflow-hidden">
                    <ChatSidebar
                      repositories={repositories}
                      selectedRepo={selectedRepo}
                      onRepoSelect={handleRepoSelect}
                      onNewChat={handleNewChat}
                      onRepoDelete={handleRepoDelete}
                      loading={loading}
                      userProfile={userProfile}
                      getRepoStatus={getRepoStatus}
                    />
                  </div>
                </ResizablePanel>

                {/* Resizable Handle */}
                <ResizableHandle
                  withHandle
                  className="w-2 bg-white/50 dark:bg-white/5 relative border border-gray-300 dark:border-white/20 rounded-lg backdrop-blur-sm"
                >
                  <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <div className="absolute w-4 h-8 bg-gray-400 dark:bg-gray-500 rounded-full border-2 border-white dark:border-gray-900 shadow-lg cursor-col-resize"></div>
                </ResizableHandle>

                {/* Main Chat Panel */}
                <ResizablePanel defaultSize={75} className="min-w-[400px]">
                  <div className="h-full bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-3xl shadow-xl overflow-hidden">
                    <ChatMainPanel
                      selectedRepo={selectedRepo}
                      userProfile={userProfile}
                    />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>

            {/* Mobile Layout - Hidden on desktop */}
            <div className="md:hidden h-full flex flex-col gap-4">
              {/* Mobile Header - Compact design */}
              <div className="relative z-[9998] flex items-center justify-between gap-2 px-3 py-2.5 bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-2xl shadow-xl">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <button
                    onClick={handleNewChat}
                    className="flex items-center justify-center p-2.5 bg-gray-900 hover:bg-gray-800 dark:bg-gray-200 dark:hover:bg-gray-300 text-white dark:text-black rounded-xl transition-all duration-300 shadow-lg flex-shrink-0"
                    aria-label="New Chat"
                  >
                    <SquarePen className="w-5 h-5" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <CustomDropdown
                      repositories={repositories}
                      selectedRepo={selectedRepo}
                      onRepoSelect={handleRepoSelect}
                      getRepoStatus={getRepoStatus}
                      onOpenChange={setIsDropdownOpen}
                    />
                  </div>
                </div>

                {selectedRepo && (
                  <button
                    onClick={() => handleRepoDelete(selectedRepo.$id)}
                    className="p-2.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-colors flex-shrink-0"
                    aria-label="Delete Repository"
                  >
                    <Trash2 className="w-5 h-5 text-gray-400 hover:text-red-500" />
                  </button>
                )}
              </div>

              {/* Mobile Chat Panel */}
              <div className={`flex-1 bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-3xl shadow-xl overflow-hidden transition-all duration-300 ${isDropdownOpen ? 'blur-sm pointer-events-none' : ''}`}>
                <ChatMainPanel
                  selectedRepo={selectedRepo}
                  userProfile={userProfile}
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <RepoUploadModal
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={handleUploadSuccess}
          userProfile={userProfile}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && repoToDelete && (
        <DeleteConfirmModal
          repoName={repoToDelete.name}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setRepoToDelete(null);
          }}
        />
      )}
    </div>
  );
}