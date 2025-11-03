'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { databases, DATABASE_ID, REPOSITORIES_COLLECTION_ID } from '@/lib/appwrite';
import { Repository } from '@/types';
import ChatInterface from '@/components/explore/ChatInterface';

export default function ExplorePage() {
  const params = useParams();
  const { user } = useAuth();
  const [repository, setRepository] = useState<Repository | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id && user) {
      fetchRepository();
    }
  }, [params.id, user]);

  const fetchRepository = async () => {
    try {
      // Get repository from Appwrite
      const repo = await databases.getDocument(
        DATABASE_ID,
        REPOSITORIES_COLLECTION_ID,
        params.id as string
      );
      
      // Check if user owns this repository
      if (repo.user_id !== user!.$id) {
        setError('You do not have access to this repository.');
        return;
      }

      // Check QODEX status directly
      const statusResponse = await fetch(`${process.env.NEXT_PUBLIC_QODEX_API_URL}/api/v1/repositories/${repo.repository_id}/status`, {
        headers: {
          'X-Client-Secret': process.env.NEXT_PUBLIC_QODEX_CLIENT_SECRET!,
          'X-User-ID': repo.user_id,
        }
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        
        if (statusData.status?.toLowerCase() !== 'ready') {
          setError(`Repository is not ready yet. Current status: ${statusData.status}. Please wait for processing to complete.`);
          return;
        }
      } else {
        setError('Unable to verify repository status. Please try again.');
        return;
      }

      setRepository(repo as unknown as Repository);
    } catch (error) {
      console.error('Failed to fetch repository:', error);
      setError('Repository not found or access denied.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading repository...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-100 dark:bg-red-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Repository Not Ready</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <a 
            href="/dashboard" 
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <a 
                href="/dashboard" 
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
              >
                ← Back to Dashboard
              </a>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {repository?.name}
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  AI Code Assistant
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full text-xs font-medium">
                🤖 AI Ready
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ID: {repository?.repository_id}
              </span>
              <a 
                href={repository?.github_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                GitHub ↗
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Interface - Full Width */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ChatInterface repository={repository!} />
      </main>
    </div>
  );
}