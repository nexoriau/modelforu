import {
  CheckoutEmailTemplate,
  CheckoutEmailWithInvoice,
} from '@/app/_others/email/templates/CheckoutEmailTemplate';
import { notifyCreditsAdded, notifyInvoice } from '@/app/_others/notification/actions/create-notification';
import { db } from '@/db';
import {
  purchaseTable,
  subscriptionHistoryTable,
  usersTable,
} from '@/db/schema';
import { getUserById } from '@/lib/utils-functions/getUserById';
import { QueryClient } from '@tanstack/react-query';
import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';
import Stripe from 'stripe';

export const fulfillOrder = async (
  session: Stripe.Checkout.Session,
  stripe: Stripe,
  resend: Resend
) => {
  console.log('Fulfilling one-time order for session:', session.id);
  const queryClient = new QueryClient();

  // Idempotency guard: check if this sessionId is already present
  const existingPurchaseSnap = await db.query.purchaseTable.findFirst({
    where: eq(purchaseTable.sessionId, session.id),
  });

  if (existingPurchaseSnap) {
    console.log(
      'Order for this session has already been fulfilled:',
      session.id
    );
    return;
  }

  const userId = session.metadata?.userId;
  const userEmail = session.metadata?.userEmail;
  const planName = session.metadata?.planName;
  const type: any = session.metadata?.type;
  const quantity = parseInt(session.metadata?.quantity || '0');
  const price = session.metadata?.price || '0';
  const companyName = session.metadata?.companyName || '';
  const vatNumber = session.metadata?.vatNumber || '';
  const companyAddress = session.metadata?.companyAddress || '';

  let invoiceUrl = '';
  let invoiceId = '';
  if (session.invoice) {
    const invoice = await stripe.invoices.retrieve(session.invoice as string);
    invoiceUrl = invoice.hosted_invoice_url || invoice.invoice_pdf || '';
    invoiceId = invoice.id ?? '';
  } else if (session.payment_intent) {
    const paymentIntent = await stripe.paymentIntents.retrieve(
      session.payment_intent as string
    );
    if (paymentIntent.latest_charge) {
      const charge = await stripe.charges.retrieve(
        paymentIntent.latest_charge as string
      );
      invoiceId = charge.id;
      invoiceUrl = charge.receipt_url || '';
    }
  }

  if (
    !userId ||
    isNaN(quantity) ||
    !price ||
    !planName ||
    !userEmail ||
    !type
  ) {
    console.error('❌ Error: Invalid metadata for one-time order:', {
      userId,
      quantity,
      price,
      planName,
      type,
    });
    return;
  }

  try {
    // Record the purchase in Firestore with invoice URL
    await db.insert(purchaseTable).values({
      sessionId: session.id,
      userId,
      amount: ((session.amount_total || 0) / 100).toString(),
      customerEmail: session.customer_details?.email,
      paymentStatus: session.payment_status,
      quantity,
      price,
      planName,
      invoiceId,
      type,
      created: new Date(session.created * 1000),
      invoiceUrl, // Add invoice URL
    });
    const creditsData = {
      subscriptionId: session.id,
      userId,
      userEmail,
      cardType: type,
      source: 'purchase',
      type: 'One-Time',
      description: planName,
      tokenQuantity: quantity,
      price: price,
      invoiceUrl: invoiceUrl,
      invoiceId,
      createdDate: new Date(session.created * 1000),
      tokensExpireAt:
        type === 'token'
          ? new Date(new Date().setMonth(new Date().getMonth() + 3))
          : null,
      companyName,
      vatNumber,
      companyAddress,
    };

    const [res] = await db
      .insert(subscriptionHistoryTable)
      .values(creditsData)
      .onConflictDoUpdate({
        target: subscriptionHistoryTable.subscriptionId,
        set: creditsData,
      })
      .returning();

    // Update the user's token balance.
    const userData = await getUserById(userId);
    if (!userData) {
      console.error(`❌ User ${userId} not found for subscription update.`);
      return;
    }
    if (type === 'token') {
      await db
        .update(usersTable)
        .set({
          // tokens: sql`${usersTable.tokens} + ${String(quantity)}`,
          tokens: sql`${usersTable.tokens} + ${quantity}::numeric`,
        })
        .where(eq(usersTable.id, userData.id));
    } else {
      await db
        .update(usersTable)
        .set({
          models: sql`${usersTable.models} + ${quantity}`,
        })
        .where(eq(usersTable.id, userData.id));
    }

    await queryClient.invalidateQueries({ queryKey: ['users', userId] });
    revalidatePath('/');

    const totalAmount = (session.amount_total || 0) / 100;
    const customerEmail = session.customer_details?.email || '';

    // 🔔 SEND NOTIFICATIONS
    if (type === 'token') {
      await notifyCreditsAdded(userId, quantity);
    }
    
    if (invoiceUrl) {
      await notifyInvoice(userId, invoiceUrl, totalAmount);
    }

    if (customerEmail && userData.notificationPreference?.subscriptionEmail) {
      const { error } = await resend.emails.send({
        from: process.env.COMPANY_EMAIL!,
        to: customerEmail,
        subject: `Your ${planName} Purchase Confirmation`,
        react: CheckoutEmailWithInvoice({
          planName,
          quantity,
          price,
          type,
          total: totalAmount,
          tokensAdded: quantity,
          customerEmail,
          currentUser: userData,
          transaction: res.id ? res : undefined,
        }),
      });
      console.log('Email Error:', error);
      console.log(`📧 Purchase confirmation sent to ${customerEmail}`);
    }
  } catch (error) {
    console.error('Error saving one-time order to Firestore:', error);
  }
};
