import NextAuth from 'next-auth';
import { authConfig } from './config';

/**
 * A second, separate NextAuth instance built only from the edge-safe config.
 * Import this ONLY from middleware.ts. Everything else (Server Actions,
 * Server Components, the API route handler) should import from
 * `lib/auth/index.ts` instead, which has the real providers and adapter.
 */
export const { auth } = NextAuth(authConfig);
