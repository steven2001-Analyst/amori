import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const isDemoMode = !process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Demo mode: handle gracefully
    if (isDemoMode) {
      const body = await request.json().catch(() => null);
      if (body && body.type) {
        console.log(`[Stripe Webhook - Demo Mode] Received event: ${body.type}`);
      }
      return NextResponse.json({ received: true, demo: true });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-04-30.basil',
      typescript: true,
    });

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const plan = session.metadata?.plan as string || 'pro';
        const customerEmail = session.customer_email || session.customer_details?.email || '';

        console.log(`[Stripe] Checkout completed: session=${session.id}, plan=${plan}, email=${customerEmail}`);

        // In a real app, you would update your database here
        // For this implementation, we return the subscription data for the client
        return NextResponse.json({
          received: true,
          event: 'checkout.session.completed',
          subscription: {
            plan,
            status: 'active',
            customerEmail,
            sessionId: session.id,
          },
        });
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const plan = subscription.metadata?.plan as string || 'pro';

        console.log(`[Stripe] Subscription deleted: sub=${subscription.id}, plan=${plan}`);

        return NextResponse.json({
          received: true,
          event: 'customer.subscription.deleted',
          subscription: {
            plan,
            status: 'cancelled',
            subscriptionId: subscription.id,
          },
        });
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerEmail = invoice.customer_email || '';

        console.log(`[Stripe] Payment failed: invoice=${invoice.id}, email=${customerEmail}`);

        return NextResponse.json({
          received: true,
          event: 'invoice.payment_failed',
          payment: {
            status: 'failed',
            invoiceId: invoice.id,
            customerEmail,
          },
        });
      }

      default:
        console.log(`[Stripe] Unhandled event type: ${event.type}`);
        return NextResponse.json({ received: true, event: event.type });
    }
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
