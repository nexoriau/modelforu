'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export default function SessionWrapper({
  children,
  session,
}: {
  children: ReactNode;
  session: any;
}) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
