import React from 'react';
import TransactionHistoryComp from './_components/TransactionHistroyComp';
import { getTransactionsHistoryByUserId } from './_services/transactionHistory.queries';
import { auth } from '@/app/auth/_services/auth';

export const dynamic = 'force-dynamic';

async function TransactionHistory() {
  const session = await auth();
  const transactionHistoryData = await getTransactionsHistoryByUserId(
    session?.user.id
  );

  return (
    <div>
      <TransactionHistoryComp transactionHistoryData={transactionHistoryData} />
    </div>
  );
}

export default TransactionHistory;
