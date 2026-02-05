import { User } from 'next-auth';
import { redirect } from 'next/navigation';
import { getUserById } from '../utils-functions/getUserById';

async function AuthProtect({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: User & { status: string };
}) {
  if (user) {
    const userFromDB = await getUserById(user.id);
    if (!userFromDB?.id) return;
    if (userFromDB.status !== 'approved') {
      redirect('/status');
    } else {
      redirect(`/${userFromDB.role === 'admin' ? 'admin' : 'user'}/dashboard`);
    }
  }
  return <>{children}</>;
}

export default AuthProtect;
