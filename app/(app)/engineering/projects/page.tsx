import Link from 'next/link';
import { FolderGit2, Plus } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/data-display/empty-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default async function ProjectsPage() {
  const user = await requireUser();

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    include: { technologies: true, _count: { select: { architecture: true, adrs: true, metrics: true, achievements: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Progressive disclosure: start with the basics, then document architecture, decisions, and metrics."
        actions={
          <Button asChild size="sm">
            <Link href="/engineering/projects/new">
              <Plus className="mr-1.5 h-4 w-4" /> Add Project
            </Link>
          </Button>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No engineering projects yet"
          explanation="Projects are the foundation of your evidence graph — skills, architecture, ADRs, metrics, and achievements all connect back to them."
          actionLabel="Add your first project"
          actionHref="/engineering/projects/new"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/engineering/projects/${project.id}`}
              className="rounded-lg border border-border bg-surface p-4 transition-colors hover:bg-muted/30"
            >
              <p className="font-medium">{project.name}</p>
              {project.description && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.technologies.slice(0, 4).map((t) => (
                  <Badge key={t.id} variant="outline">
                    {t.name}
                  </Badge>
                ))}
              </div>
              <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                <span>{project._count.architecture} architecture</span>
                <span>{project._count.adrs} ADRs</span>
                <span>{project._count.metrics} metrics</span>
                <span>{project._count.achievements} achievements</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
