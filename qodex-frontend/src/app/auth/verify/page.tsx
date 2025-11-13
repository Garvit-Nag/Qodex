/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import DotGrid from '@/components/DotGrid';
import BrowserWindow from '@/components/ui/BrowserWindow';
import Navbar from '@/components/layout/Navbar';
import Toast from '@/components/auth/VerificationToast';
import { CheckCircle, XCircle, Mail, ArrowRight } from 'lucide-react';

export default function VerifyEmail() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'resending'>('loading');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail, sendVerificationEmail, user } = useAuth();

  useEffect(() => {
    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');

    if (userId && secret) {
      handleVerification(userId, secret);
    } else {
      setStatus('error');
      setMessage('Invalid verification link. Please try again.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      router.push('/dashboard');
    }
  }, [status, countdown, router]);

  const handleVerification = async (userId: string, secret: string) => {
    try {
      await verifyEmail(userId, secret);
      setStatus('success');
      setMessage('Email verified successfully! You can now access all features.');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Failed to verify email. The link may be expired or invalid.');
    }
  };

  const handleResendVerification = async () => {
    if (!user) {
      setToast({
        message: 'Please sign in first to resend verification email.',
        type: 'error'
      });
      return;
    }

    setStatus('resending');
    try {
      await sendVerificationEmail();
      setStatus('error'); 
      setToast({
        message: 'Verification email sent! Please check your inbox and spam folder.',
        type: 'success'
      });
    } catch (error: any) {
      setStatus('error');
      setToast({
        message: error.message || 'Failed to send verification email. Please try again.',
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
            </div>

            <div className="text-center space-y-4">
              {status === 'loading' && (
                <>
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center">
                      <svg className="animate-spin h-8 w-8 text-gray-900 dark:text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Verifying Email...
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Please wait while we verify your email address
                  </p>
                </>
              )}

              {status === 'success' && (
                <>
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Email Verified!
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {message}
                  </p>
                  
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/10 rounded-full text-xs text-gray-700 dark:text-gray-300">
                    <span>Redirecting in {countdown}s</span>
                  </div>
                </>
              )}

              {status === 'error' && (
                <>
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                      <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Verification Failed
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {message}
                  </p>
                </>
              )}

              {status === 'resending' && (
                <>
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center">
                      <Mail className="w-8 h-8 text-gray-900 dark:text-white animate-pulse" />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Sending Email...
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Please wait while we send you a new verification email
                  </p>
                </>
              )}
            </div>

            <div className="space-y-3">
              {status === 'success' && (
                <Link
                  href="/"
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 bg-gray-900 hover:bg-gray-800 dark:bg-gray-200 dark:hover:bg-gray-300 text-white dark:text-black font-medium rounded-lg transition-all duration-300 shadow-lg text-sm"
                >
                  Continue to Qodex
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              {status === 'error' && (
                <>
                  {user ? (
                    <button
                      onClick={handleResendVerification}
                      className="w-full flex justify-center items-center gap-2 py-2.5 px-4 bg-gray-900 hover:bg-gray-800 dark:bg-gray-200 dark:hover:bg-gray-300 text-white dark:text-black font-medium rounded-lg transition-all duration-300 shadow-lg text-sm"
                    >
                      <Mail className="w-4 h-4" />
                      Resend Verification Email
                    </button>
                  ) : (
                    <Link
                      href="/auth/signin"
                      className="w-full flex justify-center items-center gap-2 py-2.5 px-4 bg-gray-900 hover:bg-gray-800 dark:bg-gray-200 dark:hover:bg-gray-300 text-white dark:text-black font-medium rounded-lg transition-all duration-300 shadow-lg text-sm"
                    >
                      Sign In to Resend
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}

                  <Link
                    href="/"
                    className="w-full flex justify-center items-center py-2.5 px-4 bg-white/90 dark:bg-white/5 backdrop-blur-md hover:bg-white dark:hover:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white font-medium rounded-lg transition-all duration-300 text-sm"
                  >
                    Back to Home
                  </Link>
                </>
              )}
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