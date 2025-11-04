'use client';

import { useAuth } from '@/hooks/useAuth';
import { UserProfile, Repository } from '@/types';
import { Calendar, GitBranch, MessageSquare, Crown, CreditCard, Shield } from 'lucide-react';

interface UserAnalyticsProps {
  userProfile: UserProfile | null;
  repositories: Repository[];
}

export default function UserAnalytics({ userProfile, repositories }: UserAnalyticsProps) {
  const { user } = useAuth();

  if (!userProfile || !user) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-2xl p-6 animate-pulse">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const isPremium = userProfile.subscription_tier === 'premium';
  const readyRepos = repositories.filter(repo => repo.status?.toLowerCase() === 'ready').length;
  const repoUsagePercentage = (userProfile.repos_uploaded_this_month / userProfile.max_repos_allowed) * 100;

  // Calculate account age
  const accountAge = Math.floor((new Date().getTime() - new Date(userProfile.$createdAt).getTime()) / (1000 * 60 * 60 * 24));

  // Detect if user signed up with email (for password reset option)
  const isEmailUser = !user.email.includes('@gmail.com') && !user.email.includes('@google.com');

  const stats = [
    {
      title: 'Total Repositories',
      value: repositories.length.toString(),
      subtitle: `${readyRepos} ready for chat`,
      icon: GitBranch,
      color: 'purple'
    },
    {
      title: 'Monthly Usage',
      value: `${userProfile.repos_uploaded_this_month}/${userProfile.max_repos_allowed}`,
      subtitle: `${Math.max(0, userProfile.max_repos_allowed - userProfile.repos_uploaded_this_month)} remaining`,
      icon: Calendar,
      color: repoUsagePercentage > 80 ? 'red' : 'green'
    },
    {
      title: 'Plan Status',
      value: isPremium ? 'Code Pro' : 'Code Explorer',
      subtitle: isPremium ? 'Unlimited messages' : '25 messages per chat',
      icon: isPremium ? Crown : MessageSquare,
      color: isPremium ? 'yellow' : 'blue'
    },
    {
      title: 'Account Age',
      value: `${accountAge} days`,
      subtitle: isEmailUser ? 'Email account' : 'Google OAuth',
      icon: isEmailUser ? Shield : Calendar,
      color: 'gray'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'purple': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      case 'green': return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'red': return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      case 'yellow': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'blue': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getColorClasses(stat.color)}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {stat.title}
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {stat.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Billing Information (Premium Users) */}
      {isPremium && userProfile.next_billing_date && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-800/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Premium Subscription Active
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Next billing: {new Date(userProfile.next_billing_date).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">₹499/month</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Auto-renews</p>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Option (Email Users Only) */}
      {isEmailUser && (
        <div className="bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900/30 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Account Security
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Update your password for better security
                </p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/auth/reset-password'}
              className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-200 dark:hover:bg-gray-300 text-white dark:text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Change Password
            </button>
          </div>
        </div>
      )}
    </div>
  );
}