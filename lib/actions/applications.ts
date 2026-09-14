'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { applicationSchema } from '@/lib/validation/resumes';
import { logActivity } from './activity';

export async function createApplication(_prevState: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = applicationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input.' };

  const role = await prisma.role.findFirst({ where: { id: parsed.data.roleId, userId: user.id }, include: { company: true } });
  if (!role) return { error: 'Role not found.' };

  const application = await prisma.application.create({
    data: {
      userId: user.id,
      roleId: parsed.data.roleId,
      resumeVersionId: parsed.data.resumeVersionId || undefined,
      status: parsed.data.status,
      appliedAt: parsed.data.appliedAt,
      notes: parsed.data.notes || undefined,
    },
  });

  await logActivity({
    userId: user.id,
    type: 'CREATED',
    entityType: 'Application',
    entityId: application.id,
    summary: `Tracking application to "${role.title}" at ${role.company.name}`,
  });

  revalidatePath('/prep/applications');
  redirect(`/prep/applications/${application.id}`);
}

export async function updateApplicationStatus(
  id: string,
  status: 'RESEARCHING' | 'APPLIED' | 'PHONE_SCREEN' | 'INTERVIEWING' | 'OFFER' | 'REJECTED' | 'WITHDRAWN',
) {
  const user = await requireUser();
  const application = await prisma.application.findFirst({ where: { id, userId: user.id } });
  if (!application) throw new Error('Not found');

  await prisma.application.update({ where: { id }, data: { status } });

  await logActivity({
    userId: user.id,
    type: 'UPDATED',
    entityType: 'Application',
    entityId: id,
    summary: `Moved application to "${status}"`,
  });

  revalidatePath(`/prep/applications/${id}`);
  revalidatePath('/prep/applications');
}
