import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const PRIORITY_VARIANT = { LOW: 'outline', MEDIUM: 'default', HIGH: 'strong' } as const;

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const company = await prisma.company.findFirst({
    where: { id: id, userId: user.id },
    include: { roles: true },
  });
  if (!company) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/research/companies" className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Companies
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">{company.name}</h1>
        <Badge variant={PRIORITY_VARIANT[company.priority]}>{company.priority} priority</Badge>
      </div>

      <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
        {company.website && (
          <a href={company.website} target="_blank" rel="noreferrer" className="hover:underline">
            Website
          </a>
        )}
        {company.engineeringBlogUrl && (
          <a href={company.engineeringBlogUrl} target="_blank" rel="noreferrer" className="hover:underline">
            Engineering Blog
          </a>
        )}
        {company.githubUrl && (
          <a href={company.githubUrl} target="_blank" rel="noreferrer" className="hover:underline">
            GitHub
          </a>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {company.techStack.map((t) => (
          <Badge key={t} variant="outline">
            {t}
          </Badge>
        ))}
      </div>

      <dl className="mt-6 flex flex-col gap-5 text-sm">
        {company.engineeringCulture && <Field label="Engineering culture" value={company.engineeringCulture} />}
        {company.interviewProcess && <Field label="Interview process" value={company.interviewProcess} />}
        {company.knownInterviewTopics.length > 0 && (
          <div>
            <dt className="font-medium">Known interview topics</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {company.knownInterviewTopics.map((t) => (
                <Badge key={t} variant="outline">
                  {t}
                </Badge>
              ))}
            </dd>
          </div>
        )}
        {company.pros && <Field label="Pros" value={company.pros} />}
        {company.concerns && <Field label="Concerns" value={company.concerns} />}
        {company.personalFit && <Field label="Personal fit" value={company.personalFit} />}
        {company.notes && <Field label="Notes" value={company.notes} />}
      </dl>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Roles</h2>
          <Button asChild size="sm" variant="outline">
            <Link href={`/research/roles/new?companyId=${company.id}`}>
              <Plus className="mr-1.5 h-4 w-4" /> Add Role
            </Link>
          </Button>
        </div>
        {company.roles.length === 0 ? (
          <p className="text-sm text-muted-foreground">No roles tracked at this company yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {company.roles.map((role) => (
              <Link key={role.id} href={`/research/roles/${role.id}`} className="block rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted/40">
                {role.title}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-medium">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-muted-foreground">{value}</dd>
    </div>
  );
}
