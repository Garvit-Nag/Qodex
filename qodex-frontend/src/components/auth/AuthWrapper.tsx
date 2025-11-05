/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';
import VerificationPending from './VerificationPending';
import CustomLoader from '../ui/LoaderComponent';

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
      <CustomLoader />
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