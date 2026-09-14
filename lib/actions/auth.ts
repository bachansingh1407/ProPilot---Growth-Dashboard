'use server';

import { AuthError } from 'next-auth';
import { signIn } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { setupSchema } from '@/lib/validation/auth';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function loginAction(_prevState: { error?: string } | undefined, formData: FormData) {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: (formData.get('callbackUrl') as string) || '/dashboard',
    });
    return {};
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: 'Invalid email or password.' };
    }
    throw err;
  }
}

/**
 * First-run setup. Creates the single User row. Rejects if a user already
 * exists — this app is single-user by design (Section 4), not a signup flow.
 */
export async function setupAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const existing = await prisma.user.findFirst();
  if (existing) {
    return { error: 'Setup has already been completed.' };
  }

  const parsed = setupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input.' };
  }

  const { fullName, email, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      profile: { create: { fullName } },
    },
  });

  redirect('/login');
}
