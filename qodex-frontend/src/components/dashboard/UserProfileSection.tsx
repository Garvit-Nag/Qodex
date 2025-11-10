/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { User, UserProfile } from '@/types';
import { Crown, Calendar, GitBranch, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface UserProfileSectionProps {
  user: User;
  userProfile: UserProfile | null;
  repositories: any[];
}

export default function UserProfileSection({ user, userProfile, repositories }: UserProfileSectionProps) {
  const router = useRouter();

  const accountAge = userProfile ? Math.floor((new Date().getTime() - new Date(userProfile.$createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const isPremium = userProfile?.subscription_tier === 'premium';
  const avgReposPerDay = repositories.length > 0 && userProfile ?
    (repositories.length / Math.max(1, accountAge)).toFixed(1) : '0.0';

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-3xl shadow-2xl p-8">
      {/* Profile Header */}
      <div className="flex items-center gap-6 mb-8">
        {/* Avatar */}
        <div className="relative">
          {user.avatar ? (
            <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg border-2 border-white/20 relative">
              <Image
                src={user.avatar}
                alt={user.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.parentElement?.nextElementSibling as HTMLElement;
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
            </div>
          ) : null}

          {/* Fallback initials - shown when no avatar or error */}
          <div className={`w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg ${user.avatar ? 'hidden' : ''}`}>
            {getInitials(user.name)}
          </div>

          {isPremium && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
              <Crown className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0 pr-4 md:pr-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {user.name}
          </h1>
          <div className="md:overflow-visible overflow-hidden">
            <p className="text-gray-600 dark:text-gray-300 md:whitespace-normal whitespace-nowrap md:animate-none animate-marquee hover:animation-pause">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid - 4 Boxes in a Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Repositories */}
        <div className="bg-white/50 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/20 rounded-xl p-4 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Total Repositories</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {repositories.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Uploaded
              </p>
            </div>
          </div>
        </div>

        {/* Average Repos/Day */}
        <div className="bg-white/50 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/20 rounded-xl p-4 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Avg Repos/Day</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {avgReposPerDay}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Daily average
              </p>
            </div>
          </div>
        </div>

        {/* Account Age */}
        <div className="bg-white/50 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/20 rounded-xl p-4 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Account Age</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {accountAge} days
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Member since
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}