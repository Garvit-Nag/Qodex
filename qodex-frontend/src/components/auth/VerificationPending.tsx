'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function VerificationPending() {
  const [sending, setSending] = useState(false);
  const { user, sendVerificationEmail, signOut } = useAuth();

  const handleResendVerification = async () => {
    setSending(true);
    try {
      await sendVerificationEmail();
      alert('Verification email sent! Please check your inbox and spam folder.');
    } catch (error) {
      console.error('Failed to send verification email:', error);
      alert('Failed to send verification email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black px-4">
      <div className="text-center max-w-md w-full space-y-6">
        {/* Logo */}
        <Link href="/" className="inline-block">
          <Image
            src="/logo_light.png"
            alt="QODEX Logo"
            width={120}
            height={40}
            className="mx-auto dark:hidden"
            priority
          />
          <Image
            src="/logo_dark.png"
            alt="QODEX Logo"
            width={120}
            height={40}
            className="mx-auto hidden dark:block"
            priority
          />
        </Link>

        {/* Email Icon */}
        <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Check Your Email
          </h1>

          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-400">
              We&apos;ve sent a verification link to:
            </p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {user?.email}
            </p>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-500">
            Click the link in the email to verify your account and access Qodex.
            Don&apos;t forget to check your spam folder!
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4 pt-4">
          <button
            onClick={handleResendVerification}
            disabled={sending}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            {sending ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              'Resend Verification Email'
            )}
          </button>

          <button
            onClick={handleSignOut}
            className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Use Different Account
          </button>
        </div>

        {/* Help */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Having trouble? Contact support or try signing in with Google instead.
          </p>
        </div>
      </div>
    </div>
  );
}