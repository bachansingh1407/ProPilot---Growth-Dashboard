'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { projectSchema } from '@/lib/validation/projects';
import { logActivity } from './activity';

function splitCsv(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createProject(_prevState: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = projectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input.' };
  }

  const technologies = splitCsv(parsed.data.technologies);
  const skillIds = formData.getAll('skillIds') as string[];

  const project = await prisma.project.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      description: parsed.data.description || undefined,
      githubUrl: parsed.data.githubUrl || undefined,
      liveUrl: parsed.data.liveUrl || undefined,
      problem: parsed.data.problem || undefined,
      requirements: parsed.data.requirements || undefined,
      implementation: parsed.data.implementation || undefined,
      technologies: { create: technologies.map((name) => ({ name })) },
      skills: skillIds.length ? { create: skillIds.map((skillId) => ({ skillId })) } : undefined,
    },
  });

  await logActivity({
    userId: user.id,
    type: 'CREATED',
    entityType: 'Project',
    entityId: project.id,
    summary: `Added project "${project.name}"`,
  });

  revalidatePath('/engineering/projects');
  redirect(`/engineering/projects/${project.id}`);
}

export async function deleteProject(projectId: string) {
  const user = await requireUser();
  const project = await prisma.project.findFirst({ where: { id: projectId, userId: user.id } });
  if (!project) throw new Error('Not found');

  await prisma.project.delete({ where: { id: projectId } });
  await logActivity({
    userId: user.id,
    type: 'DELETED',
    entityType: 'Project',
    entityId: projectId,
    summary: `Deleted project "${project.name}"`,
  });

  revalidatePath('/engineering/projects');
  redirect('/engineering/projects');
}
