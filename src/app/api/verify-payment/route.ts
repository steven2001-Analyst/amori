import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const isDemoMode = !process.env.STRIPE_SECRET_KEY;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('session_id');
    const plan = searchParams.get('plan');
    const demo = searchParams.get('demo');
    const amount = searchParams.get('amount');

    if (!session_id) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      );
    }

    // Demo mode: simulate successful verification
    if (isDemoMode || demo === 'true') {
      const verifiedPlan = (plan === 'pro' || plan === 'team') ? plan : 'pro';
      const verifiedAmount = amount ? parseFloat(amount) : (verifiedPlan === 'pro' ? 9.99 : 24.99);

      return NextResponse.json({
        verified: true,
        demo: true,
        subscription: {
          plan: verifiedPlan,
          status: 'active',
          amount: verifiedAmount,
          currency: 'USD',
          sessionId: session_id,
          activatedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      });
    }

    // Real Stripe verification
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-04-30.basil',
      typescript: true,
    });

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      const plan = session.metadata?.plan as string || 'pro';
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

      return NextResponse.json({
        verified: true,
        demo: false,
        subscription: {
          plan,
          status: subscription.status === 'active' ? 'active' : 'pending',
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency?.toUpperCase() || 'USD',
          sessionId: session.id,
          subscriptionId: subscription.id,
          customerId: session.customer,
          activatedAt: new Date().toISOString(),
          expiresAt: new Date(subscription.current_period_end * 1000).toISOString(),
        },
      });
    }

    return NextResponse.json({
      verified: false,
      error: 'Payment not completed',
      session: {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status,
      },
    });
  } catch (error) {
    console.error('Verify payment error:', error);

    // Fallback: if we can't verify with Stripe, check if it's a demo session
    const { searchParams } = new URL(request.url);
    const demo = searchParams.get('demo');
    const session_id = searchParams.get('session_id');
    const plan = searchParams.get('plan');
    const amount = searchParams.get('amount');

    if (demo === 'true' || (session_id && session_id.startsWith('demo_'))) {
      const verifiedPlan = (plan === 'pro' || plan === 'team') ? plan : 'pro';
      return NextResponse.json({
        verified: true,
        demo: true,
        fallback: true,
        subscription: {
          plan: verifiedPlan,
          status: 'active',
          amount: amount ? parseFloat(amount) : 9.99,
          currency: 'USD',
          sessionId: session_id,
          activatedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      });
    }

    return NextResponse.json(
      { error: 'Payment verification failed', verified: false },
      { status: 500 }
    );
  }
}
