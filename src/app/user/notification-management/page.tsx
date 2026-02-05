import React from 'react';
import NotificationManagementComp from '../_components/NotificationManagementComp';
import { auth } from '@/app/auth/_services/auth';
import { getUserById } from '@/lib/utils-functions/getUserById';

async function NotificationManagementPage() {
  const session = await auth();
  const currentUser = await getUserById(session?.user.id);

  if (!currentUser) {
    return <div>User not found</div>;
  }

  return (
    <div>
      <NotificationManagementComp currentUser={currentUser} />
    </div>
  );
}

export default NotificationManagementPage;
