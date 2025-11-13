/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { databases, DATABASE_ID, USER_PROFILES_COLLECTION_ID } from '@/lib/appwrite';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, userId } = await request.json();

    if (!stripe) {
      return NextResponse.json({ error: 'Payment service not available' }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.metadata) {
      console.error('❌ No metadata found in session:', sessionId);
      return NextResponse.json({ error: 'Session metadata missing' }, { status: 400 });
    }

    const { planId, userId: sessionUserId } = session.metadata;

    if (!planId || !sessionUserId) {
      console.error('❌ Missing required metadata:', { planId, sessionUserId });
      return NextResponse.json({ error: 'Invalid session metadata' }, { status: 400 });
    }

    if (session.payment_status === 'paid' && sessionUserId === userId) {
      const subscriptionId = session.subscription as string;

      const currentDate = new Date().toISOString();
      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

      await databases.updateDocument(
        DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        userId,
        {
          subscription_tier: planId,
          subscription_status: 'active',
          subscription_id: subscriptionId,
          plan_id: planId,
          next_billing_date: nextBillingDate.toISOString(),
          subscription_created_at: currentDate,
          max_repos_allowed: planId === 'premium' ? 30 : 10
        }
      );

      console.log('✅ User subscription updated via success handler:', userId);

      return NextResponse.json({ success: true });
    } else {
      console.error('❌ Payment validation failed:', {
        paymentStatus: session.payment_status,
        sessionUserId,
        requestUserId: userId
      });
      return NextResponse.json({ error: 'Payment not confirmed' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ Success handler error:', error);
    return NextResponse.json({ error: 'Failed to process success' }, { status: 500 });
  }
}