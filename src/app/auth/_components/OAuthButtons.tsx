'use client';

import { Button } from '@/components/ui/button';
import { LucideLoader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { FcGoogle } from 'react-icons/fc';

type Props = {
  isPending: boolean;
};
function OAuthButtons({ isPending }: Props) {
  const [isLoadingGoogle, startTransition] = useTransition();
  const router = useRouter();
  const handleGoogleSignIn = async () => {
    startTransition(async () => {
      await signIn('google');
      router.refresh();
    });
  };
  
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full h-14 mt-4 flex items-center justify-center  bg-white text-gray-700 hover:bg-gray-50 text-base font-semibold border-gray-300"
      onClick={handleGoogleSignIn}
      disabled={isPending || isLoadingGoogle}
    >
      {isLoadingGoogle ? (
        <LucideLoader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <FcGoogle className="mr-2 h-5 w-5" />
      )}
      Continue With Google
    </Button>
  );
}

export default OAuthButtons;
