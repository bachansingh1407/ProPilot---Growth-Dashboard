import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { NewAchievementForm } from './new-achievement-form';

export default async function NewAchievementPage() {
  const user = await requireUser();
  const [projects, experiences] = await Promise.all([
    prisma.project.findMany({ where: { userId: user.id }, select: { id: true, name: true } }),
    prisma.experience.findMany({ where: { userId: user.id }, select: { id: true, company: true, title: true } }),
  ]);

  return <NewAchievementForm projects={projects} experiences={experiences} />;
}
