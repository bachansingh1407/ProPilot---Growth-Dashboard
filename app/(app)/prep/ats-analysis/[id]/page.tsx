import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { Badge } from '@/components/ui/badge';

type KeywordAlignment = { matched: string[]; missing: string[] };
type SkillsAlignment = { matched: string[]; missing: string[] };
type WeakBullet = { id: string; reasons: string[] };

export default async function ATSAnalysisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const analysis = await prisma.resumeAnalysis.findFirst({
    where: { id: id, resumeVersion: { resume: { userId: user.id } } },
    include: {
      resumeVersion: { include: { resume: true, bullets: true } },
      role: { include: { company: true } },
    },
  });
  if (!analysis) notFound();

  const keywordAlignment = analysis.keywordAlignment as unknown as KeywordAlignment;
  const skillsAlignment = analysis.skillsAlignment as unknown as SkillsAlignment;
  const weakBullets = analysis.weakBullets as unknown as WeakBullet[];
  const evidenceGapIds = analysis.evidenceGaps as unknown as string[];
  const bulletById = new Map<string, string>(
    analysis.resumeVersion.bullets.map((b) => [b.id, b.text] as [string, string]),
  );

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/prep/ats-analysis" className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to ATS Analysis
      </Link>

      <h1 className="text-xl font-semibold tracking-tight">
        {analysis.resumeVersion.resume.name} — {analysis.resumeVersion.label}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        vs {analysis.role?.title} at {analysis.role?.company.name} · {new Date(analysis.createdAt).toLocaleString()}
      </p>
      <Badge variant="outline" className="mt-2">
        {analysis.source === 'RULE_BASED' ? 'Rule-based analysis' : 'AI suggestion'}
      </Badge>

      <section className="mt-8">
        <h2 className="mb-1 text-sm font-semibold">Keyword alignment</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Real word-overlap between the stored job description and your bullets — not a percentage score.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Matched ({keywordAlignment.matched.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {keywordAlignment.matched.slice(0, 40).map((k) => (
                <Badge key={k} variant="strong">
                  {k}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Missing ({keywordAlignment.missing.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {keywordAlignment.missing.slice(0, 40).map((k) => (
                <Badge key={k} variant="gap">
                  {k}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-1 text-sm font-semibold">Skills alignment</h2>
        <p className="mb-3 text-xs text-muted-foreground">Skills the role lists that you do/don&apos;t have recorded in your Skills.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">You have</p>
            <div className="flex flex-wrap gap-1.5">
              {skillsAlignment.matched.map((s) => (
                <Badge key={s} variant="strong">
                  {s}
                </Badge>
              ))}
              {skillsAlignment.matched.length === 0 && <p className="text-sm text-muted-foreground">None matched.</p>}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Missing</p>
            <div className="flex flex-wrap gap-1.5">
              {skillsAlignment.missing.map((s) => (
                <Badge key={s} variant="gap">
                  {s}
                </Badge>
              ))}
              {skillsAlignment.missing.length === 0 && <p className="text-sm text-muted-foreground">None missing.</p>}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-1 text-sm font-semibold">Evidence gaps</h2>
        <p className="mb-3 text-xs text-muted-foreground">Bullets with no linked project, skill, or achievement backing them.</p>
        {evidenceGapIds.length === 0 ? (
          <p className="text-sm text-muted-foreground">Every bullet has at least one piece of linked evidence.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {evidenceGapIds.map((id) => (
              <li key={id} className="rounded-md border border-border px-3 py-2 text-sm">
                {bulletById.get(id) ?? 'Bullet no longer exists'}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-1 text-sm font-semibold">Potentially weak bullets</h2>
        <p className="mb-3 text-xs text-muted-foreground">Flagged for specific, checkable reasons — not a vibe-based rating.</p>
        {weakBullets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No bullets flagged.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {weakBullets.map((wb) => (
              <li key={wb.id} className="rounded-md border border-border px-3 py-2 text-sm">
                <p>{bulletById.get(wb.id) ?? 'Bullet no longer exists'}</p>
                <ul className="mt-1.5 list-inside list-disc text-xs text-muted-foreground">
                  {wb.reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
