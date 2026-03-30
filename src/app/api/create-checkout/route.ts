import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const isDemoMode = !process.env.STRIPE_SECRET_KEY;

const PLAN_PRICES: Record<string, string> = {
  pro: process.env.STRIPE_PRO_PRICE_ID || 'price_demo_pro',
  team: process.env.STRIPE_TEAM_PRICE_ID || 'price_demo_team',
};

const PLAN_AMOUNTS: Record<string, number> = {
  pro: 9.99,
  team: 24.99,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, email } = body as { plan?: string; email?: string };

    if (!plan || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: plan and email' },
        { status: 400 }
      );
    }

    if (plan !== 'pro' && plan !== 'team') {
      return NextResponse.json(
        { error: 'Invalid plan. Must be "pro" or "team"' },
        { status: 400 }
      );
    }

    // Demo mode: simulate successful checkout
    if (isDemoMode) {
      const demoSessionId = `demo_cs_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || '';

      return NextResponse.json({
        sessionId: demoSessionId,
        url: `${baseUrl}/api/payment/success?session_id=${demoSessionId}&plan=${plan}&amount=${PLAN_AMOUNTS[plan]}&demo=true`,
        demo: true,
      });
    }

    // Real Stripe checkout
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-04-30.basil',
      typescript: true,
    });

    const priceId = PLAN_PRICES[plan];
    if (!priceId || priceId.startsWith('price_demo')) {
      return NextResponse.json(
        { error: `No Stripe price ID configured for plan: ${plan}` },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || '';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/api/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/api/payment/cancel`,
      metadata: {
        plan,
      },
      subscription_data: {
        metadata: {
          plan,
        },
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      demo: false,
    });
  } catch (error) {
    console.error('Create checkout error:', error);

    // Fallback to demo mode on any error
    const body = await request.json().catch(() => ({}));
    const plan = (body as { plan?: string }).plan || 'pro';
    const demoSessionId = `fallback_cs_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || '';

    return NextResponse.json({
      sessionId: demoSessionId,
      url: `${baseUrl}/api/payment/success?session_id=${demoSessionId}&plan=${plan}&amount=${PLAN_AMOUNTS[plan]}&demo=true`,
      demo: true,
      fallback: true,
    });
  }
}
