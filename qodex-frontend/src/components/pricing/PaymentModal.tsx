/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface PaymentModalProps {
  plan: {
    id: string;
    name: string;
    price: number;
    currency: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ plan, onClose, onSuccess }: PaymentModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Creating Stripe checkout session...');
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          userId: user.$id,
          userEmail: user.email,
          userName: user.name
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { checkoutUrl } = await response.json();
      console.log('✅ Checkout session created:', checkoutUrl);

      window.location.href = checkoutUrl;

    } catch (error: any) {
      console.error('❌ Payment error:', error);
      setError(error.message || 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-8 max-w-md w-full border border-border">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Upgrade to {plan.name}
          </h2>
          <p className="text-muted-foreground">
            You&apos;re about to upgrade to our premium plan
          </p>
        </div>

        <div className="bg-muted/30 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-foreground font-medium">{plan.name}</span>
            <span className="text-2xl font-bold text-foreground">
              ₹{plan.price}/month
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Billed monthly • Cancel anytime
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-6 rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 py-3 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                🔒 Pay ₹{plan.price}
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          🔒 Secured by Stripe • Your payment information is encrypted
        </p>
      </div>
    </div>
  );
}