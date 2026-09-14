import Link from 'next/link';
import { Wrench, Plus } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/data-display/empty-state';
import { Button } from '@/components/ui/button';
import { SkillLevelBadge } from '@/components/skills/skill-level-badge';
import { resolveSkillLevel } from '@/lib/analysis/skill-level';

export default async function SkillsPage() {
  const user = await requireUser();

  const skills = await prisma.skill.findMany({
    where: { userId: user.id },
    include: { _count: { select: { evidence: true, projectLinks: true } } },
    orderBy: { name: 'asc' },
  });

  return (
    <div>
      <PageHeader
        title="Skills"
        description="Every skill's state is derived from linked evidence — not a number you type in."
        actions={
          <Button asChild size="sm">
            <Link href="/engineering/skills/new">
              <Plus className="mr-1.5 h-4 w-4" /> Add Skill
            </Link>
          </Button>
        }
      />

      {skills.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No skills yet"
          explanation="Skills are the central relationship point in your evidence graph — projects, achievements, and interview questions all connect back to them."
          actionLabel="Add your first skill"
          actionHref="/engineering/skills/new"
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Name</th>
                <th className="hidden px-4 py-2.5 text-left font-medium sm:table-cell">Category</th>
                <th className="hidden px-4 py-2.5 text-left font-medium md:table-cell">Evidence</th>
                <th className="px-4 py-2.5 text-left font-medium">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {skills.map((skill) => {
                const { level, isOverridden } = resolveSkillLevel(skill.manualLevelOverride, {
                  evidenceCount: skill._count.evidence,
                  projectCount: skill._count.projectLinks,
                  yearsOfExperience: skill.yearsOfExperience,
                });
                return (
                  <tr key={skill.id} className="hover:bg-muted/30">
                    <td className="px-4 py-2.5">
                      <Link href={`/engineering/skills/${skill.id}`} className="font-medium hover:underline">
                        {skill.name}
                      </Link>
                    </td>
                    <td className="hidden px-4 py-2.5 text-muted-foreground sm:table-cell">{skill.category}</td>
                    <td className="hidden px-4 py-2.5 text-muted-foreground md:table-cell">
                      {skill._count.evidence} item{skill._count.evidence === 1 ? '' : 's'}
                    </td>
                    <td className="px-4 py-2.5">
                      <SkillLevelBadge level={level} isOverridden={isOverridden} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
