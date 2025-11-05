/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import DotGrid from '@/components/DotGrid';
import BrowserWindow from '@/components/ui/BrowserWindow';
import Navbar from '@/components/layout/Navbar';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { signUpWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // Validation
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

    try {
      await signUpWithEmail(email, password, name);
      setSuccessMessage('Account created successfully! Please check your email to verify your account.');
      // Don't redirect immediately, let user see the message
      setTimeout(() => {
        router.push('/auth/signin');
      }, 3000);
    } catch (err: any) {
      if (err.code === 409 || err.message?.includes('already exists')) {
        setError('An account with this email already exists. Try signing in instead.');
      } else if (err.message?.includes('password')) {
        setError('Password must be at least 8 characters long and contain letters and numbers.');
      } else if (err.message?.includes('email')) {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setSuccessMessage('');

    try {
      await signInWithGoogle();
    } catch (err: any) {
      if (err.message?.includes('email') || err.code === 409) {
        setError('This email is already registered. Try signing in instead.');
      } else {
        setError('Failed to sign up with Google. Please try again.');
      }
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-white dark:bg-black relative">
      {/* Full Background DotGrid */}
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

      {/* Translucent Navbar */}
      <div className="relative z-50">
        <Navbar />
      </div>

      {/* Main Content - SAME LAYOUT AS SIGN-IN */}
      <div className="absolute inset-0 pt-16 z-10 flex items-center justify-center px-8 gap-16">
        {/* Sign Up Box - EXACT SAME SIZE AS SIGN-IN */}
        <div className="w-96 flex-shrink-0">
          <div className="bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-2xl shadow-2xl p-6 space-y-5">
            {/* Logo */}
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
                Create your account
              </h2>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Join Qodex today
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg backdrop-blur-sm">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium break-words">{error}</span>
                </div>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-3 py-2 rounded-lg backdrop-blur-sm">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium break-words">{successMessage}</span>
                </div>
              </div>
            )}

            {/* Google Sign Up */}
            <div>
              <button
                onClick={handleGoogleSignUp}
                disabled={loading}
                className="w-full flex justify-center items-center px-4 py-2.5 bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-lg shadow-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 transition-all duration-300 disabled:opacity-50"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            </div>

            {/* SYMMETRIC DIVIDER */}
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-300 dark:border-white/20"></div>
              <span className="flex-shrink mx-4 text-xs text-gray-500 dark:text-gray-400">
                Or continue with email
              </span>
              <div className="flex-grow border-t border-gray-300 dark:border-white/20"></div>
            </div>

            {/* Email Form - 2 COLUMN GRID LAYOUT */}
            <form className="space-y-3" onSubmit={handleEmailSignUp}>
              {/* Name and Email - Side by Side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="name" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError('');
                    }}
                    className="w-full px-3 py-2.5 bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 text-sm"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className="w-full px-3 py-2.5 bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 text-sm"
                    placeholder="Your email"
                  />
                </div>
              </div>

              {/* Password and Confirm Password - Side by Side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
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
                    placeholder="Password"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm password
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
                    placeholder="Confirm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 bg-gray-900 hover:bg-gray-800 dark:bg-gray-200 dark:hover:bg-gray-300 text-white dark:text-black font-medium rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-sm"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white dark:text-black" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    'Create account'
                  )}
                </button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
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

        {/* Browser Window - SAME AS SIGN-IN */}
        <div className="hidden xl:flex flex-shrink-0 items-center">
          <BrowserWindow className="w-[800px]" />
        </div>
      </div>
    </div>
  );
}