import Link from 'next/link';
import { ScanSearch, Plus } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/data-display/empty-state';
import { Button } from '@/components/ui/button';

export default async function ATSAnalysisListPage() {
  const user = await requireUser();
  const analyses = await prisma.resumeAnalysis.findMany({
    where: { resumeVersion: { resume: { userId: user.id } } },
    include: { role: { include: { company: true } }, resumeVersion: { include: { resume: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <PageHeader
        title="ATS Analysis"
        description="Rule-based comparisons of a resume version against a specific job description — never a fabricated score."
        actions={
          <Button asChild size="sm">
            <Link href="/prep/ats-analysis/new">
              <Plus className="mr-1.5 h-4 w-4" /> Run Analysis
            </Link>
          </Button>
        }
      />

      {analyses.length === 0 ? (
        <EmptyState
          icon={ScanSearch}
          title="No analyses run yet"
          explanation="Pick a resume version and a role with a stored job description, and this compares keywords, skills, and evidence gaps directly — not a guessed match percentage."
          actionLabel="Run your first analysis"
          actionHref="/prep/ats-analysis/new"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {analyses.map((a) => (
            <Link key={a.id} href={`/prep/ats-analysis/${a.id}`} className="block rounded-lg border border-border p-4 hover:bg-muted/30">
              <p className="font-medium">
                {a.resumeVersion.resume.name} — {a.resumeVersion.label}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                vs {a.role?.title} at {a.role?.company.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
