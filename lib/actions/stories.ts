'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { storySchema } from '@/lib/validation/stories';
import { logActivity } from './activity';

export async function createStory(_prevState: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = storySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input.' };

  const skillIds = formData.getAll('skillIds') as string[];
  const projectIds = formData.getAll('projectIds') as string[];
  const achievementIds = formData.getAll('achievementIds') as string[];

  const story = await prisma.story.create({
    data: {
      userId: user.id,
      title: parsed.data.title,
      situation: parsed.data.situation,
      task: parsed.data.task,
      action: parsed.data.action,
      result: parsed.data.result,
      category: parsed.data.category,
      company: parsed.data.company || undefined,
      notes: parsed.data.notes || undefined,
      experienceId: parsed.data.experienceId || undefined,
      skills: skillIds.length ? { create: skillIds.map((skillId) => ({ skillId })) } : undefined,
      projects: projectIds.length ? { create: projectIds.map((projectId) => ({ projectId })) } : undefined,
      achievements: achievementIds.length ? { create: achievementIds.map((achievementId) => ({ achievementId })) } : undefined,
    },
  });

  await logActivity({
    userId: user.id,
    type: 'CREATED',
    entityType: 'Story',
    entityId: story.id,
    summary: `Added story "${story.title}" to the STAR bank`,
  });

  revalidatePath('/prep/story-bank');
  redirect(`/prep/story-bank/${story.id}`);
}
