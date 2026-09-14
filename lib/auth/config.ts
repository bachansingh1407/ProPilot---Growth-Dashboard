import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-safe config — deliberately has NO providers and NO Prisma import.
 * This is what `middleware.ts` uses (Next.js middleware runs on the Edge
 * runtime, which cannot load `pg`/Prisma's Node driver at all — attempting
 * to import them there fails with "The edge runtime does not support
 * Node.js 'crypto' module").
 *
 * Middleware only needs to read/verify the JWT session cookie, which these
 * callbacks alone are enough for. The Credentials provider (with its
 * Prisma-backed `authorize()`) lives in `lib/auth/index.ts`, the Node-only
 * "full" config used by the actual auth API route and server components.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  session: {
    // Auth.js requires JWT sessions when using the Credentials provider —
    // "database" strategy only works with adapter-backed providers (OAuth).
    // Using "database" here is what causes the generic
    // "There was a problem with the server configuration" error on sign-in.
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, `user` is the object returned from authorize().
      // Persist its id onto the token so it survives across requests.
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) session.user.id = token.id as string;
      return session;
    },
  },
};
