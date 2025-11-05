/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import CustomLoader from '@/components/ui/LoaderComponent';

export default function VerifyEmail() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'resending'>('loading');
  const [message, setMessage] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail, sendVerificationEmail, user } = useAuth();

  useEffect(() => {
    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');

    if (userId && secret) {
      // Verify email with the provided parameters
      handleVerification(userId, secret);
    } else {
      // No parameters, show resend option
      setStatus('error');
      setMessage('Invalid verification link. Please try again.');
    }
  }, [searchParams]);

  const handleVerification = async (userId: string, secret: string) => {
    try {
      await verifyEmail(userId, secret);
      setStatus('success');
      setMessage('Email verified successfully! You can now access all features.');

      // Redirect to home after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Failed to verify email. The link may be expired or invalid.');
    }
  };

  const handleResendVerification = async () => {
    if (!user) {
      setMessage('Please sign in first to resend verification email.');
      return;
    }

    setStatus('resending');
    try {
      await sendVerificationEmail();
      setStatus('success');
      setMessage('Verification email sent! Please check your inbox and spam folder.');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Failed to send verification email. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <div className="max-w-md w-full space-y-8 p-8 text-center">
        {/* Logo */}
        <div className="text-center">
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
        </div>

        {/* Status Icons */}
        <div className="flex justify-center">
          {status === 'loading' && (
            <CustomLoader />
          )}

          {status === 'success' && (
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}

          {status === 'error' && (
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}

          {status === 'resending' && (
            <CustomLoader />
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {status === 'loading' && 'Verifying Email...'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
          {status === 'resending' && 'Sending Email...'}
        </h2>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-400">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          {status === 'success' && (
            <Link
              href="/"
              className="inline-block w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Continue to Qodex
            </Link>
          )}

          {status === 'error' && (
            <>
              {user ? (
                <button
                  onClick={handleResendVerification}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Resend Verification Email
                </button>
              ) : (
                <Link
                  href="/auth/signin"
                  className="inline-block w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Sign In to Resend
                </Link>
              )}

              <Link
                href="/"
                className="inline-block w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Back to Home
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}