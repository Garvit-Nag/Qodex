/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { account } from '@/lib/appwrite';
import CustomLoader from '@/components/ui/LoaderComponent';

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setStatus('Completing authentication...');

        // Get the current user after OAuth
        const user = await account.get();
        console.log('OAuth user:', user);

        // Try to extract and store Google profile picture
        try {
          // Check if we can get additional user info from Google
          const session = await account.getSession('current');
          console.log('Session info:', session);

          // Try to get Google profile picture from OAuth provider data
          if (session.provider === 'google' && session.providerAccessToken) {
            setStatus('Fetching profile picture...');
            await fetchAndStoreGoogleAvatar(session.providerAccessToken, user.$id);
          }
        } catch (avatarError) {
          console.log('Could not fetch Google avatar:', avatarError);
          // Continue anyway - not critical
        }

        setStatus('Redirecting...');
        router.push('/dashboard');
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('Authentication failed. Redirecting...');
        router.push('/auth/signin');
      }
    };

    handleCallback();
  }, [router]);

  // Function to fetch Google profile picture
  const fetchAndStoreGoogleAvatar = async (accessToken: string, userId: string) => {
    try {
      const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
      const userData = await response.json();

      if (userData.picture) {
        // Store the avatar URL in user preferences
        await account.updatePrefs({ avatar: userData.picture });
        console.log('✅ Google avatar stored:', userData.picture);
      }
    } catch (error) {
      console.error('Failed to fetch Google avatar:', error);
    }
  };

  return (
    <CustomLoader />
  );
}