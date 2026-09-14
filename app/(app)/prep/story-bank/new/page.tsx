import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { NewStoryForm } from './new-story-form';

export default async function NewStoryPage() {
  const user = await requireUser();
  const [experiences, projects, skills, achievements] = await Promise.all([
    prisma.experience.findMany({ where: { userId: user.id }, select: { id: true, company: true, title: true } }),
    prisma.project.findMany({ where: { userId: user.id }, select: { id: true, name: true } }),
    prisma.skill.findMany({ where: { userId: user.id }, select: { id: true, name: true } }),
    prisma.achievement.findMany({ where: { userId: user.id }, select: { id: true, title: true } }),
  ]);

  return <NewStoryForm experiences={experiences} projects={projects} skills={skills} achievements={achievements} />;
}
