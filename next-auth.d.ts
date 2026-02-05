// next-auth.d.ts  (for Auth.js / NextAuth v5)
import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface User extends DefaultUser {
    id: string;
    role?: 'admin' | 'user' | 'agency';
  }

  interface Session {
    user: {
      id: string;
      role: 'admin' | 'user' | 'agency';
      status: 'pending' | 'approved' | 'suspended' | 'blocked';
      tokens: string;
      models: number;
    } & DefaultSession['user'];
  }
}

/**
 * Note: in v5 the jwt type lives under @auth/core/jwt.
 * If your project uses Auth.js / NextAuth v5, augment that module.
 */
declare module '@auth/core/jwt' {
  interface JWT {
    id?: string;
    role?: 'admin' | 'user' | 'agency';
    status: 'pending' | 'approved' | 'suspended' | 'blocked';
    tokens: string;
    models: number;
  }
}

export {};
