'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { companySchema, roleSchema } from '@/lib/validation/companies';
import { logActivity } from './activity';

function splitCsv(value: string | undefined): string[] {
  if (!value) return [];
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

function splitLines(value: string | undefined): string[] {
  if (!value) return [];
  return value.split('\n').map((s) => s.trim()).filter(Boolean);
}

export async function createCompany(_prevState: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = companySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input.' };

  const company = await prisma.company.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      website: parsed.data.website || undefined,
      engineeringBlogUrl: parsed.data.engineeringBlogUrl || undefined,
      githubUrl: parsed.data.githubUrl || undefined,
      techStack: splitCsv(parsed.data.techStack),
      engineeringCulture: parsed.data.engineeringCulture || undefined,
      interviewProcess: parsed.data.interviewProcess || undefined,
      knownInterviewTopics: splitCsv(parsed.data.knownInterviewTopics),
      notes: parsed.data.notes || undefined,
      pros: parsed.data.pros || undefined,
      concerns: parsed.data.concerns || undefined,
      personalFit: parsed.data.personalFit || undefined,
      priority: parsed.data.priority,
    },
  });

  await logActivity({
    userId: user.id,
    type: 'CREATED',
    entityType: 'Company',
    entityId: company.id,
    summary: `Added company "${company.name}" to research`,
  });

  revalidatePath('/research/companies');
  redirect(`/research/companies/${company.id}`);
}

export async function createRole(_prevState: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = roleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input.' };

  const company = await prisma.company.findFirst({ where: { id: parsed.data.companyId, userId: user.id } });
  if (!company) return { error: 'Company not found.' };

  const skillIds = formData.getAll('skillIds') as string[];

  const role = await prisma.role.create({
    data: {
      userId: user.id,
      companyId: parsed.data.companyId,
      title: parsed.data.title,
      jobUrl: parsed.data.jobUrl || undefined,
      jobDescription: parsed.data.jobDescription || undefined,
      requirements: splitLines(parsed.data.requirements),
      seniority: parsed.data.seniority || undefined,
      location: parsed.data.location || undefined,
      notes: parsed.data.notes || undefined,
      fit: parsed.data.fit || undefined,
      skills: skillIds.length ? { create: skillIds.map((skillId) => ({ skillId })) } : undefined,
    },
  });

  await logActivity({
    userId: user.id,
    type: 'CREATED',
    entityType: 'Role',
    entityId: role.id,
    summary: `Added role "${role.title}" at ${company.name}`,
  });

  revalidatePath('/research/roles');
  redirect(`/research/roles/${role.id}`);
}
