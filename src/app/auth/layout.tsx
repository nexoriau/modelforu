import AuthProtect from '@/lib/protect/AuthProtect';
import { auth } from './_services/auth';
import { getUserById } from '@/lib/utils-functions/getUserById';

async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = await getUserById(session?.user.id);
  return <AuthProtect user={user}>{children}</AuthProtect>;
}

export default AuthLayout;
