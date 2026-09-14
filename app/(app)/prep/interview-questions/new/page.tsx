import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { NewQuestionForm } from './new-question-form';

export default async function NewInterviewQuestionPage() {
  const user = await requireUser();
  const [skills, projects] = await Promise.all([
    prisma.skill.findMany({ where: { userId: user.id }, select: { id: true, name: true } }),
    prisma.project.findMany({ where: { userId: user.id }, select: { id: true, name: true } }),
  ]);

  return <NewQuestionForm skills={skills} projects={projects} />;
}
