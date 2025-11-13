"use client";
import LiquidEther from "@/components/LiquidEther"
import Link from "next/link";
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function Hero() {
  const { user } = useAuth();
  const router = useRouter();

  const handleGetStartedClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      router.push('/auth/signin');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 z-0">
        <LiquidEther
          colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pointer-events-none">
        <div className="mb-6 pointer-events-auto">
          <div className="inline-flex items-center space-x-2 bg-purple-500/10 dark:bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 dark:border-purple-500/20 rounded-full px-4 py-2 text-sm text-gray-700 dark:text-white/80">
            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>AI-Powered Code Intelligence</span>
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
          Unlock Code Insights.
        </h1>
        <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
          Query Knowledge Within.
        </h2>
        <p className="text-lg md:text-xl text-gray-800 dark:text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
          Transform your codebase into a knowledgeable resource, ready for instant querying. Navigate complex logic with semantic clarity.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pointer-events-auto">
          <Link
            href="/explore"
            onClick={handleGetStartedClick}
            className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-200 dark:hover:bg-gray-300 text-white dark:text-black font-medium py-3 px-8 rounded-full transition-all duration-300 hover:scale-105 shadow-lg border border-white/20 dark:border-gray-400/20 inline-block"
          >
            Get Started
          </Link>
          <Link
            href="/about"
            className="inline-block bg-white/10 dark:bg-white/10 backdrop-blur-sm hover:bg-white/20 dark:hover:bg-white/20 text-gray-900 dark:text-white font-medium py-3 px-8 rounded-full transition-all duration-300 hover:scale-105 border border-white/20 dark:border-white/20 hover:border-white/30 dark:hover:border-white/30"
          >
            View Demo
          </Link>
        </div>
      </div>
    </section>
  )
}