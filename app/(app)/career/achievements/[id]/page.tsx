import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { Badge } from '@/components/ui/badge';

export default async function AchievementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const achievement = await prisma.achievement.findFirst({
    where: { id: id, userId: user.id },
    include: { project: true, experience: true },
  });
  if (!achievement) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/career/achievements" className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Achievements
      </Link>

      <h1 className="text-xl font-semibold tracking-tight">{achievement.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {achievement.project ? (
          <Link href={`/engineering/projects/${achievement.project.id}`} className="hover:underline">
            {achievement.project.name}
          </Link>
        ) : achievement.experience ? (
          `${achievement.experience.title} · ${achievement.experience.company}`
        ) : (
          'Not linked to a project or role'
        )}
        {achievement.date && ` · ${new Date(achievement.date).toLocaleDateString()}`}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {achievement.technologies.map((t) => (
          <Badge key={t} variant="outline">
            {t}
          </Badge>
        ))}
      </div>

      <dl className="mt-6 flex flex-col gap-5 text-sm">
        <Field label="Context" value={achievement.context} />
        {achievement.problem && <Field label="Problem" value={achievement.problem} />}
        <Field label="Action" value={achievement.action} />
        {achievement.technicalComplexity && <Field label="Technical complexity" value={achievement.technicalComplexity} />}
        <Field label="Impact" value={achievement.impact} />
      </dl>
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
