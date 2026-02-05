'use client';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import { useTranslation } from 'react-i18next';

function LogoutButton() {
  const { t } = useTranslation();
  return (
    <Button
      variant={'destructive'}
      onClick={async () => {
        await signOut({ redirectTo: '/auth/sign-in' });
      }}
    >
      {t('navbar.authButtons.logout')}
    </Button>
  );
}

export default LogoutButton;
