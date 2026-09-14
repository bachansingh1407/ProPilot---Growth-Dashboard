import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { Badge } from '@/components/ui/badge';

export default async function ExperienceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const experience = await prisma.experience.findFirst({
    where: { id: id, userId: user.id },
    include: { technologies: true, projects: true, achievements: true },
  });
  if (!experience) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/career/experience" className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Experience
      </Link>

      <h1 className="text-xl font-semibold tracking-tight">
        {experience.title} · {experience.company}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {new Date(experience.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })} –{' '}
        {experience.endDate
          ? new Date(experience.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
          : 'Present'}
        {experience.location && ` · ${experience.location}`}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {experience.technologies.map((t) => (
          <Badge key={t.id} variant="outline">
            {t.name}
          </Badge>
        ))}
      </div>

      {experience.description && <p className="mt-6 text-sm leading-relaxed">{experience.description}</p>}

      {experience.responsibilities.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold">Responsibilities</h2>
          <ul className="list-inside list-disc text-sm text-muted-foreground">
            {experience.responsibilities.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </section>
      )}

      {experience.achievements.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold">Achievements</h2>
          <ul className="flex flex-col gap-2">
            {experience.achievements.map((a) => (
              <li key={a.id}>
                <Link href={`/career/achievements/${a.id}`} className="text-sm font-medium hover:underline">
                  {a.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {experience.projects.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold">Projects</h2>
          <ul className="flex flex-col gap-2">
            {experience.projects.map((p) => (
              <li key={p.id}>
                <Link href={`/engineering/projects/${p.id}`} className="text-sm font-medium hover:underline">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
