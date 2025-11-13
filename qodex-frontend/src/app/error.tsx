/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, Home, ArrowLeft, RefreshCw } from 'lucide-react';
import LiquidEther from '@/components/LiquidEther';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const [countdown, setCountdown] = useState(5);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setShouldRedirect(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (shouldRedirect) {
      router.push('/');
    }
  }, [shouldRedirect, router]);

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
      <div className="fixed inset-0 z-0">
        <LiquidEther
          colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
          mouseForce={15}
          cursorSize={80}
          resolution={0.4}
          autoDemo={true}
          autoSpeed={0.3}
          autoIntensity={1.8}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-2xl p-6 shadow-xl">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
            Something went wrong
          </h1>

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 text-center">
            We encountered an unexpected error. Please try again.
          </p>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mb-4 text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Redirecting to home in <span className="font-medium">{countdown}s</span>
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={reset}
              className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/"
                className="bg-white/80 hover:bg-gray-100 dark:bg-white/10 dark:hover:bg-white/20 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20 font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>

              <button
                onClick={() => router.back()}
                className="bg-white/80 hover:bg-gray-100 dark:bg-white/10 dark:hover:bg-white/20 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20 font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}