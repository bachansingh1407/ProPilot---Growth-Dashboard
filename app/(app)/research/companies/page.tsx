import Link from 'next/link';
import { Building2, Plus } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/data-display/empty-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PRIORITY_VARIANT = { LOW: 'outline', MEDIUM: 'default', HIGH: 'strong' } as const;

export default async function CompaniesPage() {
  const user = await requireUser();
  const companies = await prisma.company.findMany({
    where: { userId: user.id },
    include: { _count: { select: { roles: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <PageHeader
        title="Companies"
        description="Only companies you've actually researched — not a scraped database."
        actions={
          <Button asChild size="sm">
            <Link href="/research/companies/new">
              <Plus className="mr-1.5 h-4 w-4" /> Add Company
            </Link>
          </Button>
        }
      />

      {companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies researched yet"
          explanation="Add a company once you've actually looked into their tech stack, culture, or interview process — this isn't a directory to browse."
          actionLabel="Add your first company"
          actionHref="/research/companies/new"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {companies.map((c) => (
            <Link key={c.id} href={`/research/companies/${c.id}`} className="rounded-lg border border-border bg-surface p-4 hover:bg-muted/30">
              <div className="flex items-center justify-between">
                <p className="font-medium">{c.name}</p>
                <Badge variant={PRIORITY_VARIANT[c.priority]}>{c.priority}</Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{c._count.roles} role{c._count.roles === 1 ? '' : 's'} tracked</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
