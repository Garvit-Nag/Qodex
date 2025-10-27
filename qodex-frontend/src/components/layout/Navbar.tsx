/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function Navbar() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Initialize theme based on system preference
  useEffect(() => {
    setMounted(true)
    
    // Check if there's a saved preference in localStorage
    const savedTheme = localStorage.getItem('theme')
    
    if (savedTheme) {
      // Use saved preference
      const isDarkMode = savedTheme === 'dark'
      setIsDark(isDarkMode)
      if (isDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } else {
      // Use system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDark(systemPrefersDark)
      if (systemPrefersDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
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

  if (!mounted) return null

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 dark:bg-black/10 backdrop-blur-md border-b border-white/20 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Left */}
          <div className="flex items-center">
            <Link href="/" className="block transition-all duration-300 hover:scale-105 transform">
              <div className="w-32 h-10 flex items-center justify-center">
                
                {/* --- LIGHT MODE LOGO --- */}
                {/* Shown by default, hidden in dark mode */}
                <Image
                  src="/logo_light.png"
                  alt="QODEX Logo"
                  width={128}
                  height={40}
                  className="max-w-full max-h-full object-contain dark:hidden"
                  priority
                />
                
                {/* --- DARK MODE LOGO --- */}
                {/* Hidden by default, shown in dark mode */}
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
          <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-8">
              <a href="#features" className="relative text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-all duration-300 hover:scale-105 transform pb-1 after:absolute after:-bottom-1 after:left-1/2 after:w-0 after:h-0.5 after:bg-purple-500 after:transition-all after:duration-300 hover:after:w-full hover:after:left-0">
                Features
              </a>
              <a href="#pricing" className="relative text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-all duration-300 hover:scale-105 transform pb-1 after:absolute after:-bottom-1 after:left-1/2 after:w-0 after:h-0.5 after:bg-purple-500 after:transition-all after:duration-300 hover:after:w-full hover:after:left-0">
                Pricing
              </a>
              <a href="#docs" className="relative text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-all duration-300 hover:scale-105 transform pb-1 after:absolute after:-bottom-1 after:left-1/2 after:w-0 after:h-0.5 after:bg-purple-500 after:transition-all after:duration-300 hover:after:w-full hover:after:left-0">
                Docs
              </a>
              <a href="#about" className="relative text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-all duration-300 hover:scale-105 transform pb-1 after:absolute after:-bottom-1 after:left-1/2 after:w-0 after:h-0.5 after:bg-purple-500 after:transition-all after:duration-300 hover:after:w-full hover:after:left-0">
                About
              </a>
            </div>
          </div>

          {/* Right side - Auth + Theme */}
          <div className="flex items-center space-x-4">
            {/* Sign In - plain text with scale hover effect */}
            <button className="hidden sm:block text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-all duration-300 hover:scale-105 transform">
              Sign In
            </button>
            
            {/* Try for free - simple solid button */}
            <button className="hidden sm:block bg-gray-900 hover:bg-gray-800 dark:bg-gray-200 dark:hover:bg-gray-300 text-white dark:text-black font-medium py-2 px-6 rounded-full transition-all duration-300 hover:scale-105 border border-white/20 dark:border-gray-400/20">
              Try for free
            </button>

            {/* Theme Toggle */}
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

            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-700 dark:text-white transition-all duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}