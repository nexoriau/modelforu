'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SubscriptionHistoryTableType } from '@/db/schema/subscription-history';
import { dateFormatter } from '@/lib/utils-functions/dateFormatter';
import { CircleDollarSign, Download, Filter } from 'lucide-react';
import { useState } from 'react';

type Props = {
  transactionHistoryData: SubscriptionHistoryTableType[];
};

const TransactionHistoryComp = ({ transactionHistoryData }: Props) => {
  const [filters, setFilters] = useState({
    invoiceId: '',
    date: '',
    description: '',
    amount: '',
  });

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-xl font-semibold text-gray-900">
          Transaction History
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          View all your recent payments and activities.
        </p>
      </div>

      {/* Filters Section */}
      <div className="mt-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              Invoice ID
            </label>
            <Input
              placeholder="Filter by Invoice ID"
              value={filters.invoiceId}
              onChange={(e) =>
                setFilters({ ...filters, invoiceId: e.target.value })
              }
              className="h-9 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Date</label>
            <Input
              placeholder="Pick a Date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="h-9 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              Description
            </label>
            <Input
              placeholder="Select Type"
              value={filters.description}
              onChange={(e) =>
                setFilters({ ...filters, description: e.target.value })
              }
              className="h-9 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Amount</label>
            <Input
              placeholder="Select Amount"
              value={filters.amount}
              onChange={(e) =>
                setFilters({ ...filters, amount: e.target.value })
              }
              className="h-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* All Transactions Section */}
      <div className="mt-8">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          All Transactions
        </h2>

        {/* Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700">
                  Date
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700">
                  Invoice ID
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700">
                  Email
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700">
                  Amount
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700">
                  Token Expire
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700">
                  Cancel Detail
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactionHistoryData.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {transaction?.createdAt &&
                      dateFormatter(transaction.createdAt, 'DD-MMM-YYYY')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {transaction.invoiceId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {transaction.userEmail}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 p-0.5 text-white rounded-full bg-blue-500 flex items-center justify-center">
                        <CircleDollarSign />
                      </div>
                      <span className="text-sm text-gray-900">
                        {transaction.price} USD
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {transaction?.tokensExpireAt &&
                      dateFormatter(transaction.tokensExpireAt, 'DD-MMM-YYYY')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {transaction.cancellationFeedback
                      ? (() => {
                          switch (transaction.cancellationFeedback) {
                            case 'unused':
                              return "I don't use it enough";
                            case 'too_expensive':
                              return 'Too expensive';
                            case 'switched_service':
                              return 'I switched to a different service';
                            case 'other':
                              return transaction.cancellationComment
                                ? `Other: ${transaction.cancellationComment}`
                                : 'Other';
                            default:
                              return '-';
                          }
                        })()
                      : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-3 text-xs font-medium bg-black text-white hover:bg-gray-800 border-0 rounded"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      PDF
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistoryComp;
