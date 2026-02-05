// app/components/Navbar.tsx
import { auth } from '@/app/auth/_services/auth';
import NavbarComp from './NavbarComp';
import { getUserById } from '@/lib/utils-functions/getUserById';
// import { useAuth } from '@/context/AuthContext';

const Navbar = async () => {
  // const session = await auth();
  // const user = await getUserById(session?.user.id);
  // const {currentUser} = useAuth()
  return <NavbarComp  />;
};

export default Navbar;
