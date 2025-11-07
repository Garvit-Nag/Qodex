'use client';

import { Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/types';

interface PlanStatusCardProps {
  userProfile: UserProfile | null;
}

export default function PlanStatusCard({ userProfile }: PlanStatusCardProps) {
  const router = useRouter();
  const isPremium = userProfile?.subscription_tier === 'premium';

  return (
    <div className="bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-3xl shadow-2xl p-6 h-full flex flex-col">
      {/* Header with Crown Icon */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Crown className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Subscription</h3>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">Manage your current plan and billing.</p>
      </div>

      {/* Plan Info Card */}
      <div className="bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-200/50 dark:border-yellow-800/30 rounded-xl p-4 mb-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-base font-bold text-gray-900 dark:text-white">
            {isPremium ? 'Code Pro' : 'Code Explorer'}
          </span>
          <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800/50 text-yellow-700 dark:text-yellow-400 text-xs font-medium rounded-lg">
            Active
          </span>
        </div>
        
        {/* Messages Info */}
        <div className="flex items-center justify-between pt-3 border-t border-yellow-200/50 dark:border-yellow-800/30">
          <span className="text-sm text-gray-700 dark:text-gray-300">Messages per chat</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {isPremium ? 'Unlimited' : '25'}
          </span>
        </div>
      </div>

      {/* Manage Button */}
      <button
        onClick={() => router.push('/pricing')}
        className="w-full py-2.5 px-4 bg-gray-900 dark:bg-white/10 hover:bg-gray-800 dark:hover:bg-white/5 border border-gray-900 dark:border-white/20 text-white dark:text-white rounded-xl transition-all duration-300 font-medium text-sm"
      >
        Manage Subscription
      </button>
    </div>
  );
}