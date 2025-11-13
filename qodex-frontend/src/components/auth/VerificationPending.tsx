'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import DotGrid from '@/components/DotGrid';
import BrowserWindow from '@/components/ui/BrowserWindow';
import Navbar from '@/components/layout/Navbar';
import Toast from './VerificationToast';
import { Mail, RefreshCw, LogOut } from 'lucide-react';

export default function VerificationPending() {
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { user, sendVerificationEmail, signOut } = useAuth();

  const handleResendVerification = async () => {
    setSending(true);
    try {
      await sendVerificationEmail();
      setToast({
        message: 'Verification email sent! Please check your inbox and spam folder.',
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to send verification email:', error);
      setToast({
        message: 'Failed to send verification email. Please try again.',
        type: 'error'
      });
    } finally {
      setSending(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      setToast({
        message: 'Failed to sign out. Please try again.',
        type: 'error'
      });
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-white dark:bg-black relative">
      <div className="absolute inset-0 z-0">
        <DotGrid
          dotSize={5}
          gap={15}
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      <div className="relative z-50">
        <Navbar />
      </div>

      <div className="absolute inset-0 pt-16 z-10 flex items-center justify-center px-8 gap-16">
        <div className="w-96 flex-shrink-0">
          <div className="bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="text-center">
              <Link href="/" className="inline-block">
                <Image
                  src="/logo_light.png"
                  alt="QODEX Logo"
                  width={100}
                  height={32}
                  className="mx-auto dark:hidden"
                  priority
                />
                <Image
                  src="/logo_dark.png"
                  alt="QODEX Logo"
                  width={100}
                  height={32}
                  className="mx-auto hidden dark:block"
                  priority
                />
              </Link>
              <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                Check Your Email
              </h2>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Verify your account to continue
              </p>
            </div>

            <div className="flex justify-center py-2">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  We&apos;ve sent a verification link to:
                </p>
                <div className="px-3 py-2 bg-gray-100 dark:bg-white/10 rounded-lg">
                  <p className="text-xs font-medium text-gray-900 dark:text-white break-all">
                    {user?.email}
                  </p>
                </div>
              </div>

              <p className="text-xs text-center text-gray-600 dark:text-gray-400 leading-relaxed">
                Click the link in the email to verify your account and access Qodex.
                Don&apos;t forget to check your spam folder!
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleResendVerification}
                disabled={sending}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 bg-gray-900 hover:bg-gray-800 dark:bg-gray-200 dark:hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-black font-medium rounded-lg transition-all duration-300 shadow-lg text-sm"
              >
                {sending ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Resend Verification Email
                  </>
                )}
              </button>

              <button
                onClick={handleSignOut}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 bg-white/90 dark:bg-white/5 backdrop-blur-md hover:bg-white dark:hover:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white font-medium rounded-lg transition-all duration-300 text-sm"
              >
                <LogOut className="w-4 h-4" />
                Use Different Account
              </button>
            </div>
          </div>
        </div>

        <div className="hidden xl:flex flex-shrink-0 items-center">
          <BrowserWindow className="w-[800px]" />
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}