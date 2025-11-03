'use client';

import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';
import VerificationPending from './VerificationPending';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Define public routes that don't need verification
  const publicRoutes = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/verify',
    '/auth/callback'
  ];

  const isPublicRoute = publicRoutes.includes(pathname);
  const isEmailVerified = user?.emailVerification === true;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is logged in but email not verified
  if (user && !isEmailVerified) {
    // Show verification screen for all routes (including auth routes)
    // unless they're specifically on the verification page
    if (pathname !== '/auth/verify') {
      return <VerificationPending />;
    }
  }

  // Show normal content
  return <>{children}</>;
}