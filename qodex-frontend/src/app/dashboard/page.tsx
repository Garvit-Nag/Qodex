'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { databases, DATABASE_ID, REPOSITORIES_COLLECTION_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { Repository } from '@/types';
import RepositoryUpload from '@/components/dashboard/RepositoryUpload';
import RepositoryList from '@/components/dashboard/RepositoryList';
import SubscriptionInfo from '@/components/dashboard/SubscriptionInfo';
import UserAnalytics from '@/components/dashboard/UserAnalytics';

export default function Dashboard() {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRepositories();
    }
  }, [user]);

  const fetchRepositories = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        REPOSITORIES_COLLECTION_ID,
        [Query.equal('user_id', user!.$id)]
      );
      
      setRepositories(response.documents as unknown as Repository[]);
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
      setRepositories([]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your repositories and explore your code with AI-powered insights.
          </p>
        </div>

        {/* Analytics Section */}
        <UserAnalytics userProfile={userProfile} repositories={repositories} />

        {/* Subscription Info */}
        <div className="mt-8">
          <SubscriptionInfo userProfile={userProfile} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <RepositoryUpload 
              onUploadSuccess={() => {
                fetchRepositories();
                refreshUserProfile();
              }}
              userProfile={userProfile}
            />
          </div>

          {/* Repository List */}
          <div className="lg:col-span-2">
            <RepositoryList 
              repositories={repositories}
              loading={loading}
              onRepositoryDeleted={() => {
                fetchRepositories();
                refreshUserProfile();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}