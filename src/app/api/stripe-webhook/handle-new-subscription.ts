import {
  SubscriptionActivated,
  SubscriptionActivationInvoice,
} from "@/app/_others/email/templates/SubscriptionTemplates";
import { db } from "@/db";
import {
  subscriptionHistoryTable,
  usersTable,
  userSubscriptionsTable,
} from "@/db/schema";
import { getUserById } from "@/lib/utils-functions/getUserById";
import { QueryClient } from "@tanstack/react-query";
import { eq, sql } from "drizzle-orm";
import moment from "moment";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import Stripe from "stripe";

export const handleNewSubscription = async (
  subscription: Stripe.Subscription,
  eventType: string,
  stripe: Stripe,
  resend: Resend
) => {
  console.log(`➡️ Handling ${eventType} for subscription: ${subscription.id}`);
  const queryClient = new QueryClient();
  const userId = subscription.metadata.userId;
  const tokenQuantity = parseInt(subscription.metadata.tokenQuantity || "0");
  const modelQuantity = parseInt(subscription.metadata.modelQuantity || "0");

  if (!userId || isNaN(tokenQuantity) || isNaN(modelQuantity)) {
    console.error("❌ Missing required metadata for new/renewed subscription.");
    return;
  }

  try {
    const interval = subscription.metadata.interval;
    const price = subscription.metadata.price;
    const planName = subscription.metadata.planName;
    const userId = subscription.metadata.userId;
    const userEmail = subscription.metadata.userEmail;
    const customer = await stripe.customers.retrieve(
      subscription.customer as string
    );
    const companyName = subscription.metadata?.companyName || "";
    const vatNumber = subscription.metadata?.vatNumber || "";
    const companyAddress = subscription.metadata?.companyAddress || "";

    let invoiceUrl: string = "";
    let invoiceId = "";
    if (subscription.latest_invoice) {
      try {
        const invoiceIdData =
          typeof subscription.latest_invoice === "string"
            ? subscription.latest_invoice
            : subscription.latest_invoice.id;

        const invoice = await stripe.invoices.retrieve(invoiceIdData!);
        invoiceUrl = invoice.hosted_invoice_url || invoice.invoice_pdf || "";
        invoiceId = invoice.id ?? "";
      } catch (error) {
        console.error("Error fetching invoice:", error);
      }
    }

    if (invoiceUrl && !invoiceId) {
      const match = invoiceUrl.match(/\/i\/(.+)/);
      invoiceId = match ? match[1] : "";
    }

    const subscriptionData = {
      stripeCustomerId: subscription.customer.toString(),
      planName,
      eventType,
      subscriptionId: subscription.id,
      userId: subscription.metadata.userId,
      userEmail,
      status: subscription.status,
      tokens: tokenQuantity,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      eventTimestamp: new Date(),
      created: new Date(subscription.created * 1000),
      interval: interval ?? "unknown",
      price,
      invoiceUrl,
      invoiceId,
      currentPeriodEnd: new Date(),
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

    const creditsData = {
      userId: subscription.metadata.userId,
      subscriptionId: subscription.id,
      userEmail,
      source: "subscription",
      type: "Subscription",
      eventType,
      description: planName,
      tokenQuantity: tokenQuantity,
      price,
      invoiceUrl: invoiceUrl,
      interval: interval,
      invoiceId,
      createdDate: new Date(subscription.created * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: currentPeriodEndTimestamp
        ? new Date(currentPeriodEndTimestamp * 1000)
        : undefined,
      tokensExpireAt: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      companyName,
      vatNumber,
      companyAddress,
    };

    await db
      .insert(userSubscriptionsTable)
      .values(subscriptionData)
      .onConflictDoUpdate({
        target: userSubscriptionsTable.subscriptionId,
        set: subscriptionData,
      });

    // Upsert subscription history (assuming overwrite per subscription ID as in original)
    const [res] = await db
      .insert(subscriptionHistoryTable)
      .values(creditsData)
      .onConflictDoUpdate({
        target: subscriptionHistoryTable.subscriptionId,
        set: creditsData,
      })
      .returning();

    const userData = await getUserById(userId);
    if (!userData) {
      console.error(`❌ User ${userId} not found for subscription update.`);
      return;
    }

    const updateData = {
      subscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      tokens: sql`${usersTable.tokens} + ${tokenQuantity}::numeric`,
      models: sql`${userData.models + modelQuantity}`,
      totalTokens: String(tokenQuantity),
    };

    await db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, userData.id));
    console.log(
      `✅ Added ${tokenQuantity} tokens to user ${userId} and updated subscription status.`
    );
    await queryClient.invalidateQueries({ queryKey: ["users", userId] });
    revalidatePath("/");
    if (!customer.deleted && customer.email) {
      const customerEmail = customer.email;

      if (
        subscription.cancel_at_period_end === false &&
        userData.notificationPreference?.subscriptionEmail
      ) {
        const { error } = await resend.emails.send({
          from: process.env.COMPANY_EMAIL!,
          to: customerEmail,
          subject: `🎉 Your ${planName} Subscription is Active!`,
          react: SubscriptionActivationInvoice({
            planName,
            tokenQuantity: +tokenQuantity,
            price: +price,
            interval: interval || "month",
            nextRenewalDate: moment(currentPeriodEndTimestamp! * 1000).format(
              "DD-MMM-YYYY"
            ),
            customerEmail,
            transaction: res.id ? res : undefined,
            currentUser: userData,
          }),
        });
        console.log("Email Error: ", error);
        return;
      }
    }

    console.log(
      `✅ Subscription history for ${subscription.id} saved for event ${eventType}.`
    );
  } catch (error) {
    console.error("❌ Error processing new/renewed subscription:", error);
  }
};
