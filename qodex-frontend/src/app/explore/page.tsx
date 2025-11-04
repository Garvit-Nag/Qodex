'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { databases, DATABASE_ID, REPOSITORIES_COLLECTION_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { Repository } from '@/types';
import Navbar from '@/components/layout/Navbar';
import ChatSidebar from '@/components/explore/ChatSidebar';
import ChatMainPanel from '@/components/explore/ChatMainPanel';
import RepoUploadModal from '@/components/explore/RepoUploadModal';

export default function ExplorePage() {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [repoStatuses, setRepoStatuses] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (user) {
      fetchRepositories();
    }
  }, [user]);

  // Enhanced polling logic with auto-selection
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
              
              // Update status state
              setRepoStatuses(prev => ({
                ...prev,
                [repo.$id]: newStatus
              }));
              
              // Update Appwrite if status changed
              if (newStatus !== repo.status) {
                await databases.updateDocument(
                  DATABASE_ID,
                  REPOSITORIES_COLLECTION_ID,
                  repo.$id,
                  { status: newStatus }
                );
                
                // Update local repositories state
                setRepositories(prev => prev.map(r => 
                  r.$id === repo.$id ? { ...r, status: newStatus } : r
                ));
                
                // 🔥 AUTO-SELECT WHEN READY AND NO REPO SELECTED
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
      
      // 🔥 AUTO-SELECT FIRST READY REPO IF NONE SELECTED
      if (!selectedRepo) {
        const readyRepo = repos.find(repo => repo.status?.toLowerCase() === 'ready');
        if (readyRepo) {
          console.log('🎯 Auto-selecting first ready repository:', readyRepo.name);
          setSelectedRepo(readyRepo);
        }
      }
      
      // Show upload modal if no repos exist
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
    fetchRepositories();
    refreshUserProfile();
    setShowUploadModal(false);
  };

  // 🔥 FIXED: Enhanced repo selection handler
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
    if (!confirm('Are you sure you want to delete this repository? This action cannot be undone.')) {
      return;
    }

    try {
      await databases.deleteDocument(DATABASE_ID, REPOSITORIES_COLLECTION_ID, repoId);
      setRepositories(prev => prev.filter(repo => repo.$id !== repoId));
      
      if (selectedRepo?.$id === repoId) {
        setSelectedRepo(null);
        
        // 🔥 AUTO-SELECT ANOTHER READY REPO IF AVAILABLE
        const remainingRepos = repositories.filter(repo => repo.$id !== repoId);
        const nextReadyRepo = remainingRepos.find(repo => 
          getRepoStatus(repo).toLowerCase() === 'ready'
        );
        if (nextReadyRepo) {
          setSelectedRepo(nextReadyRepo);
        }
      }
      
      refreshUserProfile();
    } catch (error) {
      console.error('Failed to delete repository:', error);
      alert('Failed to delete repository. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] pt-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      
      <div className="flex pt-16 h-screen">
        {/* Left Sidebar - 25% */}
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

        {/* Main Chat Panel - 75% */}
        <ChatMainPanel
          selectedRepo={selectedRepo}
          userProfile={userProfile}
        />
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <RepoUploadModal
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={handleUploadSuccess}
          userProfile={userProfile}
        />
      )}
    </div>
  );
}