/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useContext, createContext } from 'react';
import { account, databases, DATABASE_ID, USER_PROFILES_COLLECTION_ID, ID } from '@/lib/appwrite';
import { User, UserProfile, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      console.log('🔍 Checking user session...');
      const currentUser = await account.get();
      console.log('✅ User found:', currentUser);
      setUser(currentUser as User);
      await fetchUserProfile(currentUser.$id);
    } catch (error: any) {
      console.log('❌ No user session or error:', error);
      console.log('Error details:', {
        message: error.message,
        code: error.code,
        type: error.type
      });
      setUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('🔄 Fetching user profile for:', userId);
      const profile = await databases.getDocument(
        DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        userId
      );
      console.log('✅ User profile found:', profile);
      setUserProfile(profile as unknown as UserProfile);
    } catch (error: any) {
      console.log('❌ User profile not found, creating new one...');
      if (error.code === 404) {
        // Profile doesn't exist, create it
        await createUserProfile(userId);
      } else {
        console.error('Error fetching user profile:', error);
      }
    }
  };
  const createUserProfile = async (userId: string) => {
    try {
      console.log('🔄 Creating user profile for:', userId);
      const profile = await databases.createDocument(
        DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        userId,
        {
          subscription_tier: 'demo',
          repos_uploaded_count: 0,
          max_repos_allowed: 2,
        }
      );
      console.log('✅ User profile created:', profile);
      setUserProfile(profile as unknown as UserProfile);
    } catch (error: any) {
      console.error('❌ Failed to create user profile:', error);
      // Don't throw error - just log it
      // The app should still work without user profile initially
    }
  };
  const signInWithEmail = async (email: string, password: string) => {
  setLoading(true);
  try {
    console.log('🔄 Creating email session...');
    await account.createEmailPasswordSession(email, password);
    console.log('✅ Session created successfully');
    await checkUser();
  } catch (error: any) {
    console.error('❌ Sign in error in useAuth:', error);
    setLoading(false);
    // CRITICAL: Make sure we're throwing the exact error
    throw error;
  }
  // Don't set loading to false here - checkUser() will handle it
};

  const signUpWithEmail = async (email: string, password: string, name: string) => {
  setLoading(true);
  try {
    console.log('🔄 Creating user account...');
    const newUser = await account.create(ID.unique(), email, password, name);
    console.log('✅ User created:', newUser);
    
    console.log('🔄 Creating session...');
    await account.createEmailPasswordSession(email, password);
    console.log('✅ Session created');

    // 🆕 Send verification email immediately after signup
    try {
      console.log('📧 Sending verification email...');
      await account.createVerification(`${window.location.origin}/auth/verify`);
      console.log('✅ Verification email sent');
    } catch (verifyError: any) {
      console.error('❌ Failed to send verification email:', verifyError);
      // Don't block the signup process if verification email fails
    }

    console.log('🔄 Checking user state...');
    await checkUser();
    console.log('✅ Signup process completed');
  } catch (error: any) {
    console.error('❌ Signup failed:', error);
    setLoading(false);
    throw error;
  }
};

  const signInWithGoogle = async () => {
    try {
      account.createOAuth2Session(
        'google' as any,
        `${window.location.origin}/auth/callback`,
        `${window.location.origin}/auth/signin`
      );
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      throw error;
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user.$id);
    }
  };

  // 🆕 Send verification email
  // 🆕 Send verification email
const sendVerificationEmail = async (): Promise<boolean> => {
  try {
    console.log('📧 Sending verification email...');
    const response = await account.createVerification(`${window.location.origin}/auth/verify`);
    console.log('✅ Verification email response:', response);
    return true;
  } catch (error: any) {
    console.error('❌ Failed to send verification email:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      type: error.type
    });
    throw error;
  }
};

  // 🆕 Verify email with userId and secret from URL
  const verifyEmail = async (userId: string, secret: string): Promise<boolean> => {
    try {
      await account.updateVerification(userId, secret);
      await checkUser(); // Refresh user state to get updated verification status
      return true;
    } catch (error) {
      console.error('Failed to verify email:', error);
      throw error;
    }
  };

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        userProfile,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        refreshUserProfile,
        sendVerificationEmail,
        verifyEmail,
      }
    },
    children
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}