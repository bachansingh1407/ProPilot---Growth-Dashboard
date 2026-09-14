import Link from 'next/link';
import { UserSearch, Plus } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/data-display/empty-state';
import { Button } from '@/components/ui/button';

export default async function RolesPage() {
  const user = await requireUser();
  const roles = await prisma.role.findMany({
    where: { userId: user.id },
    include: { company: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <PageHeader
        title="Roles"
        description="Specific roles you're evaluating, connected to companies, applications, and resume versions."
        actions={
          <Button asChild size="sm">
            <Link href="/research/roles/new">
              <Plus className="mr-1.5 h-4 w-4" /> Add Role
            </Link>
          </Button>
        }
      />

      {roles.length === 0 ? (
        <EmptyState
          icon={UserSearch}
          title="No roles tracked yet"
          explanation="A role connects a company's job posting to your resume tailoring, ATS analysis, and application tracking."
          actionLabel="Add your first role"
          actionHref="/research/roles/new"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {roles.map((role) => (
            <Link key={role.id} href={`/research/roles/${role.id}`} className="block rounded-lg border border-border p-4 hover:bg-muted/30">
              <p className="font-medium">{role.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {role.company.name}
                {role.location && ` · ${role.location}`}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
