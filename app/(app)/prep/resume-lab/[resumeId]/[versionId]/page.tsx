import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ScanSearch } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AddBulletDialog } from '@/components/evidence/add-bullet-dialog';
import { LinkBulletEvidenceDialog } from '@/components/evidence/link-bullet-evidence-dialog';
import { EmptyState } from '@/components/data-display/empty-state';
import { FileText } from 'lucide-react';

export default async function ResumeVersionPage({ params }: { params: Promise<{ resumeId: string; versionId: string }> }) {
  const { resumeId, versionId } = await params;
  const user = await requireUser();

  const version = await prisma.resumeVersion.findFirst({
    where: { id: versionId, resumeId: resumeId, resume: { userId: user.id } },
    include: {
      resume: true,
      bullets: { include: { evidence: true }, orderBy: { sortOrder: 'asc' } },
      analyses: { include: { role: { select: { title: true } } }, orderBy: { createdAt: 'desc' } },
    },
  });
  if (!version) notFound();

  const [experiences, achievements, projects, skills] = await Promise.all([
    prisma.experience.findMany({ where: { userId: user.id }, select: { id: true, company: true, title: true } }),
    prisma.achievement.findMany({ where: { userId: user.id }, select: { id: true, title: true } }),
    prisma.project.findMany({ where: { userId: user.id }, select: { id: true, name: true } }),
    prisma.skill.findMany({ where: { userId: user.id }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/prep/resume-lab" className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Resume Lab
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">
          {version.resume.name} <span className="text-muted-foreground">— {version.label}</span>
        </h1>
        <Button asChild size="sm" variant="outline">
          <Link href={`/prep/ats-analysis/new?resumeVersionId=${version.id}`}>
            <ScanSearch className="mr-1.5 h-4 w-4" /> Analyze against a role
          </Link>
        </Button>
      </div>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Bullets</h2>
          <AddBulletDialog resumeVersionId={version.id} experiences={experiences} achievements={achievements} />
        </div>

        {version.bullets.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No bullets yet"
            explanation="Add bullets one at a time, then link each to the project, skill, or achievement that proves it."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {version.bullets.map((bullet) => (
              <div key={bullet.id} className="rounded-md border border-border p-3">
                <p className="text-sm">{bullet.text}</p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {bullet.evidence.length === 0 ? (
                      <Badge variant="gap">No evidence linked</Badge>
                    ) : (
                      <Badge variant="strong">{bullet.evidence.length} evidence linked</Badge>
                    )}
                  </div>
                  <LinkBulletEvidenceDialog bulletId={bullet.id} projects={projects} skills={skills} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {version.analyses.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold">Past ATS analyses</h2>
          <div className="flex flex-col gap-2">
            {version.analyses.map((a) => (
              <Link key={a.id} href={`/prep/ats-analysis/${a.id}`} className="block rounded-md border border-border px-3 py-2 text-sm hover:bg-muted/40">
                Against &ldquo;{a.role?.title ?? 'Unknown role'}&rdquo; · {new Date(a.createdAt).toLocaleDateString()}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
