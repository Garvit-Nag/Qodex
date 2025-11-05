/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { databases, DATABASE_ID, REPOSITORIES_COLLECTION_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { Repository } from '@/types';
import Navbar from '@/components/layout/Navbar';
import LiquidEther from '@/components/LiquidEther';
import DashboardAnalytics from '@/components/dashboard/DashboardAnalytics';
import UserProfileSection from '@/components/dashboard/UserProfileSection';
import CustomLoader from '@/components/ui/LoaderComponent';

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

      {/* Content */}
      <div className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Single User Profile Container with Stats */}
          <div className="mb-8">
            <UserProfileSection
              user={user}
              userProfile={userProfile}
              repositories={repositories}
            />
          </div>

          {/* Analytics Dashboard - Just Monthly Usage + Timeline */}
          <DashboardAnalytics
            userProfile={userProfile}
            repositories={repositories}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}