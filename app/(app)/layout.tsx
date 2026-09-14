import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AppShell } from '@/components/navigation/app-shell';

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  // Middleware already blocks unauthenticated requests to this route group,
  // but every server-rendered layout re-verifies per Section 36 (never trust
  // a single layer of defense).
  const session = await auth();
  if (!session?.user) redirect('/login');

  return <AppShell>{children}</AppShell>;
}
