import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { Badge } from '@/components/ui/badge';

export default async function StoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const story = await prisma.story.findFirst({
    where: { id: id, userId: user.id },
    include: {
      experience: true,
      projects: { include: { project: { select: { id: true, name: true } } } },
      skills: { include: { skill: { select: { id: true, name: true } } } },
      achievements: { include: { achievement: { select: { id: true, title: true } } } },
    },
  });
  if (!story) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/prep/story-bank" className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Story Bank
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">{story.title}</h1>
        <Badge variant="outline">{story.category.replace(/_/g, ' ')}</Badge>
      </div>
      {story.experience && (
        <p className="mt-1 text-sm text-muted-foreground">
          {story.experience.title} · {story.experience.company}
        </p>
      )}

      <dl className="mt-6 flex flex-col gap-5 text-sm">
        <Field label="Situation" value={story.situation} />
        <Field label="Task" value={story.task} />
        <Field label="Action" value={story.action} />
        <Field label="Result" value={story.result} />
      </dl>

      {(story.projects.length > 0 || story.skills.length > 0 || story.achievements.length > 0) && (
        <section className="mt-6 flex flex-wrap gap-1.5">
          {story.projects.map((p) => (
            <Link key={p.project.id} href={`/engineering/projects/${p.project.id}`}>
              <Badge>{p.project.name}</Badge>
            </Link>
          ))}
          {story.skills.map((s) => (
            <Link key={s.skill.id} href={`/engineering/skills/${s.skill.id}`}>
              <Badge variant="outline">{s.skill.name}</Badge>
            </Link>
          ))}
          {story.achievements.map((a) => (
            <Link key={a.achievement.id} href={`/career/achievements/${a.achievement.id}`}>
              <Badge variant="outline">{a.achievement.title}</Badge>
            </Link>
          ))}
        </section>
      )}
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
