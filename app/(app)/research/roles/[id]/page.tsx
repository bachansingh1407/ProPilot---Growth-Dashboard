import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ScanSearch } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default async function RoleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const role = await prisma.role.findFirst({
    where: { id: id, userId: user.id },
    include: { company: true, applications: true, skills: true },
  });
  if (!role) notFound();

  const skillNames =
    role.skills.length > 0
      ? await prisma.skill
          .findMany({ where: { id: { in: role.skills.map((s: { skillId: string }) => s.skillId) } }, select: { name: true } })
          .then((rows) => rows.map((r) => r.name))
      : [];

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/research/roles" className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Roles
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{role.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <Link href={`/research/companies/${role.company.id}`} className="hover:underline">
              {role.company.name}
            </Link>
            {role.location && ` · ${role.location}`}
            {role.seniority && ` · ${role.seniority}`}
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href={`/prep/ats-analysis/new?roleId=${role.id}`}>
            <ScanSearch className="mr-1.5 h-4 w-4" /> Run ATS Analysis
          </Link>
        </Button>
      </div>

      {skillNames.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {skillNames.map((name) => (
            <Badge key={name} variant="outline">
              {name}
            </Badge>
          ))}
        </div>
      )}

      {role.jobDescription && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold">Job description</h2>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{role.jobDescription}</p>
        </section>
      )}

      {role.requirements.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold">Requirements</h2>
          <ul className="list-inside list-disc text-sm text-muted-foreground">
            {role.requirements.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </section>
      )}

      {role.fit && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold">Personal fit</h2>
          <p className="text-sm text-muted-foreground">{role.fit}</p>
        </section>
      )}

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Applications</h2>
          <Button asChild size="sm" variant="outline">
            <Link href={`/prep/applications/new?roleId=${role.id}`}>Track application</Link>
          </Button>
        </div>
        {role.applications.length === 0 ? (
          <p className="text-sm text-muted-foreground">Not tracked as an application yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {role.applications.map((app) => (
              <Link key={app.id} href={`/prep/applications/${app.id}`} className="block rounded-md border border-border px-3 py-2 text-sm hover:bg-muted/40">
                <Badge variant="outline">{app.status.replace('_', ' ')}</Badge>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
