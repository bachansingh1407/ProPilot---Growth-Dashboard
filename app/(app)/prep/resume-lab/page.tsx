import Link from 'next/link';
import { FileSearch, Plus } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/data-display/empty-state';
import { Button } from '@/components/ui/button';

export default async function ResumeLabPage() {
  const user = await requireUser();
  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    include: { versions: { orderBy: { createdAt: 'desc' } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <PageHeader
        title="Resume Lab"
        description="Resume → Versions → Bullets → Evidence. Every claim should be traceable."
        actions={
          <Button asChild size="sm">
            <Link href="/prep/resume-lab/new">
              <Plus className="mr-1.5 h-4 w-4" /> New Resume
            </Link>
          </Button>
        }
      />

      {resumes.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title="No resumes yet"
          explanation="Create a resume, then a version tailored to a specific role — each bullet can link back to the project or achievement that proves it."
          actionLabel="Create your first resume"
          actionHref="/prep/resume-lab/new"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {resumes.map((resume) => (
            <div key={resume.id} className="rounded-lg border border-border p-4">
              <p className="font-medium">{resume.name}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {resume.versions.map((v) => (
                  <Link
                    key={v.id}
                    href={`/prep/resume-lab/${resume.id}/${v.id}`}
                    className="rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:bg-muted/40"
                  >
                    {v.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
