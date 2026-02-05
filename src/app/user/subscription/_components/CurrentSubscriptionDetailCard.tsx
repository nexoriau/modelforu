'use client';
import {
  AlertCircle,
  Calendar,
  CreditCard,
  LucideLoader2,
  Zap,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ManageSubscriptionButton } from './ManageSubscriptionButton';
import { useAuth } from '@/context/AuthContext';
import { useGetSubscriptionById } from '@/app/subscription/_services/useGetSubscriptionById';
import moment from 'moment';
import { Card, CardContent } from '@/components/ui/card';

const CurrentSubscriptionDetailCard = () => {
  const { t } = useTranslation();

  const { currentUser } = useAuth();
  const { subscriptionByIdData, subscriptionByIdDataLoading } =
    useGetSubscriptionById(currentUser?.subscriptionId);

  // Determine the interval text using translation keys
  const intervalKey =
    subscriptionByIdData?.interval === 'monthly'
      ? 'user.currentSubscription.misc.intervalMonthly'
      : 'user.currentSubscription.misc.intervalAnnual';
  const intervalText = t(intervalKey);

  const subscriptionData = {
    planName: subscriptionByIdData?.planName,
    cancelAtPeriodEnd: subscriptionByIdData?.cancelAtPeriodEnd,
    interval: subscriptionByIdData?.interval,
    price: subscriptionByIdData?.price,
    tokenQuantity: subscriptionByIdData?.tokens,
    renewalDate: moment(subscriptionByIdData?.currentPeriodEnd).format(
      'DD-MM-YYYY'
    ),
    status: 'active',
  };

  // --- Loading State ---
  if (subscriptionByIdDataLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <LucideLoader2 className="animate-spin mr-2" />
        <p>{t('user.currentSubscription.loading')}</p>
      </div>
    );
  }

  if (!subscriptionByIdData) return null; // Return null if no data

  return (
    <Card className="py-0 overflow-hidden mb-1">
      <CardContent className="px-0">
        {/* Header Section */}
        <div className="bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 p-8 relative overflow-hidden">
          {/* Decorative circles (no translation needed) */}
          <div className="absolute top-0 left-0 w-32 h-32 border-4 border-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-40 h-40 border-4 border-white/10 rounded-full translate-x-1/3 translate-y-1/3" />

          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-2">
              {t('user.currentSubscription.header.title')}
            </h2>
            <p className="text-gray-300 text-sm">
              {t('user.currentSubscription.header.subtitle')}
            </p>
          </div>
        </div>

        <div className="p-8">
          {/* Plan Status Card */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gray-900 p-2.5 rounded-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {subscriptionData.planName}{' '}
                    {t('user.currentSubscription.planStatus.planSuffix')}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {/* Use the translated intervalText here */}
                    <strong>{intervalText}</strong>{' '}
                    {t('user.currentSubscription.planStatus.suffix')}
                  </p>
                </div>
              </div>
              <div
                className={`px-4 py-2 ${
                  subscriptionData.cancelAtPeriodEnd
                    ? 'bg-red-100 text-red-700 border-red-300'
                    : 'bg-green-100 text-green-700 border-green-300'
                } text-sm font-semibold rounded-full uppercase tracking-wide border-2`}
              >
                {subscriptionData.cancelAtPeriodEnd
                  ? t('user.currentSubscription.planStatus.statusCanceling')
                  : t('user.currentSubscription.planStatus.statusActive')}
              </div>
            </div>

            {/* Cancellation Alert */}
            {subscriptionData.cancelAtPeriodEnd && (
              <div className="mt-4 p-4 bg-orange-50 border-l-4 border border-orange-500 rounded-sm">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-orange-800">
                    {t(
                      'user.currentSubscription.planStatus.cancellationAlert.part1'
                    )}{' '}
                    <span className="font-bold">
                      {subscriptionData.renewalDate}
                    </span>
                    {t(
                      'user.currentSubscription.planStatus.cancellationAlert.part2'
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Cost */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-300 hover:border-gray-900 hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <CreditCard className="h-4 w-4 text-gray-900" />
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {intervalText}{' '}
                  {t('user.currentSubscription.details.costLabel')}
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                ${subscriptionData.price}
              </div>
            </div>

            {/* Credits */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-300 hover:border-gray-900 hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Zap className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {t('user.currentSubscription.details.creditsLabel')} /{' '}
                  {intervalText}
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {subscriptionData?.tokenQuantity?.toLocaleString()}
              </div>
            </div>

            {/* Next Billing */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-300 hover:border-gray-900 hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {t('user.currentSubscription.details.billingLabel')}
                </span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {subscriptionData.cancelAtPeriodEnd
                  ? t('user.currentSubscription.details.notApplicable')
                  : subscriptionData.renewalDate}
              </div>
            </div>
          </div>

          {/* Manage Button (assuming the component handles its own translation) */}
          <ManageSubscriptionButton />

          {/* Footer Info */}
          <div className="p-4 mt-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <AlertCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">
                  {t('user.currentSubscription.footerInfo.title')}
                </p>
                <p className="text-blue-700">
                  {t('user.currentSubscription.footerInfo.body')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentSubscriptionDetailCard;
