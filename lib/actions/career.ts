'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { achievementSchema, experienceSchema } from '@/lib/validation/career';
import { logActivity } from './activity';

function splitCsv(value: string | undefined): string[] {
  if (!value) return [];
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

function splitLines(value: string | undefined): string[] {
  if (!value) return [];
  return value.split('\n').map((s) => s.trim()).filter(Boolean);
}

export async function createAchievement(_prevState: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = achievementSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input.' };

  const achievement = await prisma.achievement.create({
    data: {
      userId: user.id,
      title: parsed.data.title,
      context: parsed.data.context,
      problem: parsed.data.problem || undefined,
      action: parsed.data.action,
      technicalComplexity: parsed.data.technicalComplexity || undefined,
      impact: parsed.data.impact,
      date: parsed.data.date,
      technologies: splitCsv(parsed.data.technologies),
      projectId: parsed.data.projectId || undefined,
      experienceId: parsed.data.experienceId || undefined,
    },
  });

  await logActivity({
    userId: user.id,
    type: 'CREATED',
    entityType: 'Achievement',
    entityId: achievement.id,
    summary: `Added achievement "${achievement.title}"`,
  });

  revalidatePath('/career/achievements');
  redirect(`/career/achievements/${achievement.id}`);
}

export async function createExperience(_prevState: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = experienceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input.' };

  const experience = await prisma.experience.create({
    data: {
      userId: user.id,
      company: parsed.data.company,
      title: parsed.data.title,
      location: parsed.data.location || undefined,
      employmentType: parsed.data.employmentType,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate || undefined,
      description: parsed.data.description || undefined,
      responsibilities: splitLines(parsed.data.responsibilities),
      technologies: { create: splitCsv(parsed.data.technologies).map((name) => ({ name })) },
    },
  });

  await logActivity({
    userId: user.id,
    type: 'CREATED',
    entityType: 'Experience',
    entityId: experience.id,
    summary: `Added experience "${experience.title}" at ${experience.company}`,
  });

  revalidatePath('/career/experience');
  redirect(`/career/experience/${experience.id}`);
}
