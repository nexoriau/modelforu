'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

function StatusProtect({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) {
  const router = useRouter();
  useEffect(() => {
    if (!user) {
      router.push('/auth/sign-in');
    }
    const role = user.role === 'admin' ? 'admin' : 'user';
    if (user.status === 'approved') {
      router.push(`/${role}/dashboard`);
    }
  }, [router, user]);
  return <div>{children}</div>;
}

export default StatusProtect;
