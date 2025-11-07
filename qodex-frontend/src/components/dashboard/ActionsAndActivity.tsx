'use client';

import { useRouter } from 'next/navigation';
import { MousePointerClick, LogOut, Clock, Github, SquarePen } from 'lucide-react';
import { Repository } from '@/types';
import { useState } from 'react';
import SignOutModal from '../SignOutModal';

interface ActionsAndActivityProps {
    repositories: Repository[];
    onSignOut: () => void;
}

export default function ActionsAndActivity({ repositories, onSignOut }: ActionsAndActivityProps) {
    const router = useRouter();
    const [showSignOutModal, setShowSignOutModal] = useState(false);

    const handleNewChat = () => {
        router.push('/explore');
    };

    const handleSignOutClick = () => {
        setShowSignOutModal(true);
    };

    const handleSignOutConfirm = () => {
        setShowSignOutModal(false);
        onSignOut();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }
    };

    // Sort repositories by creation date (most recent first)
    const sortedRepositories = [...repositories].sort((a, b) =>
        new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
    );

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Actions Container - 1 column */}
                <div className="lg:col-span-1 bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-3xl shadow-2xl p-6 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <MousePointerClick className="w-6 h-6 text-teal-600 dark:text-cyan-400" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Quick Actions
                        </h2>
                    </div>

                    <div className="flex-1 flex flex-col justify-center space-y-4">
                        {/* New Chat Button */}
                        <button
                            onClick={handleNewChat}
                            className="w-full flex items-center gap-3 p-4 bg-gray-900 hover:bg-gray-800 dark:bg-gray-200 dark:hover:bg-gray-300 text-white dark:text-black rounded-xl transition-all duration-300 hover:scale-105 shadow-lg group"
                        >
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors">
                                <SquarePen className="w-6 h-6" />
                            </div>
                            <div className="text-left flex-1">
                                <div className="font-semibold">New Chat</div>
                                <div className="text-xs opacity-80">Start coding session</div>
                            </div>
                        </button>

                        {/* Sign Out Button */}
                        <button
                            onClick={handleSignOutClick}
                            className="w-full flex items-center gap-3 p-4 bg-white/50 dark:bg-white/10 hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-200 dark:border-white/20 rounded-xl transition-all duration-300 group"
                        >
                            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                                <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="text-left flex-1">
                                <div className="font-semibold text-gray-900 dark:text-white">Sign Out</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">End your session</div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Right: Recent Activity - 2 columns */}
                <div className="lg:col-span-2 bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-3xl shadow-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Recent Activity
                        </h2>
                    </div>

                    {/* Scrollable Activity List with custom scrollbar */}
                    <div className="h-[200px] overflow-y-auto custom-scrollbar pr-2">
                        {sortedRepositories.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center mb-3">
                                    <Clock className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    No activity yet
                                </p>
                                <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                                    Upload a repository to get started
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {sortedRepositories.map((repo) => (
                                    <div
                                        key={repo.$id}
                                        className="flex items-center gap-3 p-3 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl transition-all duration-300"
                                    >
                                        <div className="w-8 h-8 bg-gray-100 dark:bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Github className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {repo.name}
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                                {formatDate(repo.$createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sign Out Modal */}
            {showSignOutModal && (
                <SignOutModal
                    onConfirm={handleSignOutConfirm}
                    onCancel={() => setShowSignOutModal(false)}
                />
            )}
        </>
    );
}