import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { ApplicationStatusSelect } from '@/components/data-display/application-status-select';

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const application = await prisma.application.findFirst({
    where: { id: id, userId: user.id },
    include: { role: { include: { company: true } }, resumeVersion: { include: { resume: true } }, interviews: true },
  });
  if (!application) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/prep/applications" className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Applications
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{application.role.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <Link href={`/research/companies/${application.role.company.id}`} className="hover:underline">
              {application.role.company.name}
            </Link>
          </p>
        </div>
        <ApplicationStatusSelect applicationId={application.id} status={application.status} />
      </div>

      {application.resumeVersion && (
        <p className="mt-4 text-sm">
          <span className="font-medium">Resume used: </span>
          <Link
            href={`/prep/resume-lab/${application.resumeVersion.resume.id}/${application.resumeVersion.id}`}
            className="text-muted-foreground hover:underline"
          >
            {application.resumeVersion.resume.name} — {application.resumeVersion.label}
          </Link>
        </p>
      )}

      {application.appliedAt && (
        <p className="mt-1 text-sm text-muted-foreground">Applied {new Date(application.appliedAt).toLocaleDateString()}</p>
      )}

      {application.notes && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold">Notes</h2>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{application.notes}</p>
        </section>
      )}

      <section className="mt-8">
        <h2 className="mb-2 text-sm font-semibold">Interviews</h2>
        {application.interviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No interviews recorded yet — the Interview system ships in Phase 4.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {application.interviews.map((i) => (
              <li key={i.id} className="rounded-md border border-border px-3 py-2 text-sm">
                {i.round}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
