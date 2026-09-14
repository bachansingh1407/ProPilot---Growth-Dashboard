import Link from 'next/link';
import { Network } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/data-display/empty-state';
import { Badge } from '@/components/ui/badge';

export default async function ArchitectureHubPage() {
  const user = await requireUser();

  const records = await prisma.projectArchitecture.findMany({
    where: { project: { userId: user.id } },
    include: { project: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <PageHeader
        title="Architecture"
        description="System design, distributed systems, and infrastructure decisions across every project."
      />

      {records.length === 0 ? (
        <EmptyState
          icon={Network}
          title="No architecture documented yet"
          explanation="Architecture records live on individual projects — open a project and use 'Document architecture' to add one."
          actionLabel="Go to Projects"
          actionHref="/engineering/projects"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {records.map((r) => (
            <Link key={r.id} href={`/engineering/projects/${r.project.id}`} className="block rounded-lg border border-border p-4 hover:bg-muted/30">
              <div className="flex items-center justify-between">
                <p className="font-medium">{r.title}</p>
                <Badge variant="outline">{r.category.replace(/_/g, ' ')}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">in {r.project.name}</p>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
