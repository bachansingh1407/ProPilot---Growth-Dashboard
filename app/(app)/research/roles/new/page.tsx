import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { NewRoleForm } from './new-role-form';

export default async function NewRolePage({ searchParams }: { searchParams: Promise<{ companyId?: string }> }) {
  const { companyId } = await searchParams;
  const user = await requireUser();
  const [companies, skills] = await Promise.all([
    prisma.company.findMany({ where: { userId: user.id }, select: { id: true, name: true } }),
    prisma.skill.findMany({ where: { userId: user.id }, select: { id: true, name: true } }),
  ]);

  return <NewRoleForm companies={companies} skills={skills} defaultCompanyId={companyId} />;
}
