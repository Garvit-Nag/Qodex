'use client';

import { SubscriptionInfoProps } from '@/types';

export default function SubscriptionInfo({ userProfile }: SubscriptionInfoProps) {
  if (!userProfile) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const usagePercentage = (userProfile.repos_uploaded_count / userProfile.max_repos_allowed) * 100;
  const isAtLimit = userProfile.repos_uploaded_count >= userProfile.max_repos_allowed;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
            {userProfile.subscription_tier} Plan
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Repository usage
          </p>
        </div>
        
        {userProfile.subscription_tier === 'demo' && (
          <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-xs font-medium">
            Demo
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>Repositories</span>
          <span>{userProfile.repos_uploaded_count} / {userProfile.max_repos_allowed}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              isAtLimit ? 'bg-red-500' : usagePercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Status Message */}
      {isAtLimit ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">Repository limit reached</p>
              <p className="text-xs text-red-600 dark:text-red-400">Delete a repository or upgrade your plan to continue</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          You have {userProfile.max_repos_allowed - userProfile.repos_uploaded_count} repository slots remaining
        </p>
      )}
    </div>
  );
}