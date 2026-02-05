import { SubscriptionEnded } from '@/app/_others/email/templates/SubscriptionTemplates';
import { db } from '@/db';
import { usersTable, userSubscriptionsTable } from '@/db/schema';
import { getUserById } from '@/lib/utils-functions/getUserById';
import { QueryClient } from '@tanstack/react-query';
import { eq } from 'drizzle-orm';
import moment from 'moment';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';
import Stripe from 'stripe';

export const handleSubscriptionDeletion = async (
  subscription: Stripe.Subscription,
  stripe: Stripe,
  resend: Resend
) => {
  console.log(`❌ Handling deletion for subscription: ${subscription.id}`);
  const queryClient = new QueryClient();
  const userId = subscription.metadata.userId;

  if (!userId) {
    console.error('❌ Missing userId metadata for subscription deletion.');
    return;
  }

  try {
    const planName = subscription.metadata.planName;
    const remainingTokens = subscription.metadata.remainingTokens;
    const customer = await stripe.customers.retrieve(
      subscription.customer as string
    );
    const userId = subscription.metadata.userId;

    const eventType = 'customer.subscription.deleted';

    // Check if subscription exists
    const existingSubscription = await db
      .select()
      .from(userSubscriptionsTable)
      .where(eq(userSubscriptionsTable.subscriptionId, subscription.id))
      .limit(1);

    if (existingSubscription.length === 0) {
      console.log('Subscription not exists:', subscription.id);
      return;
    }

    const subscriptionData: any = {
      eventType,
      status: subscription.status,
      cancelAtPeriodEnd: !!subscription.cancel_at,
    };
    const currentPeriodEndTimestamp =
      subscription.items.data.length > 0
        ? subscription.items.data[0].current_period_end
        : null;

    subscriptionData.currentPeriodEnd = currentPeriodEndTimestamp
      ? new Date(currentPeriodEndTimestamp * 1000)
      : null;

    await db
      .update(userSubscriptionsTable)
      .set(subscriptionData)
      .where(eq(userSubscriptionsTable.subscriptionId, subscription.id));

    const currentUser = await getUserById(userId);
    if (!currentUser) {
      console.error(`❌ User ${userId} not found for subscription update.`);
      return;
    }

    const updateData = {
      subscriptionId: null,
      stripeCustomerId: null,
    };

    await db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, currentUser.id));
    await queryClient.invalidateQueries({ queryKey: ['users', userId] });
    revalidatePath('/');
    console.log(
      `✅ Subscription history for ${subscription.id} saved for event ${eventType}.`
    );
    if (!customer.deleted && customer.email && existingSubscription) {
      const customerEmail = customer.email;

      if (
        subscription.cancel_at_period_end === true &&
        currentUser.notificationPreference?.subscriptionEmail
      ) {
        const { error } = await resend.emails.send({
          from: process.env.COMPANY_EMAIL!,
          to: customerEmail,
          subject: `🔴 Your ${planName} Subscription Has Ended`,
          react: SubscriptionEnded({
            planName,
            endDate: moment(currentPeriodEndTimestamp! * 1000).format(
              'DD-MMM-YYYY'
            ),
            remainingTokens: +remainingTokens,
            customerEmail,
          }),
        });
        console.log('Email Error: ', error);
        return;
      }
    }
    console.log(`✅ Finalized subscription cancellation for user ${userId}.`);
  } catch (error) {
    console.error('❌ Error processing subscription deletion:', error);
  }
};
