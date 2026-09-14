import Link from 'next/link';
import { Trophy, Plus } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/data-display/empty-state';
import { Button } from '@/components/ui/button';

export default async function AchievementsPage() {
  const user = await requireUser();
  const achievements = await prisma.achievement.findMany({
    where: { userId: user.id },
    include: { project: { select: { name: true } }, experience: { select: { company: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <PageHeader
        title="Achievements"
        description="Real engineering impact — reusable by your resume, portfolio, and interview stories."
        actions={
          <Button asChild size="sm">
            <Link href="/career/achievements/new">
              <Plus className="mr-1.5 h-4 w-4" /> Add Achievement
            </Link>
          </Button>
        }
      />

      {achievements.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No achievements yet"
          explanation="Achievements capture context, action, and impact — the raw material for resume bullets and STAR stories."
          actionLabel="Add your first achievement"
          actionHref="/career/achievements/new"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {achievements.map((a) => (
            <Link key={a.id} href={`/career/achievements/${a.id}`} className="block rounded-lg border border-border p-4 hover:bg-muted/30">
              <p className="font-medium">{a.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.impact}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {a.project?.name ?? a.experience?.company ?? 'Unlinked'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
