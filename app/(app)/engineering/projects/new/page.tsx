import { NewProjectForm } from './new-project-form';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';

export default async function NewProjectPage() {
  const user = await requireUser();
  const skills = await prisma.skill.findMany({ where: { userId: user.id }, select: { id: true, name: true }, orderBy: { name: 'asc' } });

  return <NewProjectForm skills={skills} />;
}
