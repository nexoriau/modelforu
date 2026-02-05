'use server';

import { db } from '@/db';
import { notificationTable, notificationPreferences, usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendNotificationEmail } from './send-notification-email';

type NotificationType = 
  | 'model_cloned'
  | 'subscription'
  | 'invoice'
  | 'credits'
  | 'referral'
  | 'product_updates';

type IconType = 
  | 'photo'
  | 'video'
  | 'audio'
  | 'credits_low'
  | 'subscription'
  | 'invoice'
  | 'model'
  | 'referral'
  | 'product';

type NotificationData = {
  userId: string;
  notificationType: NotificationType;
  iconType: IconType;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
};

/**
 * Creates a notification based on user preferences
 * - Always creates in-app notification if user has it enabled
 * - Sends email if user has email notifications enabled
 */
export async function createNotificationWithPreferences(data: NotificationData) {
  try {
    const { userId, notificationType, iconType, title, message, type } = data;

    // 1. Get user data with preferences
    const userData = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
      with: {
        notificationPreference: true,
      },
    });

    if (!userData) {
      console.error('User not found for notification:', userId);
      return { error: true, message: 'User not found' };
    }

    // 2. Check preferences
    const prefs = userData.notificationPreference;
    
    // Map notification type to preference fields
    const prefixMap: Record<NotificationType, string> = {
      model_cloned: 'modelCloned',
      subscription: 'subscription',
      invoice: 'invoice',
      credits: 'credits',
      referral: 'referral',
      product_updates: 'productUpdates',
    };

    const prefix = prefixMap[notificationType];
    const inAppEnabled = prefs?.[`${prefix}InApp` as keyof typeof prefs] ?? true;
    const emailEnabled = prefs?.[`${prefix}Email` as keyof typeof prefs] ?? true;

    // 3. Create in-app notification if enabled
    if (inAppEnabled) {
      const notificationData: any = {
        userId,
        iconType,
        title,
        message,
        type,
        read: false,
        softDelete: false,
      };
      
      await db.insert(notificationTable).values(notificationData);
    }

    // 4. Send email if enabled
    if (emailEnabled && userData.email) {
      await sendNotificationEmail({
        to: userData.email,
        userName: userData.name || 'User',
        notificationType,
        title,
        message,
      });
    }

    return { error: false, message: 'Notification sent successfully' };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { error: true, message: 'Failed to create notification' };
  }
}

/**
 * Helper functions for common notification scenarios
 */

// Low credits warning
export async function notifyLowCredits(userId: string, remainingCredits: number) {
  return createNotificationWithPreferences({
    userId,
    notificationType: 'credits',
    iconType: 'credits_low',
    title: 'Low Credits Warning',
    message: `Your credit balance is low (${remainingCredits} remaining). Consider purchasing more credits to continue using the platform.`,
    type: 'warning',
  });
}

// Model created/cloned
export async function notifyModelCreated(userId: string, modelName: string) {
  return createNotificationWithPreferences({
    userId,
    notificationType: 'model_cloned',
    iconType: 'model',
    title: 'Model Created Successfully',
    message: `Your model "${modelName}" has been created and is ready to use.`,
    type: 'success',
  });
}

// Subscription event
export async function notifySubscription(
  userId: string,
  eventType: 'created' | 'updated' | 'cancelled',
  planName: string
) {
  const messages = {
    created: `Your subscription to ${planName} has been activated.`,
    updated: `Your subscription has been updated to ${planName}.`,
    cancelled: `Your ${planName} subscription has been cancelled.`,
  };

  return createNotificationWithPreferences({
    userId,
    notificationType: 'subscription',
    iconType: 'subscription',
    title: 'Subscription Update',
    message: messages[eventType],
    type: eventType === 'cancelled' ? 'warning' : 'success',
  });
}

// Invoice generated
export async function notifyInvoice(
  userId: string,
  invoiceUrl: string,
  amount: number
) {
  return createNotificationWithPreferences({
    userId,
    notificationType: 'invoice',
    iconType: 'invoice',
    title: 'New Invoice Available',
    message: `A new invoice for $${amount.toFixed(2)} has been generated. View your invoice to download it.`,
    type: 'info',
  });
}

// Generation completed
export async function notifyGenerationComplete(
  userId: string,
  generationType: 'photo' | 'video' | 'audio',
  modelName: string
) {
  return createNotificationWithPreferences({
    userId,
    notificationType: 'product_updates',
    iconType: generationType,
    title: `${generationType.charAt(0).toUpperCase() + generationType.slice(1)} Generated`,
    message: `Your ${generationType} has been generated successfully using "${modelName}".`,
    type: 'success',
  });
}

// Credits added
export async function notifyCreditsAdded(userId: string, creditsAdded: number) {
  return createNotificationWithPreferences({
    userId,
    notificationType: 'credits',
    iconType: 'credits_low',
    title: 'Credits Added',
    message: `${creditsAdded} credits have been added to your account.`,
    type: 'success',
  });
}

// Referral reward
export async function notifyReferralReward(userId: string, reward: number) {
  return createNotificationWithPreferences({
    userId,
    notificationType: 'referral',
    iconType: 'referral',
    title: 'Referral Reward Earned',
    message: `You've earned ${reward} credits from a successful referral!`,
    type: 'success',
  });
}