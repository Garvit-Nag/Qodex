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

  const publicRoutes = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/verify',
    '/auth/callback'
  ];

  const isPublicRoute = publicRoutes.includes(pathname);
  const isEmailVerified = user?.emailVerification === true;

  if (loading) {
    return (
      <CustomLoader />
    );
  }

  if (user && !isEmailVerified) {
    if (pathname !== '/auth/verify') {
      return <VerificationPending />;
    }
  }

  return <>{children}</>;
}