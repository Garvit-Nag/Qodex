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
import ActionsAndActivity from '@/components/dashboard/ActionsAndActivity';
import PlanStatusCard from '@/components/dashboard/PlanStatusCard';

export default function Dashboard() {
  const { user, userProfile, refreshUserProfile, signOut } = useAuth();
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

      <div className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <UserProfileSection
                user={user}
                userProfile={userProfile}
                repositories={repositories}
              />
            </div>
            <div className="lg:col-span-1">
              <PlanStatusCard userProfile={userProfile} />
            </div>
          </div>

          <div className="mb-8">
            <ActionsAndActivity
              repositories={repositories}
              onSignOut={async () => {
                try {
                  await signOut();
                  window.location.href = '/';
                } catch (error) {
                  console.error('Sign out error:', error);
                }
              }}
            />
          </div>

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