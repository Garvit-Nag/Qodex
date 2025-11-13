/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import DotGrid from '@/components/DotGrid';
import BrowserWindow from '@/components/ui/BrowserWindow';
import Navbar from '@/components/layout/Navbar';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [secret, setSecret] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const userIdParam = searchParams.get('userId');
    const secretParam = searchParams.get('secret');

    if (!userIdParam || !secretParam) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    setUserId(userIdParam);
    setSecret(secretParam);
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    if (!userId || !secret) {
      setError('Invalid reset link. Please request a new password reset.');
      setLoading(false);
      return;
    }

    try {
      const { account } = await import('@/lib/appwrite');
      await account.updateRecovery(userId, secret, password);
      setSuccessMessage('Password reset successfully! Redirecting to sign in...');
      setTimeout(() => {
        router.push('/auth/signin');
      }, 3000);
    } catch (err: any) {
      if (err.message?.includes('expired')) {
        setError('Reset link has expired. Please request a new password reset.');
      } else if (err.message?.includes('invalid')) {
        setError('Invalid reset link. Please request a new password reset.');
      } else if (err.message?.includes('password')) {
        setError('Password must be at least 8 characters long and contain letters and numbers.');
      } else {
        setError(err.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
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
                Reset your password
              </h2>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Enter your new password below
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg backdrop-blur-sm">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium">{error}</span>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-3 py-2 rounded-lg backdrop-blur-sm">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium">{successMessage}</span>
                </div>
              </div>
            )}

            <form className="space-y-3" onSubmit={handleResetPassword}>
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full px-3 py-2.5 bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 text-sm"
                  placeholder="Enter your new password"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm new password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full px-3 py-2.5 bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 text-sm"
                  placeholder="Confirm your new password"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 px-3 py-2 rounded-lg backdrop-blur-sm">
                <p className="text-xs">
                  Password must be at least 8 characters long and contain letters and numbers.
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || !userId || !secret}
                  className="w-full flex justify-center py-2.5 px-4 bg-gray-900 hover:bg-gray-800 dark:bg-gray-200 dark:hover:bg-gray-300 text-white dark:text-black font-medium rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-sm"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white dark:text-black" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Resetting password...
                    </span>
                  ) : (
                    'Reset password'
                  )}
                </button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Remember your password?{' '}
                  <Link
                    href="/auth/signin"
                    className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        <div className="hidden xl:flex flex-shrink-0 items-center">
          <BrowserWindow className="w-[800px]" />
        </div>
      </div>
    </div>
  );
}