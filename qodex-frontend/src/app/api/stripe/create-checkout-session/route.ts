/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { stripe, SUBSCRIPTION_PLANS } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    // Check if stripe is initialized
    if (!stripe) {
      console.error('❌ Stripe not initialized');
      return NextResponse.json(
        { error: 'Payment service not available' },
        { status: 500 }
      );
    }

    const { planId, userId, userEmail, userName } = await request.json();

    if (!planId || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Plan ID, User ID, and email are required' },
        { status: 400 }
      );
    }

    if (planId === 'free') {
      return NextResponse.json(
        { error: 'Free plan does not require payment' },
        { status: 400 }
      );
    }

    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
    if (!plan || !plan.stripe_price_id) {
      return NextResponse.json(
        { error: 'Invalid plan ID or missing price ID' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.headers.get('origin')}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/pricing?canceled=true`,
      customer_email: userEmail,
      metadata: {
        userId: userId,
        planId: planId,
        planName: plan.name
      },
      subscription_data: {
        metadata: {
          userId: userId,
          planId: planId
        }
      }
    });

    console.log('✅ Stripe session created:', session.id);

    // Return the checkout URL instead of session ID
    return NextResponse.json({
      checkoutUrl: session.url, // ✅ This is the new way
      sessionId: session.id     // Keep for reference
    });

  } catch (error: any) {
    console.error('❌ Create checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}