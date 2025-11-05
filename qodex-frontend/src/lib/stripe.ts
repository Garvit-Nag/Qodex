import Stripe from 'stripe';

// Only initialize on server-side
let stripe: Stripe | null = null;

if (typeof window === 'undefined') {
  // Server-side only
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-10-29.clover',
  });
}

export { stripe };

// Subscription plans configuration (can be used anywhere)
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Code Explorer',
    price: 0,
    currency: 'INR',
    period: 'monthly',
    features: [
      '10 repositories per month',
      '25 messages per conversation',
      'Code syntax highlighting',
      'Community support'
    ],
    repos_limit: 10,
    message_limit: 25,
    stripe_price_id: null
  },
  premium: {
    id: 'premium',
    name: 'Code Pro',
    price: 499,
    currency: 'INR',
    period: 'monthly',
    features: [
      '30 repositories per month',
      'Unlimited messages per conversation',
      'Code syntax highlighting',
      'Community support',
      'Export chat history'
    ],
    repos_limit: 30,
    message_limit: null,
    stripe_price_id: process.env.STRIPE_PREMIUM_PRICE_ID
  }
} as const;

// Helper to get plan details
export const getPlanDetails = (planId: 'free' | 'premium') => {
  return SUBSCRIPTION_PLANS[planId];
};

// Stripe configuration for frontend
export const stripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  currency: 'inr',
  name: 'QODEX',
  description: 'AI Code Analysis Subscription',
};