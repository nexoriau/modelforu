'use client';

import { useState, useTransition } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
// Updated Bell icon color in the grid to be more positive
import { Bell, CheckCircle2, Info, Mail, Loader2 } from 'lucide-react';
import { updateNotificationPreferences } from '../notification-management/_services/notification-management.actions';
import type { UserTableType } from '@/db/schema/auth';
import { toast } from 'sonner';

export const idToColumn = (id: string, channel: 'email' | 'inApp') => {
  const parts = id
    .split('_')
    .map((s, i) => (i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)));
  const camel = parts.join('');
  return `${camel}${channel === 'email' ? 'Email' : 'InApp'}` as const;
};

interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  email: boolean;
  inApp: boolean;
}

type Props = {
  currentUser: UserTableType | undefined;
};

export default function NotificationManagementComp({ currentUser }: Props) {
  const [isPending, startTransition] = useTransition();

  const initial = [
    {
      id: 'model_cloned',
      label: 'New Model Cloned',
      description: 'Get notified when a new model is successfully cloned',
      email: currentUser?.notificationPreference?.modelClonedEmail ?? true,
      inApp: true,
    },
    {
      id: 'subscription',
      label: 'Subscription Changes and Extra Purchases',
      description:
        'Updates about subscription renewals, upgrades, or cancellations and extra purchases',
      email: currentUser?.notificationPreference?.subscriptionEmail ?? true,
      inApp: true,
    },
    {
      id: 'invoice',
      label: 'Invoice Issued',
      description: 'Receive notifications when a new invoice is generated',
      email: currentUser?.notificationPreference?.invoiceEmail ?? true,
      inApp: true,
    },
    {
      id: 'credits',
      label: 'Credit Balance Alerts',
      description: 'Get alerted when your credit balance is low or depleted',
      email: currentUser?.notificationPreference?.creditsEmail ?? true,
      inApp: true,
    },
    {
      id: 'product_updates',
      label: 'Product Updates & Announcements',
      description: 'Stay informed about new features and platform updates',
      email: currentUser?.notificationPreference?.productUpdatesEmail ?? true,
      inApp: true,
    },
  ];

  const [preferences, setPreferences] =
    useState<NotificationPreference[]>(initial);

  const handleToggle = (id: string, type: 'email' | 'inApp') => {
    setPreferences((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [type]: !p[type] } : p))
    );
  };

  const allEmailsEnabled = preferences.every((p) => p.email);
  const toggleAllEmails = () => {
    const newVal = !allEmailsEnabled;
    setPreferences((prev) => prev.map((p) => ({ ...p, email: newVal })));
  };

  const handleSave = () => {
    const data: Record<string, boolean> = {};

    preferences.forEach((p) => {
      // Email column (only what the user can change)
      const emailCol = idToColumn(p.id, 'email');
      data[emailCol] = p.email;

      // In-app is always true – keep DB in sync
      const inAppCol = idToColumn(p.id, 'inApp');
      data[inAppCol] = true;
    });

    startTransition(async () => {
      const res = await updateNotificationPreferences(data);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(
          'Your notification preferences have been saved successfully'
        );
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Notification Settings</CardTitle>
        <CardDescription>
          Manage how you receive notifications and updates
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Info */}
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            **In-app notifications (bell icon) will always show all activity.**
            You can only control which of these activities also trigger an
            **email**.
          </AlertDescription>
        </Alert>

        {/* Channels */}
        <div className="grid gap-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5 text-slate-700" />
              Notification Channels
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Choose how you want to receive each type of notification
            </p>
          </div>

          {/* Toggle All Emails */}
          <div className="grid grid-cols-[1fr_auto] items-center gap-4 p-4 bg-slate-50 rounded-lg border">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-slate-600" />
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-slate-600">
                  {allEmailsEnabled ? 'Disable all' : 'Enable all'} email
                  notifications
                </p>
              </div>
            </div>
            <Switch
              checked={allEmailsEnabled}
              onCheckedChange={toggleAllEmails}
            />
          </div>

          {/* Individual rows - UPDATED LAYOUT */}
          <div className="grid border rounded-lg">
            {/* NEW: Column Headers for Clarity */}
            <div className="grid grid-cols-[1fr_100px_100px] items-center gap-4 py-3 px-4 bg-slate-100 font-semibold text-slate-700 rounded-t-lg border-b">
              <span>Notification Type</span>
              <span className="text-center">In-App</span>
              <span className="text-center">Email</span>
            </div>

            {preferences.map((pref, idx) => (
              <div
                key={pref.id}
                // Updated grid definition for the content rows
                className={`grid grid-cols-[1fr_100px_100px] items-center gap-4 py-4 px-4 transition-colors hover:bg-slate-50 ${
                  idx !== preferences.length - 1 ? 'border-b' : ''
                } ${idx === preferences.length - 1 ? 'rounded-b-lg' : ''}`}
              >
                {/* 1. Label and Description */}
                <div>
                  <h3 className="font-medium">{pref.label}</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {pref.description}
                  </p>
                </div>

                {/* 2. In-app Status (Always On) */}
                <div className="flex flex-col items-center justify-center space-y-1">
                  <Bell className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-700 font-medium">
                    Always On
                  </span>
                </div>

                {/* 3. Email Toggle (User's primary control) */}
                <div className="flex items-center justify-center">
                  <Switch
                    checked={pref.email}
                    onCheckedChange={() => handleToggle(pref.id, 'email')}
                    aria-label={`${pref.label} email notification toggle`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="p-4 bg-slate-50 rounded-lg border">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Info className="h-4 w-4" />
            About Notifications
          </h4>
          <ul className="text-sm text-slate-600 space-y-1 ml-6 list-disc">
            <li>
              All new accounts have email notifications enabled by default
            </li>
            <li>
              In-app notifications are always visible in the bell icon menu
            </li>
            <li>You can customize email preferences at any time</li>
            <li>**Critical security alerts** will always be sent via email</li>
          </ul>
        </div>

        {/* Save */}
        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={isPending} size="lg">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
