import Link from 'next/link';
import { FolderGit2 } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { PageHeader } from '@/components/shared/page-header';
import { DateRangeFilter } from '@/components/date-range/date-range-filter';
import { EmptyState } from '@/components/data-display/empty-state';
import { Badge } from '@/components/ui/badge';
import { resolveSkillLevel, SKILL_LEVEL_LABEL } from '@/lib/analysis/skill-level';
import { getEvidenceGapSummary } from '@/lib/analysis/evidence-gaps';
import type { SkillLevel } from '@prisma/client';

function parseRangeFromSearchParams(searchParams: Record<string, string | string[] | undefined>) {
  const preset = (searchParams.range as string) ?? '30d';
  const now = new Date();
  if (preset === 'custom' && searchParams.from && searchParams.to) {
    return { from: new Date(searchParams.from as string), to: new Date(searchParams.to as string) };
  }
  const days = preset === '24h' ? 1 : preset === '7d' ? 7 : 30;
  const from = new Date(now);
  from.setDate(from.getDate() - days);
  return { from, to: now };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const user = await requireUser();
  const { from, to } = parseRangeFromSearchParams(resolvedSearchParams);

  const [profile, projectCount, skills, evidenceGaps, recentActivity, applications] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    prisma.project.count({ where: { userId: user.id } }),
    prisma.skill.findMany({
      where: { userId: user.id },
      include: { _count: { select: { evidence: true, projectLinks: true } } },
    }),
    getEvidenceGapSummary(user.id),
    prisma.activity.findMany({ where: { userId: user.id, createdAt: { gte: from, lte: to } }, orderBy: { createdAt: 'desc' }, take: 10 }),
    prisma.application.findMany({ where: { userId: user.id }, select: { status: true } }),
  ]);

  if (projectCount === 0 && skills.length === 0) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Your engineering evidence, at a glance." actions={<DateRangeFilter defaultPreset="30d" />} />
        <EmptyState
          icon={FolderGit2}
          title="No engineering projects yet"
          explanation="Projects become the foundation of your evidence graph — skills, architecture, metrics, and achievements all connect back to them."
          actionLabel="Add your first project"
          actionHref="/engineering/projects/new"
        />
      </div>
    );
  }

  // Engineering Strength — grouped by computed state, never a fabricated score.
  const strengthBuckets: Record<SkillLevel, number> = {
    STRONG: 0, DEVELOPING: 0, WEAK: 0, NEEDS_EVIDENCE: 0, NOT_ENOUGH_DATA: 0,
  };
  for (const skill of skills) {
    const { level } = resolveSkillLevel(skill.manualLevelOverride, {
      evidenceCount: skill._count.evidence,
      projectCount: skill._count.projectLinks,
      yearsOfExperience: skill.yearsOfExperience,
    });
    strengthBuckets[level] = (strengthBuckets[level] ?? 0) + 1;
  }

  const activePipeline = applications.filter((a) => !['REJECTED', 'WITHDRAWN'].includes(a.status)).length;

  // Insights — only derived from what's actually true right now, no fabrication.
  const insights: string[] = [];
  if (evidenceGaps.skillsWithNoEvidence > 0) {
    insights.push(`${evidenceGaps.skillsWithNoEvidence} skill${evidenceGaps.skillsWithNoEvidence === 1 ? '' : 's'} have no linked evidence.`);
  }
  if (evidenceGaps.projectsWithNoArchitecture > 0) {
    insights.push(`${evidenceGaps.projectsWithNoArchitecture} project${evidenceGaps.projectsWithNoArchitecture === 1 ? '' : 's'} have no architecture documentation.`);
  }
  if (evidenceGaps.resumeBulletsWithNoEvidence > 0) {
    insights.push(`${evidenceGaps.resumeBulletsWithNoEvidence} resume bullet${evidenceGaps.resumeBulletsWithNoEvidence === 1 ? '' : 's'} are missing supporting evidence.`);
  }

  return (
    <div>
      <PageHeader title="Dashboard" description="Your engineering evidence, at a glance." actions={<DateRangeFilter defaultPreset="30d" />} />

      {profile && (
        <div className="mb-6 rounded-lg border border-border p-4">
          <p className="font-medium">{profile.fullName}</p>
          <p className="text-sm text-muted-foreground">
            {[profile.currentTitle, profile.primaryFocus, profile.location].filter(Boolean).join(' · ') || 'Add your profile details in Settings.'}
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Projects" value={projectCount} />
        <StatCard label="Skills tracked" value={skills.length} />
        <StatCard label="Active applications" value={activePipeline} />
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold">Engineering Strength</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(Object.keys(strengthBuckets) as SkillLevel[]).map((level) => (
            <Link key={level} href="/engineering/skills" className="rounded-lg border border-border p-3 text-center hover:bg-muted/30">
              <p className="text-lg font-semibold tabular-nums">{strengthBuckets[level] ?? 0}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{SKILL_LEVEL_LABEL[level]}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold">Evidence Gaps</h2>
        {insights.length === 0 ? (
          <p className="text-sm text-muted-foreground">No evidence gaps detected — nice work.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {insights.map((insight) => (
              <li key={insight} className="rounded-md border border-border px-3 py-2 text-sm">
                <Badge variant="gap" className="mr-2">Gap</Badge>
                {insight}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity in this date range.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {recentActivity.map((a) => (
              <li key={a.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                <span>{a.summary}</span>
                <span className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-8 flex gap-4 text-sm">
        <Link href="/readiness" className="text-primary hover:underline">
          View Senior Engineer Readiness →
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
