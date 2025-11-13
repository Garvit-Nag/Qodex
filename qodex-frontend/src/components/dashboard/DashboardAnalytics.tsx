/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { UserProfile, Repository } from '@/types';
import { Activity, ChartLine } from 'lucide-react';
import { useState, useEffect } from 'react';
import ActivityTimeline from '@/components/dashboard/ActivityTimeline';
import CircularProgress from '@/components/dashboard/CircularProgress';

interface DashboardAnalyticsProps {
  userProfile: UserProfile | null;
  repositories: Repository[];
  loading: boolean;
}

export default function DashboardAnalytics({ userProfile, repositories, loading }: DashboardAnalyticsProps) {
  const [timelineData, setTimelineData] = useState<{ date: string, count: number }[]>([]);

  useEffect(() => {
    console.log('🔍 DashboardAnalytics received repositories:', repositories);
    console.log('🔍 Repositories length:', repositories.length);

    if (repositories.length > 0) {
      const groupedByDate: Record<string, number> = {};

      repositories.forEach((repo, index) => {
        console.log(`🔍 Processing repo ${index}:`, {
          name: repo.name,
          createdAt: repo.$createdAt,
          rawDate: repo.$createdAt
        });

        try {
          const repoDate = new Date(repo.$createdAt);
          console.log('🔍 Parsed date:', repoDate);

          const dateKey = repoDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          });
          console.log('🔍 Date key:', dateKey);

          groupedByDate[dateKey] = (groupedByDate[dateKey] || 0) + 1;
          console.log('🔍 Updated groupedByDate:', groupedByDate);
        } catch (error) {
          console.error('🔍 Error parsing date for repo:', repo.name, error);
        }
      });

      console.log('🔍 Final groupedByDate:', groupedByDate);

      const chartData = Object.entries(groupedByDate)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => {
          const currentYear = new Date().getFullYear();
          const dateA = new Date(`${a.date}, ${currentYear}`);
          const dateB = new Date(`${b.date}, ${currentYear}`);
          return dateA.getTime() - dateB.getTime(); 
        });

      console.log('🔍 Final chartData:', chartData);
      setTimelineData(chartData);
    } else {
      console.log('🔍 No repositories found');
      setTimelineData([]);
    }
  }, [repositories]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-2xl p-6 animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-6"></div>
          <div className="flex items-center justify-center h-64">
            <div className="w-48 h-48 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-2xl p-6 animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
          </div>
          <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  if (!userProfile) return null;

  const usagePercentage = (userProfile.repos_uploaded_this_month / userProfile.max_repos_allowed) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <ChartLine className="w-6 h-6 text-green-600 dark:text-green-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Monthly Usage</h3>
        </div>
        <div className="flex items-center justify-center h-64">
          <CircularProgress
            percentage={usagePercentage}
            used={userProfile.repos_uploaded_this_month}
            total={userProfile.max_repos_allowed}
          />
        </div>
      </div>

      <div className="lg:col-span-2 bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Repository Activity Timeline</h3>
        </div>
        <ActivityTimeline data={timelineData} />
      </div>
    </div>
  );
}