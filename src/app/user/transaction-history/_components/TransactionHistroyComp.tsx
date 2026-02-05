'use client';
import { useTranslation } from 'react-i18next'; // 🚀 Import the useTranslation hook
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SubscriptionHistoryTableType } from '@/db/schema/subscription-history';
import { cn } from '@/lib/utils';
import { dateFormatter } from '@/lib/utils-functions/dateFormatter';
import { generateInvoice } from '@/lib/utils-functions/generateInvoice';
import { isTokenExpired } from '@/lib/utils-functions/isTokensExpired';
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  CircleDollarSign,
  CreditCard,
  Download,
  Filter,
  Loader2,
  SearchIcon,
  XIcon,
} from 'lucide-react';
import moment from 'moment';
import { useState } from 'react';
import { getSourceBadge, getTypeBadge } from './TransactionHistoryTableBadges';

type Props = {
  transactionHistoryData: SubscriptionHistoryTableType[];
};

// --- DatePicker Component (updated with translation) ---
function DatePicker({
  selected,
  onSelect,
  className,
}: {
  selected: Date | null;
  onSelect: (date: Date | undefined) => void;
  className?: string;
}) {
  const { t } = useTranslation(); // 🚀 use translation inside DatePicker

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!selected}
          className={cn(
            'data-[empty=true]:text-muted-foreground justify-start text-left font-normal',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? (
            moment(selected).format('LL')
          ) : (
            <span>
              {t('user.transactionHistory.filters.placeholder.datePicker')}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected || undefined}
          onSelect={onSelect}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

const TransactionHistoryComp = ({ transactionHistoryData }: Props) => {
  const { t } = useTranslation(); // 🚀 use translation

  const [generatingInvoice, setGeneratingInvoice] = useState<string | null>(
    null
  );
  const [filters, setFilters] = useState({
    email: '',
    invoiceId: '',
    date: null as Date | null,
    description: '',
    amount: '',
  });
  const [transactionData, setTransactionData] = useState<
    SubscriptionHistoryTableType[]
  >(transactionHistoryData);
  const [activeFilter, setActiveFilter] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleApplyFilters = () => {
    setLoading(true);
    let filtered = [...transactionHistoryData];

    if (filters.invoiceId) {
      filtered = filtered.filter((t) =>
        t.invoiceId.toLowerCase().includes(filters.invoiceId.toLowerCase())
      );
      setActiveFilter(true);
    }
    if (filters.email) {
      filtered = filtered.filter((t) =>
        t.userEmail.toLowerCase().includes(filters.email.toLowerCase())
      );
      setActiveFilter(true);
    }

    if (filters.date) {
      const filterDateStr = filters.date.toISOString().split('T')[0];
      filtered = filtered.filter((t) => {
        if (!t.createdAt) return false;
        const createdDate = new Date(t.createdAt);
        const createdDateStr = createdDate.toISOString().split('T')[0];
        setActiveFilter(true);
        return createdDateStr === filterDateStr;
      });
    }

    if (filters.description && filters.description !== 'all') {
      filtered = filtered.filter(
        (t) => t.cancellationFeedback === filters.description
      );
      setActiveFilter(true);
    }

    if (filters.amount) {
      const amt = parseFloat(filters.amount);
      if (!isNaN(amt)) {
        filtered = filtered.filter(
          (t) => parseFloat(t.price as string) === amt
        );
        setActiveFilter(true);
      }
    }

    setTransactionData(filtered);
    setLoading(false);
  };

  const handleClearFilters = () => {
    setFilters({
      email: '',
      invoiceId: '',
      date: null,
      description: '',
      amount: '',
    });
    setActiveFilter(false);
    setTransactionData(transactionHistoryData);
  };

  // --- Utility function to get translated cancellation detail ---
  const getCancellationDetail = (transaction: SubscriptionHistoryTableType) => {
    switch (transaction.cancellationFeedback) {
      case 'unused':
        return t('user.transactionHistory.filters.descriptionOptions.unused');
      case 'too_expensive':
        return t(
          'user.transactionHistory.filters.descriptionOptions.tooExpensive'
        );
      case 'switched_service':
        return t(
          'user.transactionHistory.filters.descriptionOptions.switchedService'
        );
      case 'other':
        return transaction.cancellationComment
          ? t(
              'user.transactionHistory.filters.descriptionOptions.otherWithComment',
              { comment: transaction.cancellationComment }
            )
          : t('user.transactionHistory.filters.descriptionOptions.other');
      default:
        return t('user.transactionHistory.table.emptyValue');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto rounded-2xl p-6 bg-white">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-xl font-semibold text-gray-900">
          {t('user.transactionHistory.header.title')}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {t('user.transactionHistory.header.subtitle')}
        </p>
      </div>

      {/* Filters Section */}
      <div className="mt-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">
            {t('user.transactionHistory.filters.title')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Invoice ID Filter */}
          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              {t('user.transactionHistory.filters.label.invoiceId')}
            </label>
            <Input
              placeholder={t(
                'user.transactionHistory.filters.placeholder.invoiceId'
              )}
              value={filters.invoiceId}
              onChange={(e) =>
                setFilters({ ...filters, invoiceId: e.target.value })
              }
              className="h-9 text-sm"
            />
          </div>
          {/* Email Filter */}
          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              {t('user.transactionHistory.filters.label.email')}
            </label>
            <Input
              placeholder={t(
                'user.transactionHistory.filters.placeholder.email'
              )}
              value={filters.email}
              onChange={(e) =>
                setFilters({ ...filters, email: e.target.value })
              }
              className="h-9 text-sm"
            />
          </div>
          {/* Date Filter */}
          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              {t('user.transactionHistory.filters.label.date')}
            </label>
            <DatePicker
              selected={filters.date}
              onSelect={(date) =>
                setFilters({ ...filters, date: date || null })
              }
              className="w-full h-9 text-sm"
            />
          </div>
          {/* Description Filter */}
          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              {t('user.transactionHistory.filters.label.description')}
            </label>
            <Select
              value={filters.description || 'all'}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  description: value === 'all' ? '' : value,
                })
              }
            >
              <SelectTrigger className="h-9 text-sm w-full">
                <SelectValue
                  placeholder={t(
                    'user.transactionHistory.filters.placeholder.selectType'
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t('user.transactionHistory.filters.descriptionOptions.all')}
                </SelectItem>
                <SelectItem value="unused">
                  {t(
                    'user.transactionHistory.filters.descriptionOptions.unused'
                  )}
                </SelectItem>
                <SelectItem value="too_expensive">
                  {t(
                    'user.transactionHistory.filters.descriptionOptions.tooExpensive'
                  )}
                </SelectItem>
                <SelectItem value="switched_service">
                  {t(
                    'user.transactionHistory.filters.descriptionOptions.switchedService'
                  )}
                </SelectItem>
                <SelectItem value="other">
                  {t(
                    'user.transactionHistory.filters.descriptionOptions.other'
                  )}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Amount Filter */}
          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              {t('user.transactionHistory.filters.label.amount')}
            </label>
            <Input
              type="number"
              placeholder={t(
                'user.transactionHistory.filters.placeholder.amount'
              )}
              value={filters.amount}
              onChange={(e) =>
                setFilters({ ...filters, amount: e.target.value })
              }
              className="h-9 text-sm"
            />
          </div>
        </div>
        {/* Filter Buttons */}
        <div className="flex justify-start gap-3 mt-4">
          <Button onClick={handleApplyFilters} disabled={loading}>
            <SearchIcon className="mr-2 h-4 w-4" />
            {t('user.transactionHistory.filters.buttons.apply')}
          </Button>
          {activeFilter && (
            <Button
              variant="outline"
              onClick={handleClearFilters}
              disabled={loading}
            >
              <XIcon className="mr-2 h-4 w-4" />
              {t('user.transactionHistory.filters.buttons.clear')}
            </Button>
          )}
        </div>
      </div>

      {/* All Transactions Section */}
      <div className="mt-8">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          {t('user.transactionHistory.table.sectionTitle')}
        </h2>

        {/* Table */}
        <div className="border border-gray-200 rounded-lg overflow-x-auto w-[calc(100vw-100px)] md:w-[calc(100vw-335px)]">
          <table className="w-[1600px]">
            <thead className="bg-linear-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 w-40 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {t('user.transactionHistory.table.header.date')}
                </th>
                <th className="text-left px-6 py-4 w-40 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {t('user.transactionHistory.table.header.invoiceId')}
                </th>
                <th className="text-left px-6 py-4 w-40 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {t('user.transactionHistory.table.header.email')}
                </th>
                <th className="text-left px-6 py-4 w-32 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {t('user.transactionHistory.table.header.amount')}
                </th>
                <th className="text-left px-6 py-4 w-72 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {t('user.transactionHistory.table.header.paymentDetails')}
                </th>
                <th className="text-left px-6 py-4 w-48 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {t('user.transactionHistory.table.header.tokenExpiry')}
                </th>
                <th className="text-left px-6 py-4 w-[270px] text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {t('user.transactionHistory.table.header.cancelDetail')}
                </th>
                <th className="text-left px-6 py-4 w-32 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {t('user.transactionHistory.table.header.action')}
                </th>
              </tr>
            </thead>
            {loading ? (
              <tbody>
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                    <p className="mt-2 text-sm text-gray-500">
                      {t('user.transactionHistory.table.loading.message')}
                    </p>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="bg-white divide-y divide-gray-100">
                {transactionData.map((transaction) => {
                  const expired = isTokenExpired(transaction.tokensExpireAt);
                  return (
                    <tr
                      key={transaction.id}
                      className={`hover:bg-gray-50 transition-colors ${expired ? 'opacity-60' : ''}`}
                    >
                      <td
                        className={`px-6 py-4 text-xs text-gray-700 font-medium ${expired ? 'bg-red-50/50' : ''}`}
                      >
                        {transaction?.createdAt &&
                          dateFormatter(transaction.createdAt, 'DD-MMM-YYYY')}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span className="font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded">
                          {transaction.invoiceId}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-700 font-medium">
                        {transaction.userEmail}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="size-6 p-0.5 text-white rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                            <CircleDollarSign className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-semibold text-gray-900">
                            ${transaction.price}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {transaction.cardType && (
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-gray-400" />
                              <span className="text-xs font-medium text-gray-600 uppercase">
                                {transaction.cardType}
                              </span>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1.5">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getTypeBadge(transaction.type)}`}
                            >
                              {transaction.type}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 text-sm ${expired ? 'text-red-600 font-medium' : 'text-gray-600'}`}
                      >
                        <div className="flex items-center gap-2">
                          {transaction?.tokensExpireAt &&
                            dateFormatter(
                              transaction.tokensExpireAt,
                              'DD-MMM-YYYY'
                            )}
                          {expired && (
                            <div className="flex items-center gap-1 bg-red-100 px-2 py-1 rounded-full">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              <span className="text-xs font-medium">
                                {t(
                                  'user.transactionHistory.table.tokenStatus.expired'
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {transaction.cancellationFeedback ? (
                          <div className="max-w-xs">
                            <span className="text-gray-700">
                              {getCancellationDetail(transaction)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">
                            {t('user.transactionHistory.table.emptyValue')}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            generateInvoice(transaction, setGeneratingInvoice)
                          }
                          disabled={generatingInvoice === transaction.id}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            expired
                              ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {generatingInvoice === transaction.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          {generatingInvoice === transaction.id
                            ? t(
                                'user.transactionHistory.table.actionButton.generating'
                              )
                            : t(
                                'user.transactionHistory.table.actionButton.download'
                              )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            )}
            {/* No transactions state (optional, can be added here) */}
            {!loading && transactionData.length === 0 && (
              <tbody>
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    No transactions found for the applied filters.
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistoryComp;
