/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { databases, DATABASE_ID, REPOSITORIES_COLLECTION_ID } from '@/lib/appwrite';
import { RepositoryListProps } from '@/types';

export default function RepositoryList({ repositories, loading, onRepositoryDeleted }: RepositoryListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [repoStatuses, setRepoStatuses] = useState<{[key: string]: string}>({});

  // Poll QODEX API for real status
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
              setRepoStatuses(prev => ({
                ...prev,
                [repo.$id]: statusData.status
              }));
              
              // Update Appwrite if status changed
              if (statusData.status !== repo.status) {
                await databases.updateDocument(
                  DATABASE_ID,
                  REPOSITORIES_COLLECTION_ID,
                  repo.$id,
                  { status: statusData.status }
                );
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
      // Poll every 10 seconds for pending/processing repos
      const interval = setInterval(checkStatuses, 10000);
      return () => clearInterval(interval);
    }
  }, [repositories]);

  const handleDelete = async (repoId: string) => {
    if (!confirm('Are you sure you want to delete this repository? This action cannot be undone.')) {
      return;
    }

    setDeletingId(repoId);
    try {
      await databases.deleteDocument(DATABASE_ID, REPOSITORIES_COLLECTION_ID, repoId);
      onRepositoryDeleted();
    } catch (error) {
      console.error('Failed to delete repository:', error);
      alert('Failed to delete repository. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getRepoStatus = (repo: any) => {
    return repoStatuses[repo.$id] || repo.status || 'pending';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Your Repositories</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Your Repositories ({repositories.length})
        </h2>
      </div>

      {repositories.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No repositories yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Upload your first GitHub repository to get started with AI-powered code exploration.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {repositories.map((repo) => {
            const currentStatus = getRepoStatus(repo);
            
            return (
              <div
                key={repo.$id}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                        {repo.name}
                      </h3>
                      
                      {/* Status Badge - FIXED for case sensitivity */}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        currentStatus.toLowerCase() === 'ready' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : currentStatus.toLowerCase() === 'processing'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : currentStatus.toLowerCase() === 'pending'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : currentStatus.toLowerCase() === 'failed'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {currentStatus.toLowerCase() === 'ready' ? '✅ Ready' : 
                         currentStatus.toLowerCase() === 'processing' ? '⏳ Processing' : 
                         currentStatus.toLowerCase() === 'pending' ? '📋 Pending' : 
                         currentStatus.toLowerCase() === 'failed' ? '❌ Failed' :
                         `❓ ${currentStatus}`}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>Created {formatDate(repo.$createdAt)}</span>
                      <a 
                        href={repo.github_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        View on GitHub ↗
                      </a>
                      <span className="text-green-600 dark:text-green-400">
                        QODEX ID: {repo.repository_id}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {/* 🔥 EXPLORE BUTTON - Only show when ready (FIXED!) */}
                    {currentStatus.toLowerCase() === 'ready' && (
                      <Link
                        href={`/explore/${repo.$id}`}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Explore
                      </Link>
                    )}

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(repo.$id)}
                      disabled={deletingId === repo.$id}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {deletingId === repo.$id ? (
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        '🗑️'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}