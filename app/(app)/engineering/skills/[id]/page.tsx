import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FolderGit2 } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { PageHeader } from '@/components/shared/page-header';
import { SkillLevelBadge } from '@/components/skills/skill-level-badge';
import { EvidenceList } from '@/components/evidence/evidence-list';
import { LinkEvidenceDialog } from '@/components/evidence/link-evidence-dialog';
import { EmptyState } from '@/components/data-display/empty-state';
import { resolveSkillLevel } from '@/lib/analysis/skill-level';

export default async function SkillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const skill = await prisma.skill.findFirst({
    where: { id: id, userId: user.id },
    include: {
      evidence: {
        include: {
          project: { select: { id: true, name: true } },
          achievement: { select: { id: true, title: true } },
          metric: { select: { id: true, name: true, value: true, unit: true, projectId: true } },
          adr: { select: { id: true, identifier: true, title: true, projectId: true } },
          note: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      projectLinks: { include: { project: { select: { id: true, name: true } } } },
      improvements: true,
    },
  });

  if (!skill) notFound();

  const { level, isOverridden } = resolveSkillLevel(skill.manualLevelOverride, {
    evidenceCount: skill.evidence.length,
    projectCount: skill.projectLinks.length,
    yearsOfExperience: skill.yearsOfExperience,
  });

  // Data for the "link evidence" dialog's source pickers — scoped to this user.
  const [projects, achievements, metrics, adrs, notes] = await Promise.all([
    prisma.project.findMany({ where: { userId: user.id }, select: { id: true, name: true } }),
    prisma.achievement.findMany({ where: { userId: user.id }, select: { id: true, title: true } }),
    prisma.projectMetric.findMany({ where: { project: { userId: user.id } }, select: { id: true, name: true, value: true, unit: true } }),
    prisma.aDR.findMany({ where: { project: { userId: user.id } }, select: { id: true, identifier: true, title: true } }),
    prisma.technicalNote.findMany({ where: { userId: user.id }, select: { id: true, title: true } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={skill.name}
        description={skill.category}
        actions={
          <LinkEvidenceDialog
            skillId={skill.id}
            projects={projects.map((p) => ({ id: p.id, label: p.name }))}
            achievements={achievements.map((a) => ({ id: a.id, label: a.title }))}
            metrics={metrics.map((m) => ({ id: m.id, label: `${m.name}: ${m.value}${m.unit}` }))}
            adrs={adrs.map((a) => ({ id: a.id, label: `${a.identifier} — ${a.title}` }))}
            notes={notes.map((n) => ({ id: n.id, label: n.title }))}
          />
        }
      />

      <div className="mb-6 flex items-center gap-3">
        <SkillLevelBadge level={level} isOverridden={isOverridden} />
        {skill.yearsOfExperience != null && (
          <span className="text-sm text-muted-foreground">{skill.yearsOfExperience} years</span>
        )}
      </div>

      {skill.description && <p className="mb-6 text-sm leading-relaxed">{skill.description}</p>}

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold">Evidence</h2>
        <EvidenceList evidence={skill.evidence} />
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold">Projects using this skill</h2>
        {skill.projectLinks.length === 0 ? (
          <EmptyState
            icon={FolderGit2}
            title="Not used in any project yet"
            explanation="Connect this skill to a project to strengthen its evidence state."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {skill.projectLinks.map((link) => (
              <li key={link.project.id}>
                <Link
                  href={`/engineering/projects/${link.project.id}`}
                  className="block rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted/40"
                >
                  {link.project.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {skill.improvements.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold">Improvement areas</h2>
          <ul className="flex flex-col gap-2">
            {skill.improvements.map((imp) => (
              <li key={imp.id} className="rounded-md border border-border px-3 py-2 text-sm">
                <p className="font-medium">{imp.weakness}</p>
                <p className="mt-1 text-muted-foreground">{imp.strategy}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
