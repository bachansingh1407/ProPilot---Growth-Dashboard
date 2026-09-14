import Link from 'next/link';
import { ClipboardList, Plus } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/data-display/empty-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const STATUS_LABEL: Record<string, string> = {
  RESEARCHING: 'Researching',
  APPLIED: 'Applied',
  PHONE_SCREEN: 'Phone Screen',
  INTERVIEWING: 'Interviewing',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

export default async function ApplicationsPage() {
  const user = await requireUser();
  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    include: { role: { include: { company: true } } },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div>
      <PageHeader
        title="Applications"
        description="Company Research → Role → Resume → ATS Analysis → Application → Interview → Feedback."
        actions={
          <Button asChild size="sm">
            <Link href="/prep/applications/new">
              <Plus className="mr-1.5 h-4 w-4" /> Track Application
            </Link>
          </Button>
        }
      />

      {applications.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No applications tracked yet"
          explanation="Track an application once you've applied to a role you've already researched — its status, resume version, and later interviews all connect here."
          actionLabel="Track your first application"
          actionHref="/prep/applications/new"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((app) => (
            <Link key={app.id} href={`/prep/applications/${app.id}`} className="block rounded-lg border border-border p-4 hover:bg-muted/30">
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  {app.role.title} · {app.role.company.name}
                </p>
                <Badge variant="outline">{STATUS_LABEL[app.status]}</Badge>
              </div>
              {app.appliedAt && (
                <p className="mt-1 text-xs text-muted-foreground">Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
