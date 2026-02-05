import React from 'react';
import { getAllTransactionsHistory } from '@/app/user/transaction-history/_services/transactionHistory.queries';
import TransactionHistoryComp from '@/app/user/transaction-history/_components/TransactionHistroyComp';

export const dynamic = 'force-dynamic';

export default async function TransactionHistoryPage() {
  const transactionHistoryData = await getAllTransactionsHistory();

  return (
    <div>
      <TransactionHistoryComp transactionHistoryData={transactionHistoryData} />
    </div>
  );
}
