import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import {
  READINESS_CATEGORIES,
  resolveReadinessState,
  READINESS_STATE_LABEL,
  READINESS_BADGE_VARIANT,
} from '@/lib/analysis/readiness';

function matchesKeyword(text: string | null | undefined, keywords: string[]): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

export default async function ReadinessPage() {
  const user = await requireUser();

  const [skills, architecture, stories, adrCount, noteCount, improvements] = await Promise.all([
    prisma.skill.findMany({ where: { userId: user.id }, select: { id: true, name: true, category: true, evidence: { select: { id: true } } } }),
    prisma.projectArchitecture.findMany({ where: { project: { userId: user.id } }, select: { id: true, title: true, category: true } }),
    prisma.story.findMany({ where: { userId: user.id }, select: { id: true, title: true, category: true } }),
    prisma.aDR.count({ where: { project: { userId: user.id } } }),
    prisma.technicalNote.count({ where: { userId: user.id } }),
    prisma.improvement.findMany({
      where: { userId: user.id, status: { in: ['IDENTIFIED', 'IN_PROGRESS'] } },
      include: { skill: { select: { category: true, name: true } } },
    }),
  ]);

  // Only count a skill as a "signal" if it actually has evidence — an
  // unevidenced skill claim shouldn't make a readiness category look strong.
  const evidencedSkills = skills.filter((s) => s.evidence.length > 0);

  const rows = READINESS_CATEGORIES.map((cat) => {
    const matchedSkills = cat.skillKeywords
      ? evidencedSkills.filter((s) => matchesKeyword(s.category, cat.skillKeywords!) || matchesKeyword(s.name, cat.skillKeywords!))
      : [];
    const matchedArchitecture = cat.architectureCategories
      ? architecture.filter((a) => cat.architectureCategories!.includes(a.category))
      : [];
    const matchedStories = cat.storyCategories ? stories.filter((s) => cat.storyCategories!.includes(s.category)) : [];
    const docsSignal = cat.useDocsSignal ? adrCount + noteCount : 0;

    const signalCount = matchedSkills.length + matchedArchitecture.length + matchedStories.length + docsSignal;

    const hasOpenImprovement = improvements.some(
      (imp) =>
        (imp.skill && cat.skillKeywords && matchesKeyword(imp.skill.category, cat.skillKeywords)) ||
        matchesKeyword(imp.weakness, [cat.label.toLowerCase()]),
    );

    const state = resolveReadinessState(signalCount, hasOpenImprovement);

    return { ...cat, matchedSkills, matchedArchitecture, matchedStories, docsSignal, signalCount, state };
  });

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Senior Engineer Readiness"
        description="Fifteen categories, each backed by real evidence — not one fabricated overall score."
      />

      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.key} className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">{row.label}</p>
              <Badge variant={READINESS_BADGE_VARIANT[row.state]}>{READINESS_STATE_LABEL[row.state]}</Badge>
            </div>

            <div className="mt-2 text-sm text-muted-foreground">
              {row.signalCount === 0 ? (
                <p>No matching evidence found yet.</p>
              ) : (
                <ul className="list-inside list-disc">
                  {row.matchedSkills.map((s) => (
                    <li key={s.id}>Skill: {s.name}</li>
                  ))}
                  {row.matchedArchitecture.map((a) => (
                    <li key={a.id}>Architecture: {a.title}</li>
                  ))}
                  {row.matchedStories.map((s) => (
                    <li key={s.id}>Story: {s.title}</li>
                  ))}
                  {row.docsSignal > 0 && <li>{row.docsSignal} ADRs/notes recorded</li>}
                </ul>
              )}
              {row.state === 'NEEDS_IMPROVEMENT' && (
                <p className="mt-1.5 text-evidence-gap">Flagged by an open improvement you've identified in this area.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
