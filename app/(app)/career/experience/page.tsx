import Link from 'next/link';
import { Briefcase, Plus } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/data-display/empty-state';
import { Button } from '@/components/ui/button';

export default async function ExperiencePage() {
  const user = await requireUser();
  const experiences = await prisma.experience.findMany({
    where: { userId: user.id },
    orderBy: { startDate: 'desc' },
  });

  return (
    <div>
      <PageHeader
        title="Experience"
        description="More than a resume text block — connected to skills, projects, and achievements."
        actions={
          <Button asChild size="sm">
            <Link href="/career/experience/new">
              <Plus className="mr-1.5 h-4 w-4" /> Add Experience
            </Link>
          </Button>
        }
      />

      {experiences.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No experience recorded yet"
          explanation="Experience anchors everything else — projects, achievements, and resume bullets can all link back to a role."
          actionLabel="Add your first role"
          actionHref="/career/experience/new"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {experiences.map((exp) => (
            <Link key={exp.id} href={`/career/experience/${exp.id}`} className="block rounded-lg border border-border p-4 hover:bg-muted/30">
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  {exp.title} · {exp.company}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(exp.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })} –{' '}
                  {exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'Present'}
                </p>
              </div>
              {exp.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{exp.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
