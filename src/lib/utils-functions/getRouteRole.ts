'use server';

import { auth } from '@/app/auth/_services/auth';

export const getRouteRole = async () => {
  const session = await auth();

  if (!session?.user) {
    return;
  }

  const role = session.user.role === 'admin' ? 'admin' : 'user';
  return role;
};
