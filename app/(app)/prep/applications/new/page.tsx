import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { NewApplicationForm } from './new-application-form';

export default async function NewApplicationPage({ searchParams }: { searchParams: Promise<{ roleId?: string }> }) {
  const { roleId } = await searchParams;
  const user = await requireUser();
  const [roles, versions] = await Promise.all([
    prisma.role.findMany({ where: { userId: user.id }, include: { company: true } }),
    prisma.resumeVersion.findMany({ where: { resume: { userId: user.id } }, include: { resume: true } }),
  ]);

  return (
    <NewApplicationForm
      roles={roles.map((r) => ({ id: r.id, label: `${r.title} at ${r.company.name}` }))}
      versions={versions.map((v) => ({ id: v.id, label: `${v.resume.name} — ${v.label}` }))}
      defaultRoleId={roleId}
    />
  );
}
