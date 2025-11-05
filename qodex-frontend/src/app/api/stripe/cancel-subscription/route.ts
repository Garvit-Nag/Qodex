/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { databases, DATABASE_ID, USER_PROFILES_COLLECTION_ID } from '@/lib/appwrite';

export async function POST(request: NextRequest) {
  try {
    const { userId, subscriptionId } = await request.json();

    if (!stripe) {
      return NextResponse.json({ error: 'Payment service not available' }, { status: 500 });
    }

    if (!userId || !subscriptionId) {
      return NextResponse.json({ error: 'User ID and subscription ID are required' }, { status: 400 });
    }

    // Cancel the subscription in Stripe
    await stripe.subscriptions.cancel(subscriptionId);

    // Update user profile in Appwrite
    await databases.updateDocument(
      DATABASE_ID,
      USER_PROFILES_COLLECTION_ID,
      userId,
      {
        subscription_tier: 'free',
        subscription_status: 'cancelled',
        max_repos_allowed: 10
      }
    );

    console.log('✅ Subscription cancelled:', subscriptionId);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('❌ Cancel subscription error:', error);
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }
}