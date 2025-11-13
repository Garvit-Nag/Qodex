'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, User, LogIn } from 'lucide-react';

interface AuthRequiredModalProps {
  onClose: () => void;
}

export default function AuthRequiredModal({ onClose }: AuthRequiredModalProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = () => {
    setLoading(true);
    router.push('/auth/signin');
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCancel}
      />

      <div className="relative bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-2xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-100">
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>

        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Sign In Required
          </h3>

          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            You need to sign in to upgrade your plan and unlock premium features.
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={handleSignIn}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 dark:bg-gray-200 dark:hover:bg-gray-300 text-white dark:text-black rounded-lg font-medium transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Redirecting...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}