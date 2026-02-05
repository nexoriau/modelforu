import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import Stripe from 'stripe';
import { fulfillOrder } from './fulfill-order';
import { handleNewSubscription } from './handle-new-subscription';
import { handleSubscriptionDeletion } from './handle-subscription-delete';
import { handleSubscriptionUpdate } from './handle-subscription-update';

const resend = new Resend(process.env.RESEND_API_KEY!);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    console.error('❌ Missing Stripe signature');
    return NextResponse.json(
      { error: 'Missing Stripe signature' },
      { status: 400 }
    );
  }

  if (!webhookSecret) {
    console.error('❌ Stripe webhook secret missing');
    return NextResponse.json(
      { error: 'Stripe webhook secret is not set' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log(`🔔 Received event: ${event.type}`);
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle events with specific functions
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(
        `🛒 Checkout completed: ${session.id}, Mode: ${session.mode}`
      );
      if (session.mode === 'payment') {
        await fulfillOrder(session, stripe, resend);
      }
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;

      if (
        (invoice.billing_reason === 'subscription_create' ||
          invoice.billing_reason === 'subscription_cycle') &&
        invoice.parent?.type === 'subscription_details' &&
        invoice.parent.subscription_details?.subscription
      ) {
        const subscriptionId = invoice.parent.subscription_details
          .subscription as string;
        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);
        await handleNewSubscription(subscription, event.type, stripe, resend);
      }
      break;
    }

    case 'customer.subscription.updated': {
      const eventSubscription = event.data.object as Stripe.Subscription;
      console.log(eventSubscription);
      await handleSubscriptionUpdate(eventSubscription, stripe, resend);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeletion(subscription, stripe, resend);
      break;
    }

    default:
      console.log(`🤷‍♀️ Unhandled event type: ${event.type}`);
  }

  revalidatePath('/');
  revalidatePath('/user/subscription');
  return NextResponse.json({ received: true });
}
