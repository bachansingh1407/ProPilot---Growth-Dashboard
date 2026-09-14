import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { ProfileForm } from './profile-form';
import { PageHeader } from '@/components/shared/page-header';

export default async function AccountSettingsPage() {
  const user = await requireUser();
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Account" description="Your profile — also what appears in your public portfolio's About section." />
      <p className="mb-6 text-sm text-muted-foreground">Signed in as {user.email}</p>
      <ProfileForm profile={profile} />
    </div>
  );
}
