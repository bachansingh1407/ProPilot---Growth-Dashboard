import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/client';
import { loginSchema } from '@/lib/validation/auth';
import { authConfig } from './config';

/**
 * The full, Node-only auth setup. This file imports Prisma (and therefore
 * `pg`) and must never be imported from `middleware.ts` — see the comment
 * in `lib/auth/config.ts` for why. It's used by the `/api/auth/*` route
 * handler and by server components/actions via `requireUser()`.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email };
      },
    }),
  ],
});

/** Server-side helper: throws if there is no session. Use in Server Actions
 * and Server Components that require auth beyond what middleware already
 * enforces (defense in depth, per Section 36). */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('UNAUTHENTICATED');
  }
  return session.user;
}
