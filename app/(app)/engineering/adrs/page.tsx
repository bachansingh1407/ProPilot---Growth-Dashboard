import Link from 'next/link';
import { FileText } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/data-display/empty-state';
import { Badge } from '@/components/ui/badge';

const STATUS_VARIANT: Record<string, 'default' | 'outline' | 'strong' | 'gap'> = {
  ACCEPTED: 'strong',
  PROPOSED: 'outline',
  REJECTED: 'gap',
  DEPRECATED: 'gap',
  SUPERSEDED: 'outline',
};

export default async function ADRsHubPage() {
  const user = await requireUser();

  const adrs = await prisma.aDR.findMany({
    where: { project: { userId: user.id } },
    include: { project: { select: { id: true, name: true } } },
    orderBy: { date: 'desc' },
  });

  return (
    <div>
      <PageHeader title="ADRs" description="Architecture Decision Records across every project." />

      {adrs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No ADRs yet"
          explanation="ADRs live on individual projects — open a project and use 'Add ADR' to capture a decision, its alternatives, and its tradeoffs."
          actionLabel="Go to Projects"
          actionHref="/engineering/projects"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {adrs.map((adr) => (
            <Link key={adr.id} href={`/engineering/projects/${adr.project.id}`} className="block rounded-lg border border-border p-4 hover:bg-muted/30">
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  {adr.identifier} — {adr.title}
                </p>
                <Badge variant={STATUS_VARIANT[adr.status] ?? 'default'}>{adr.status}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">in {adr.project.name}</p>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{adr.decision}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
