import { auth } from '@/app/auth/_services/auth';
import { redirect } from 'next/navigation';
import React from 'react';
import { getUserById } from '../utils-functions/getUserById';

type Props = {
  children: React.ReactNode;
  requiredRole?: string | string[];
  redirectTo?: string;
};

export default async function DashboardProtect({
  children,
  requiredRole,
  redirectTo,
}: Props) {
  const data = await auth();

  // not authenticated -> go to public home/login
  if (!data?.user) {
    redirect('/');
  }

  const userFromDB = await getUserById(data.user.id);

  if (!userFromDB?.id) {
    redirect('/');
  }

  if (userFromDB.status !== 'approved') {
    redirect('/status');
  }
  // if a role restriction is provided, enforce it
  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    if (!allowed.includes(userFromDB.role)) {
      // send them to either a provided redirect or to their own dashboard
      const destination = `/${userFromDB.role === 'admin' ? 'admin' : 'user'}/dashboard`;
      redirect(destination);
    }
  }

  return <>{children}</>;
}
