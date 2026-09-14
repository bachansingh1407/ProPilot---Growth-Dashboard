import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { NewInterviewForm } from './new-interview-form';

export default async function NewInterviewPage() {
  const user = await requireUser();
  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    include: { role: { include: { company: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <NewInterviewForm
      applications={applications.map((a) => ({ id: a.id, label: `${a.role.title} at ${a.role.company.name}` }))}
    />
  );
}
