/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { databases, DATABASE_ID, USER_PROFILES_COLLECTION_ID } from '@/lib/appwrite';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    // Check if stripe is initialized
    if (!stripe) {
      console.error('❌ Stripe not initialized');
      return NextResponse.json({ error: 'Payment service not available' }, { status: 500 });
    }

    // ✅ Get raw body as ArrayBuffer then convert to Buffer
    const arrayBuffer = await request.arrayBuffer();
    const body = Buffer.from(arrayBuffer);
    
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('❌ No Stripe signature found in headers');
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    let event;

    try {
      // ✅ Use Buffer instead of string for signature verification
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message);
      console.error('🔍 Debug info:', {
        bodyLength: body.length,
        bodyType: typeof body,
        signatureExists: !!signature,
        webhookSecretExists: !!webhookSecret,
        webhookSecretPreview: webhookSecret?.substring(0, 20) + '...'
      });
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    console.log('✅ Webhook event received:', event.type);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('💳 Payment completed:', session.id);
        
        // Update user subscription
        if (session.metadata?.userId && session.metadata?.planId) {
          await updateUserSubscription(
            session.metadata.userId,
            session.metadata.planId,
            session.subscription as string
          );
        }
        break;

      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        console.log('❌ Subscription cancelled:', subscription.id);
        
        // Handle subscription cancellation
        if (subscription.metadata?.userId) {
          await cancelUserSubscription(subscription.metadata.userId);
        }
        break;

      default:
        console.log(`🤷 Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

// Helper function to update user subscription
async function updateUserSubscription(userId: string, planId: string, subscriptionId: string) {
  try {
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

    console.log('✅ User subscription updated:', userId);
  } catch (error) {
    console.error('❌ Failed to update user subscription:', error);
  }
}

// Helper function to cancel user subscription
async function cancelUserSubscription(userId: string) {
  try {
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

    console.log('✅ User subscription cancelled:', userId);
  } catch (error) {
    console.error('❌ Failed to cancel user subscription:', error);
  }
}