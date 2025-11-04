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
    <div className="bg-white/90 dark:bg-white/5 backdrop-blur-md border-b border-gray-300 dark:border-white/20 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 flex items-center justify-center">
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
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chat</h3>
            {quotaInfo && (
              <p className={`text-xs ${quotaInfo.color}`}>
                {quotaInfo.text}
              </p>
            )}
          </div>
        </div>
        
        <Link
          href={repository.github_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 text-gray-700 dark:text-white rounded-xl transition-all duration-300 border border-gray-300 dark:border-white/20 font-medium text-sm"
        >
          <span className="truncate max-w-40">{repository.name}</span>
          <ExternalLink className="w-4 h-4 flex-shrink-0" />
        </Link>
      </div>
    </div>
  );
}