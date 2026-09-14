import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { RunAnalysisForm } from './run-analysis-form';

export default async function NewATSAnalysisPage({
  searchParams,
}: {
  searchParams: Promise<{ resumeVersionId?: string; roleId?: string }>;
}) {
  const { resumeVersionId, roleId } = await searchParams;
  const user = await requireUser();

  const [versions, roles] = await Promise.all([
    prisma.resumeVersion.findMany({
      where: { resume: { userId: user.id } },
      include: { resume: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.role.findMany({
      where: { userId: user.id },
      include: { company: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <RunAnalysisForm
      versions={versions.map((v) => ({ id: v.id, label: `${v.resume.name} — ${v.label}` }))}
      roles={roles.map((r) => ({ id: r.id, label: `${r.title} at ${r.company.name}`, hasJobDescription: !!r.jobDescription }))}
      defaultVersionId={resumeVersionId}
      defaultRoleId={roleId}
    />
  );
}
