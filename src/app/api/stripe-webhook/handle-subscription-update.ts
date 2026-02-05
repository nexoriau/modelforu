import Stripe from 'stripe';
import { Resend } from 'resend';
import moment from 'moment';
import { db } from '@/db';
import { subscriptionHistoryTable, userSubscriptionsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { QueryClient } from '@tanstack/react-query';
import {
  SubscriptionCancellationNotice,
  SubscriptionRenewed,
} from '@/app/_others/email/templates/SubscriptionTemplates';
import { getUserById } from '@/lib/utils-functions/getUserById';
import { notifySubscription } from '@/app/_others/notification/actions/create-notification';

export const handleSubscriptionUpdate = async (
  subscription: Stripe.Subscription,
  stripe: Stripe,
  resend: Resend
) => {
  console.log(`🔄 Handling update for subscription: ${subscription.id}`);
  const queryClient = new QueryClient();
  const userId = subscription.metadata.userId;

  if (!userId) {
    console.error('❌ Missing userId metadata for subscription update.');
    return;
  }

  const userData = await getUserById(userId);
  if (!userData) {
    console.log('User not found');
    return;
  }

  try {
    const interval = subscription.metadata.interval;
    const price = subscription.metadata.price;
    const planName = subscription.metadata.planName;
    const tokenQuantity = subscription.metadata.tokenQuantity;
    const remainingTokens = subscription.metadata.remainingTokens;
    const customer = await stripe.customers.retrieve(
      subscription.customer as string
    );

    const eventType = 'customer.subscription.updated';

    const existingSubscriptionSnap =
      await db.query.userSubscriptionsTable.findFirst({
        where: eq(userSubscriptionsTable.subscriptionId, subscription.id),
      });

    if (!existingSubscriptionSnap) {
      console.log('Subscription not found:', subscription.id);
      return;
    }

    const subscriptionData: any = {
      eventType,
      status: subscription.status,
      cancelAtPeriodEnd: !!subscription.cancel_at,
    };
    // Add currentPeriodEnd timestamp safely
    const currentPeriodEndTimestamp =
      subscription.items.data.length > 0
        ? subscription.items.data[0].current_period_end
        : undefined;

    if (currentPeriodEndTimestamp) {
      subscriptionData.currentPeriodEnd = new Date(
        currentPeriodEndTimestamp * 1000
      );
    }

    await db
      .update(userSubscriptionsTable)
      .set(subscriptionData)
      .where(eq(userSubscriptionsTable.subscriptionId, subscription.id))
      .returning();

    const historyUpdate = {
      cancellationFeedback: subscription.cancellation_details?.feedback ?? null,
      cancellationComment: subscription.cancellation_details?.comment ?? null,
      cancelAtPeriodEnd: !!subscription.cancel_at,
    };

    await db
      .update(subscriptionHistoryTable)
      .set(historyUpdate)
      .where(eq(subscriptionHistoryTable.subscriptionId, subscription.id));

      console.log("HELLO", subscription)
      console.log("existingSubscriptionSnap", existingSubscriptionSnap)
    // 🔔 SEND NOTIFICATIONS based on update type
    if (subscription.cancel_at_period_end === false && !existingSubscriptionSnap.cancelAtPeriodEnd) {
      // Subscription renewed
      await notifySubscription(userId, 'updated', planName);
    } else if (subscription.cancel_at) {
      // Subscription scheduled for cancellation
      await notifySubscription(userId, 'cancelled', planName);
    }

    if (
      !customer.deleted &&
      customer.email &&
      existingSubscriptionSnap &&
      userData.notificationPreference?.subscriptionEmail
    ) {
      const customerEmail = customer.email;

      if (subscription.cancel_at_period_end === false) {
        const { error } = await resend.emails.send({
          from: process.env.COMPANY_EMAIL!,
          to: customerEmail,
          subject: `🎉 Your ${planName} Subscription is Renewed!`,
          react: SubscriptionRenewed({
            planName,
            tokenQuantity: +tokenQuantity,
            price: +price,
            interval: interval || 'month',
            nextRenewalDate: moment(currentPeriodEndTimestamp! * 1000).format(
              'DD-MMM-YYYY'
            ),
            customerEmail,
          }),
        });
        console.log('Email Error: ', error);
        return;
      }

      if (subscription.cancel_at) {
        const { error } = await resend.emails.send({
          from: process.env.COMPANY_EMAIL!,
          to: customerEmail,
          subject: `🔴 Your ${planName} Subscription Has Ended`,
          react: SubscriptionCancellationNotice({
            planName,
            endDate: moment(currentPeriodEndTimestamp! * 1000).format(
              'DD-MMM-YYYY'
            ),
            tokenQuantity: +tokenQuantity,
            customerEmail,
          }),
        });
        console.log('Email Error: ', error);
        return;
      }
    }
    console.log(
      `✅ Subscription history for ${subscription.id} saved for event ${eventType}.`
    );
    await queryClient.invalidateQueries({ queryKey: ['users', userId] });
    revalidatePath('/');
  } catch (error) {
    console.error('❌ Error processing subscription update:', error);
  }
};
