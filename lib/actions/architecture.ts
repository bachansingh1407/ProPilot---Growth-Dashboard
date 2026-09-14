'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { architectureSchema, adrSchema, metricSchema } from '@/lib/validation/projects';
import { logActivity } from './activity';

async function assertOwnsProject(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!project) throw new Error('Project not found or not owned by this user.');
  return project;
}

export async function createArchitecture(_prevState: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = architectureSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input.' };

  const project = await assertOwnsProject(user.id, parsed.data.projectId);

  const record = await prisma.projectArchitecture.create({
    data: {
      projectId: parsed.data.projectId,
      title: parsed.data.title,
      category: parsed.data.category,
      description: parsed.data.description,
      tradeoffs: parsed.data.tradeoffs || undefined,
    },
  });

  await logActivity({
    userId: user.id,
    type: 'CREATED',
    entityType: 'ProjectArchitecture',
    entityId: record.id,
    summary: `Documented architecture "${record.title}" for project "${project.name}"`,
  });

  revalidatePath(`/engineering/projects/${parsed.data.projectId}`);
  revalidatePath('/engineering/architecture');
  return {};
}

export async function createADR(_prevState: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = adrSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input.' };

  const project = await assertOwnsProject(user.id, parsed.data.projectId);

  const existing = await prisma.aDR.findUnique({
    where: { projectId_identifier: { projectId: parsed.data.projectId, identifier: parsed.data.identifier } },
  });
  if (existing) return { error: `${parsed.data.identifier} already exists on this project.` };

  const adr = await prisma.aDR.create({
    data: {
      projectId: parsed.data.projectId,
      identifier: parsed.data.identifier,
      title: parsed.data.title,
      status: parsed.data.status,
      context: parsed.data.context,
      problem: parsed.data.problem,
      decision: parsed.data.decision,
      alternatives: parsed.data.alternatives || undefined,
      tradeoffs: parsed.data.tradeoffs || undefined,
      consequences: parsed.data.consequences || undefined,
      notes: parsed.data.notes || undefined,
    },
  });

  await logActivity({
    userId: user.id,
    type: 'CREATED',
    entityType: 'ADR',
    entityId: adr.id,
    summary: `Added ${adr.identifier} "${adr.title}" to project "${project.name}"`,
  });

  revalidatePath(`/engineering/projects/${parsed.data.projectId}`);
  revalidatePath('/engineering/adrs');
  return {};
}

export async function createMetric(_prevState: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = metricSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input.' };

  const project = await assertOwnsProject(user.id, parsed.data.projectId);

  const metric = await prisma.projectMetric.create({
    data: {
      projectId: parsed.data.projectId,
      name: parsed.data.name,
      value: parsed.data.value,
      unit: parsed.data.unit,
      date: parsed.data.date ?? new Date(),
      source: parsed.data.source || undefined,
      notes: parsed.data.notes || undefined,
    },
  });

  await logActivity({
    userId: user.id,
    type: 'CREATED',
    entityType: 'ProjectMetric',
    entityId: metric.id,
    summary: `Recorded metric "${metric.name}: ${metric.value}${metric.unit}" for project "${project.name}"`,
  });

  revalidatePath(`/engineering/projects/${parsed.data.projectId}`);
  revalidatePath('/engineering/metrics');
  return {};
}
