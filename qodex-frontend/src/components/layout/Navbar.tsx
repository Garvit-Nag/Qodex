/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import SignOutModal from '@/components/SignOutModal';

export default function Navbar() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const { user, userProfile, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const isDarkMode = document.documentElement.classList.contains('dark')
    setIsDark(isDarkMode)
  }, [])

  const toggleTheme = () => {
    const newDarkMode = !isDark
    setIsDark(newDarkMode)

    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleSignOutClick = () => {
    setShowUserMenu(false);
    setShowMobileMenu(false);
    setShowSignOutModal(true);
  };

  const handleSignOutConfirm = async () => {
    try {
      await signOut();
      setShowSignOutModal(false);
      router.push('/'); // Redirect to home after logout
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleExploreClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault()
      router.push('/auth/signin')
    }
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false)
      }
      if (showMobileMenu && !target.closest('.mobile-menu-container')) {
        setShowMobileMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserMenu, showMobileMenu])

  if (!mounted) return null

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 dark:bg-black/10 backdrop-blur-md border-b border-white/20 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Left */}
            <div className="flex items-center">
              <Link href="/" className="block transition-all duration-300 hover:scale-105 transform">
                <div className="w-32 h-10 flex items-center justify-center">
                  <Image
                    src="/logo_light.png"
                    alt="QODEX Logo"
                    width={128}
                    height={40}
                    className="max-w-full max-h-full object-contain dark:hidden"
                    priority
                  />
                  <Image
                    src="/logo_dark.png"
                    alt="QODEX Logo"
                    width={128}
                    height={40}
                    className="max-w-full max-h-full object-contain hidden dark:block"
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* Navigation Links - Center */}
            <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2">
              <div className="flex items-center space-x-6">
                {user ? (
                  <Link href="/dashboard" className="relative text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-all duration-300 hover:scale-105 transform pb-1 after:absolute after:-bottom-1 after:left-1/2 after:w-0 after:h-0.5 after:bg-purple-500 after:transition-all after:duration-300 hover:after:w-full hover:after:left-0">
                    Dashboard
                  </Link>
                ) : (
                  <Link href="/" className="relative text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-all duration-300 hover:scale-105 transform pb-1 after:absolute after:-bottom-1 after:left-1/2 after:w-0 after:h-0.5 after:bg-purple-500 after:transition-all after:duration-300 hover:after:w-full hover:after:left-0">
                    Home
                  </Link>
                )}
                <Link href="/pricing" className="relative text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-all duration-300 hover:scale-105 transform pb-1 after:absolute after:-bottom-1 after:left-1/2 after:w-0 after:h-0.5 after:bg-purple-500 after:transition-all after:duration-300 hover:after:w-full hover:after:left-0">
                  Pricing
                </Link>
                {/* Always show Explore link, but protect access */}
                <Link
                  href="/explore"
                  onClick={handleExploreClick}
                  className="relative text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-all duration-300 hover:scale-105 transform pb-1 after:absolute after:-bottom-1 after:left-1/2 after:w-0 after:h-0.5 after:bg-purple-500 after:transition-all after:duration-300 hover:after:w-full hover:after:left-0"
                >
                  Explore
                </Link>
                <Link href="/about" className="relative text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-all duration-300 hover:scale-105 transform pb-1 after:absolute after:-bottom-1 after:left-1/2 after:w-0 after:h-0.5 after:bg-purple-500 after:transition-all after:duration-300 hover:after:w-full hover:after:left-0">
                  About
                </Link>
              </div>
            </div>

            {/* Right side - Desktop Auth + Theme */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Theme Toggle - Always visible */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-700 dark:text-white transition-all duration-300 border border-gray-300/20 dark:border-white/20 hover:border-gray-300/30 dark:hover:border-white/30"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                </div>
              ) : user ? (
                <div className="relative user-menu-container group">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 p-2 text-gray-700 dark:text-white transition-all duration-300"
                  >
                    <div className="relative">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name || 'User'}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium ${user.avatar ? 'hidden' : ''}`}>
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </div>

                    </div>

                    <span className="text-sm font-medium max-w-32 truncate">
                      {user.name || user.email}
                    </span>

                    <svg className={`w-4 h-4 transition-all duration-200 opacity-0 group-hover:opacity-100 ${showUserMenu ? 'rotate-180 opacity-100' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Enhanced Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-300 dark:border-white/20 py-2 overflow-hidden">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            {user.avatar ? (
                              <Image
                                src={user.avatar}
                                alt={user.name || 'User'}
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium ${user.avatar ? 'hidden' : ''}`}>
                              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                            </div>

                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {user.email}
                            </p>

                          </div>
                        </div>

                        {userProfile && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/10">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 dark:text-gray-400">Plan</span>
                              <span className="text-xs font-medium text-purple-600 dark:text-purple-400 capitalize">
                                {userProfile.subscription_tier}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-gray-500 dark:text-gray-400">Repositories</span>
                              <span className="text-xs font-medium text-gray-900 dark:text-white">
                                {userProfile.repos_uploaded_count}/{userProfile.max_repos_allowed}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/5 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z" />
                          </svg>
                          Dashboard
                        </Link>

                      </div>

                      {/* Sign Out */}
                      <div className="border-t border-gray-200 dark:border-white/10 py-1">
                        <button
                          onClick={handleSignOutClick}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-white/60 dark:hover:bg-white/5 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-all duration-300 hover:scale-105 transform"
                  >
                    Sign In
                  </Link>

                  <Link
                    href="/auth/signup"
                    className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-200 dark:hover:bg-gray-300 text-white dark:text-black font-medium py-2 px-6 rounded-full transition-all duration-300 hover:scale-105 border border-white/20 dark:border-gray-400/20"
                  >
                    Try for free
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden mobile-menu-container">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-700 dark:text-white transition-all duration-300 border border-gray-300/20 dark:border-white/20"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Mobile Dropdown - Centered */}
              {showMobileMenu && (
                <div className="absolute right-4 top-full mt-2 w-64 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-300 dark:border-white/20 py-2 overflow-hidden">
                  {/* Navigation Links - Centered */}
                  <div className="py-2">
                    {user ? (
                      <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/5 transition-colors">
                        Dashboard
                      </Link>
                    ) : (
                      <Link href="/" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/5 transition-colors">
                        Home
                      </Link>
                    )}
                    <Link href="/pricing" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/5 transition-colors">
                      Pricing
                    </Link>
                    <Link href="/explore" onClick={handleExploreClick} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/5 transition-colors ">
                      Explore
                    </Link>
                    <Link href="/about" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/5 transition-colors ">
                      About
                    </Link>
                  </div>

                  {/* Theme Toggle - Centered */}
                  <div className="border-t border-gray-200 dark:border-white/10 py-2">
                    <button
                      onClick={toggleTheme}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/5 transition-colors"
                    >
                      {isDark ? (
                        <>
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          Light Mode
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                          Dark Mode
                        </>
                      )}
                    </button>
                  </div>

                  {/* Auth Section - Centered */}
                  {loading ? (
                    <div className="border-t border-gray-200 dark:border-white/10 py-2">
                      <div className="px-4 py-2 flex justify-center">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  ) : user ? (
                    <>
                      {/* User Info - Centered */}
                      <div className="border-t border-gray-200 dark:border-white/10 px-4 py-3">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="relative">
                            {user.avatar ? (
                              <Image
                                src={user.avatar}
                                alt={user.name || 'User'}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium ${user.avatar ? 'hidden' : ''}`}>
                              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* User Menu Items - Centered */}
                      <div className="py-1">


                        <button
                          onClick={handleSignOutClick}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-white/60 dark:hover:bg-white/5 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="border-t border-gray-200 dark:border-white/10 py-2">
                      <Link
                        href="/auth/signin"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/5 transition-colors"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/auth/signup"
                        className="block px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-white/60 dark:hover:bg-white/5 transition-colors font-medium"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        Try for free
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {showSignOutModal && (
          <SignOutModal
            onConfirm={handleSignOutConfirm}
            onCancel={() => setShowSignOutModal(false)}
          />
        )}
      </nav>
      {showSignOutModal && (
        <SignOutModal
          onConfirm={handleSignOutConfirm}
          onCancel={() => setShowSignOutModal(false)}
        />
      )}
    </>
  )

}