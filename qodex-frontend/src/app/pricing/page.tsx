/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SUBSCRIPTION_PLANS } from '@/lib/stripe';
import DemoCardModal from '@/components/pricing/DemoCardModal';
import SubscriptionManager from '@/components/pricing/SubscriptionManager';
import AuthRequiredModal from '@/components/pricing/AuthRequiredModal';
import PremiumAlertModal from '@/components/pricing/PremiumAlertModal';
import Navbar from '@/components/layout/Navbar';
import LiquidEther from '@/components/LiquidEther';
import { Rocket, Crown } from 'lucide-react';

export default function PricingPage() {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);
  const [showAuthRequiredModal, setShowAuthRequiredModal] = useState(false);
  const [showPremiumAlertModal, setShowPremiumAlertModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle payment success
  useEffect(() => {
    const handlePaymentSuccess = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get('success');
      const sessionId = urlParams.get('session_id');

      if (success === 'true' && sessionId && user) {
        try {
          const response = await fetch('/api/stripe/handle-success', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, userId: user.$id }),
          });

          if (response.ok) {
            await refreshUserProfile();
            window.history.replaceState({}, '', '/pricing');
          }
        } catch (error) {
          console.error('Failed to update subscription:', error);
        }
      }
    };

    if (user) handlePaymentSuccess();
  }, [user, refreshUserProfile]);

  const handleUpgrade = async () => {
    // Check if user is signed in
    if (!user) {
      setShowAuthRequiredModal(true);
      return;
    }

    // Check if user is already premium
    if (userProfile?.subscription_tier === 'premium') {
      setShowPremiumAlertModal(true);
      return;
    }

    // Proceed with upgrade flow
    setShowDemoModal(true);
  };

  const handleDemoModalContinue = async () => {
    setShowDemoModal(false);
    setLoading(true);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: 'premium',
          userId: user!.$id,
          userEmail: user!.email,
          userName: user!.name
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { checkoutUrl } = await response.json();
      window.location.href = checkoutUrl;

    } catch (error: any) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
      setLoading(false);
    }
  };

  const isPremium = userProfile?.subscription_tier === 'premium';

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />

      {/* Background */}
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

      {/* Content */}
      <div className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
              Choose Your Plan
            </h1>
            <p className="text-lg md:text-xl text-gray-700 dark:text-white/90 max-w-2xl mx-auto leading-relaxed">
              Unlock the full potential of AI-powered code analysis
            </p>
          </div>

          {/* Current Plan Display */}
          {userProfile && (
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/90 shadow-lg dark:bg-white/10 backdrop-blur-md border border-gray-200/50 dark:border-white/20 rounded-full">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-900 dark:text-white font-medium">
                  Current Plan: {isPremium ? 'Code Pro' : 'Code Explorer'}
                </span>
                <div className="text-sm text-gray-600 dark:text-white/60">
                  ({userProfile.repos_uploaded_this_month || 0}/{userProfile.max_repos_allowed} repos this month)
                </div>
              </div>
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="relative">
              <div className="h-full bg-white/90 shadow-xl dark:bg-white/5 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-3xl p-8 hover:bg-white/95 dark:hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl flex flex-col min-h-[480px]">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {SUBSCRIPTION_PLANS.free.name}
                  </h3>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                    ₹{SUBSCRIPTION_PLANS.free.price}
                  </div>
                  <p className="text-gray-600 dark:text-white/60">Forever free</p>
                </div>

                <ul className="space-y-3 mb-6 flex-1">
                  {SUBSCRIPTION_PLANS.free.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-green-500/30">
                        <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 dark:text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  {isPremium ? (
                    <button
                      onClick={() => setShowSubscriptionManager(true)}
                      className="w-full py-3 px-6 rounded-xl bg-gray-100 dark:bg-white/10 backdrop-blur-sm border border-gray-200 dark:border-white/20 text-gray-700 dark:text-white/80 hover:bg-gray-200 dark:hover:bg-white/20 transition-all duration-300 font-medium"
                    >
                      Switch to Free
                    </button>
                  ) : (
                    <button className="w-full py-3 px-6 rounded-xl bg-green-100 dark:bg-green-900/30 backdrop-blur-sm border border-green-300 dark:border-green-700/50 text-green-800 dark:text-green-300 font-medium cursor-default">
                      Current Plan
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="relative">
              {/* Most Popular Badge */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <div className="flex items-center gap-2 bg-white/90 shadow-lg dark:bg-gray-200 text-gray-900 dark:text-black px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md border border-gray-200/50 dark:border-gray-300/50">
                  <Crown className="w-4 h-4" />
                  Most Popular
                </div>
              </div>

              {/* Premium Card */}
              <div className="h-full bg-white/90 shadow-xl dark:bg-white/5 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-3xl p-8 hover:bg-white/95 dark:hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl flex flex-col min-h-[480px]">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {SUBSCRIPTION_PLANS.premium.name}
                  </h3>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                    ₹{SUBSCRIPTION_PLANS.premium.price}
                  </div>
                  <p className="text-gray-600 dark:text-white/60">per month</p>
                </div>

                <ul className="space-y-3 mb-6 flex-1">
                  {SUBSCRIPTION_PLANS.premium.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className={`w-5 h-5 ${index < 2 ? 'bg-purple-500/20 border-purple-500/30' : 'bg-green-500/20 border-green-500/30'} backdrop-blur-sm rounded-full flex items-center justify-center border`}>
                        <svg className={`w-3 h-3 ${index < 2 ? 'text-purple-500' : 'text-green-500'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className={`${index < 2 ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-700 dark:text-white/80'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  {isPremium ? (
                    <button className="w-full py-3 px-6 rounded-xl bg-green-100 dark:bg-green-900/30 backdrop-blur-sm border border-green-300 dark:border-green-700/50 text-green-800 dark:text-green-300 font-medium cursor-default">
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={handleUpgrade}
                      disabled={loading}
                      className="w-full py-3 px-6 rounded-xl bg-gray-900 hover:bg-gray-800 dark:bg-gray-200 dark:hover:bg-gray-300 text-white dark:text-black transition-all duration-300 font-medium shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        'Processing...'
                      ) : (
                        <>
                          <Rocket className="w-4 h-4" />
                          Upgrade to Pro
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-24 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/90 shadow-lg dark:bg-white/5 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-2xl p-6 text-left">
                <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">Can I cancel anytime?</h3>
                <p className="text-gray-700 dark:text-white/80">Yes! Cancel your subscription anytime. You&apos;ll keep access until your billing period ends.</p>
              </div>
              <div className="bg-white/90 shadow-lg dark:bg-white/5 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-2xl p-6 text-left">
                <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">What happens to my data?</h3>
                <p className="text-gray-700 dark:text-white/80">Your data is always yours. Chat history and analyses remain accessible even after downgrading.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDemoModal && (
        <DemoCardModal
          onClose={() => setShowDemoModal(false)}
          onContinue={handleDemoModalContinue}
        />
      )}

      {showSubscriptionManager && (
        <SubscriptionManager
          onClose={() => setShowSubscriptionManager(false)}
        />
      )}

      {showAuthRequiredModal && (
        <AuthRequiredModal
          onClose={() => setShowAuthRequiredModal(false)}
        />
      )}

      {showPremiumAlertModal && (
        <PremiumAlertModal
          onClose={() => setShowPremiumAlertModal(false)}
          onManageSubscription={() => setShowSubscriptionManager(true)}
        />
      )}
    </div>
  );
}