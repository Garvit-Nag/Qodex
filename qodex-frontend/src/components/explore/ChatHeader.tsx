'use client';

import { Repository, UserProfile } from '@/types';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface ChatHeaderProps {
  repository: Repository;
  userProfile: UserProfile | null;
  messageCount: number;
}

export default function ChatHeader({ repository, userProfile, messageCount }: ChatHeaderProps) {
  const getQuotaInfo = () => {
    if (!userProfile) return null;

    if (userProfile.subscription_tier === 'premium') {
      return {
        text: 'Unlimited messages',
        color: 'text-green-600 dark:text-green-400',
      };
    }

    return {
      text: `${messageCount}/25 messages used`,
      color: messageCount >= 20 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-white/60',
    };
  };

  const quotaInfo = getQuotaInfo();

  return (
    <div className="bg-white/90 dark:bg-white/5 backdrop-blur-md border-b border-gray-300 dark:border-white/20 px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between gap-3">
        {/* Left side - Agent icon and info */}
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
          <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center flex-shrink-0">
            <Image
              src="/agent-light.png"
              alt="QODEX"
              width={40}
              height={40}
              className="max-w-full max-h-full object-contain dark:hidden"
            />
            <Image
              src="/agent.png"
              alt="QODEX"
              width={40}
              height={40}
              className="max-w-full max-h-full object-contain hidden dark:block"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white truncate">
              Chat
            </h3>
            {quotaInfo && (
              <p className={`text-[10px] md:text-xs ${quotaInfo.color} truncate`}>
                {quotaInfo.text}
              </p>
            )}
          </div>
        </div>

        {/* Right side - Repository link */}
        <Link
          href={repository.github_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white/80 dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 text-gray-700 dark:text-white rounded-lg md:rounded-xl transition-all duration-300 border border-gray-300 dark:border-white/20 font-medium text-xs md:text-sm flex-shrink-0"
        >
          <span className="truncate max-w-[80px] md:max-w-40">{repository.name}</span>
          <ExternalLink className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
        </Link>
      </div>
    </div>
  );
}