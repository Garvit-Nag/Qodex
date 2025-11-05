/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

interface SubscriptionManagerProps {
  onClose: () => void;
}

export default function SubscriptionManager({ onClose }: SubscriptionManagerProps) {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCancelSubscription = async () => {
    if (!user || !userProfile?.subscription_id) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.$id,
          subscriptionId: userProfile.subscription_id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel subscription');
      }

      await refreshUserProfile();
      setSuccess(true);
      
      // Auto close after success
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error: any) {
      console.error('Cancel subscription error:', error);
      setError(error.message || 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="bg-card rounded-2xl p-4 max-w-lg w-full border border-border">
          {/* Success Header */}
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-1">
              Subscription Cancelled
            </h2>
            <p className="text-muted-foreground text-sm">
              You&apos;ll continue to have access until your current billing period ends.
            </p>
          </div>

          {/* Success Info Card */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-green-800 dark:text-green-200">Successfully Cancelled</div>
                <div className="text-xs text-green-600 dark:text-green-400">No further charges will be made</div>
              </div>
            </div>
          </div>

          {/* Auto Close Message */}
          <div className="text-center text-xs text-muted-foreground">
            This dialog will close automatically in 2 seconds
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-4 max-w-lg w-full border border-border">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-foreground mb-1">
            Cancel Subscription
          </h2>
          <p className="text-muted-foreground text-sm">
            Are you sure you want to cancel your premium subscription?
          </p>
        </div>

       {/* Warning Card */}
<div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-lg p-4 mb-4">
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
      <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
    </div>
    <div>
      <div className="text-sm font-medium text-orange-800 dark:text-orange-200">What happens next?</div>
      <div className="text-xs text-orange-600 dark:text-orange-400">Access continues until billing period ends</div>
    </div>
  </div>
</div>

{/* Cancellation Details */}
<div className="space-y-3 mb-4">
  <div className="flex items-start gap-3 p-3 bg-gray-100 dark:bg-muted/20 rounded-lg border border-border/30">
    <div className="w-2 h-2 bg-black dark:bg-white rounded-full mt-2 flex-shrink-0"></div>
    <div>
      <div className="text-sm font-medium text-foreground">Immediate Effect</div>
      <div className="text-xs text-muted-foreground">No new charges will be made to your account</div>
    </div>
  </div>
  
  <div className="flex items-start gap-3 p-3 bg-gray-100 dark:bg-muted/20 rounded-lg border border-border/30">
    <div className="w-2 h-2 bg-black dark:bg-white rounded-full mt-2 flex-shrink-0"></div>
    <div>
      <div className="text-sm font-medium text-foreground">Access Maintained</div>
      <div className="text-xs text-muted-foreground">Premium features remain active until billing cycle ends</div>
    </div>
  </div>
  
  <div className="flex items-start gap-3 p-3 bg-gray-100 dark:bg-muted/20 rounded-lg border border-border/30">
    <div className="w-2 h-2 bg-black dark:bg-white rounded-full mt-2 flex-shrink-0"></div>
    <div>
      <div className="text-sm font-medium text-foreground">Easy Reactivation</div>
      <div className="text-xs text-muted-foreground">Upgrade again anytime from the pricing page</div>
    </div>
  </div>
</div>

{/* Error Message */}
{error && (
  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-3 mb-4">
    <div className="flex items-center gap-2">
      <X className="w-4 h-4 text-red-600 dark:text-red-400" />
      <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
    </div>
  </div>
)}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2 px-4 rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50 text-sm"
          >
            Keep Subscription
          </button>
          <button
            onClick={handleCancelSubscription}
            disabled={loading}
            className="flex-1 py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 flex items-center justify-center text-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                Cancelling...
              </>
            ) : (
              'Cancel Subscription'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}