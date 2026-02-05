import React from 'react';
import TrashPageComp from '../_components/TrashPageComp';
import { auth } from '@/app/auth/_services/auth';

export const dynamic = 'force-dynamic';

async function TrashPage() {
  const session = await auth();
  const user = session?.user;
  if (!user) {
    console.log('User not found');
    return;
  }
  return (
    <div>
      <TrashPageComp userId={user.id} />
    </div>
  );
}

export default TrashPage;
