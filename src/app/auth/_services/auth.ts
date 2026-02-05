import NextAuth from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import Apple from 'next-auth/providers/apple';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { usersTable } from '@/db/schema';
import { signInSchema } from '@/db/schema/auth';
import { sendWelcomeEmail } from '@/app/_others/email/actions/send-welcome-email.action';
import { getUserByIdForAuth } from '@/lib/utils-functions/getUserById';
import { CREDIT_AT_START } from '@/lib/constant';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  pages: { signIn: '/auth/sign-in' },
  secret: process.env.NEXTAUTH_SECRET!,
  session: { strategy: 'jwt' },
  trustHost: true,
  events: {
    linkAccount: async ({ user }) => {
      await db
        .update(usersTable)
        .set({ emailVerified: new Date() })
        .where(eq(usersTable.id, user.id));
    },
    // Add tokens when a new user signs up via OAuth
    createUser: async ({ user }) => {
      try {
        // Add free tokens to new OAuth users
        await db
          .update(usersTable)
          .set({
            tokens: String(CREDIT_AT_START),
            emailVerified: new Date()
          })
          .where(eq(usersTable.id, user.id));

        // Send welcome email
        if (user.email && user.name) {
          await sendWelcomeEmail(user.email, user.name);
        }
      } catch (error) {
        console.error('Error adding tokens to new user:', error);
      }
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const validations = signInSchema.safeParse(credentials);

        if (!validations.success) {
          throw new Error('Validations failed');
        }

        const { email, password } = validations.data;

        const user = await db.query.usersTable.findFirst({
          where: eq(usersTable.email, email),
        });

        if (!user || !user.password) {
          throw new Error('Invalid email or password.');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error('Invalid email or password.');
        }

        if (!user.emailVerified) {
          throw new Error('Please verify your email first.');
        }

        return {
          id: user.id,
          role: user.role,
          name: user.name,
          email: user.email,
          image: user.image,
          tokens: user.tokens,
          models: user.models,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Apple({
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    jwt: async ({ token }) => {
      if (!token.sub) return token;
      const user = await getUserByIdForAuth(token.sub);
      if (!user) return token;
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.role = user.role;
        token.email = user.email;
        token.picture = user.image;
        token.tokens = user.tokens;
        token.models = user.models;
        token.status = user.status ?? 'approved';
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.role = token.role as any;
        session.user.status = token.status as any;
        session.user.email = token.email ?? '';
        session.user.image = token.picture as string | undefined;
        session.user.tokens = (token.tokens as any) ?? 0;
        session.user.models = (token.models as any) ?? 0;
      }
      return session;
    },
    signIn: async ({ account, user, profile }) => {
      try {
        // For OAuth providers (Google/Apple)
        if (account?.provider !== 'credentials') {
          // Check if this is a new user
          const existingUser = await getUserByIdForAuth(user.id);
          // Send welcome email for new users
          if (!existingUser && user.email && user.name) {
            await sendWelcomeEmail(user.email, user.name);
          }
        }
        
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        // Still allow sign-in even if welcome email fails
        return true;
      }
    },
  },
});
