import { TrendingUp } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/data-display/empty-state';
import { Badge } from '@/components/ui/badge';
import { NewImprovementForm } from './new-improvement-form';

const STATUS_LABEL: Record<string, string> = {
  IDENTIFIED: 'Identified',
  IN_PROGRESS: 'In Progress',
  EVIDENCE_ADDED: 'Evidence Added',
  REVIEWED: 'Reviewed',
};

export default async function ImprovementsPage() {
  const user = await requireUser();
  const [improvements, skills] = await Promise.all([
    prisma.improvement.findMany({
      where: { userId: user.id },
      include: { skill: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.skill.findMany({ where: { userId: user.id }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Improvements"
        description="Skill → Weakness → Evidence Gap → Strategy → Project/Experiment → New Evidence. Not a todo list."
      />

      <div className="mb-8 rounded-lg border border-border p-4">
        <NewImprovementForm skills={skills} />
      </div>

      {improvements.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No improvement areas identified yet"
          explanation="These usually come from interview feedback or a skill you've flagged as 'Needs Evidence' — record the weakness and the strategy to close it."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {improvements.map((imp) => (
            <div key={imp.id} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{imp.weakness}</p>
                <Badge variant="outline">{STATUS_LABEL[imp.status]}</Badge>
              </div>
              {imp.skill && <p className="mt-1 text-xs text-muted-foreground">Related skill: {imp.skill.name}</p>}
              {imp.evidenceGap && <p className="mt-2 text-sm text-muted-foreground">Gap: {imp.evidenceGap}</p>}
              <p className="mt-2 text-sm">
                <span className="font-medium">Strategy: </span>
                {imp.strategy}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
