import { prisma } from '@/lib/db/client';
import type { ActivityType } from '@prisma/client';

export async function logActivity(params: {
  userId: string;
  type: ActivityType;
  entityType: string;
  entityId: string;
  summary: string;
}) {
  await prisma.activity.create({ data: params });
}
