'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { improvementSchema } from '@/lib/validation/improvements';
import { logActivity } from './activity';

export async function createImprovement(_prevState: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = improvementSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input.' };

  const improvement = await prisma.improvement.create({
    data: {
      userId: user.id,
      skillId: parsed.data.skillId || undefined,
      weakness: parsed.data.weakness,
      evidenceGap: parsed.data.evidenceGap || undefined,
      strategy: parsed.data.strategy,
      status: parsed.data.status,
      linkedProjectId: parsed.data.linkedProjectId || undefined,
    },
  });

  await logActivity({
    userId: user.id,
    type: 'CREATED',
    entityType: 'Improvement',
    entityId: improvement.id,
    summary: `Identified improvement: "${improvement.weakness.slice(0, 60)}"`,
  });

  revalidatePath('/engineering/improvements');
  return {};
}

export async function updateImprovementStatus(id: string, status: 'IDENTIFIED' | 'IN_PROGRESS' | 'EVIDENCE_ADDED' | 'REVIEWED') {
  const user = await requireUser();
  const improvement = await prisma.improvement.findFirst({ where: { id, userId: user.id } });
  if (!improvement) throw new Error('Not found');

  await prisma.improvement.update({
    where: { id },
    data: { status, reviewedAt: status === 'REVIEWED' ? new Date() : improvement.reviewedAt },
  });

  await logActivity({
    userId: user.id,
    type: 'UPDATED',
    entityType: 'Improvement',
    entityId: id,
    summary: `Moved improvement to "${status}"`,
  });

  revalidatePath('/engineering/improvements');
}
