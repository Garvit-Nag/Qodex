'use client';

import { Shield, LogOut } from 'lucide-react';

interface SignOutModalProps {
    onConfirm: () => void;
    onCancel: () => void;
}

export default function SignOutModal({ onConfirm, onCancel }: SignOutModalProps) {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LogOut className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Sign Out
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                        You&apos;re about to end your current session. All your data is securely saved.
                    </p>
                </div>

                {/* Security Tip Card */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-xl p-4 mb-6">
                    <div className="flex gap-3 items-center">
                        <div className="flex-shrink-0">
                            <Shield className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                                Security Reminder
                            </div>
                            <div className="text-xs text-yellow-700 dark:text-yellow-300">
                                Always sign out on shared devices to keep your account secure
                            </div>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 px-4 rounded-xl border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-white/50 dark:hover:bg-white/5 transition-all duration-300 font-medium"
                    >
                        Stay Signed In
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}