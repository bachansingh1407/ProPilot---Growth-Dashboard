'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { resumeSchema, resumeVersionSchema, resumeBulletSchema, resumeEvidenceSchema } from '@/lib/validation/resumes';
import { logActivity } from './activity';

export async function createResume(_prevState: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = resumeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input.' };

  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      versions: { create: { label: 'v1' } },
    },
    include: { versions: true },
  });

  await logActivity({
    userId: user.id,
    type: 'CREATED',
    entityType: 'Resume',
    entityId: resume.id,
    summary: `Created resume "${resume.name}"`,
  });

  revalidatePath('/prep/resume-lab');
  redirect(`/prep/resume-lab/${resume.id}/${resume.versions[0]!.id}`);
}

export async function createResumeVersion(_prevState: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = resumeVersionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input.' };

  const resume = await prisma.resume.findFirst({ where: { id: parsed.data.resumeId, userId: user.id } });
  if (!resume) return { error: 'Resume not found.' };

  const version = await prisma.resumeVersion.create({
    data: {
      resumeId: parsed.data.resumeId,
      label: parsed.data.label,
      targetRoleId: parsed.data.targetRoleId || undefined,
    },
  });

  await logActivity({
    userId: user.id,
    type: 'CREATED',
    entityType: 'ResumeVersion',
    entityId: version.id,
    summary: `Created resume version "${version.label}" for "${resume.name}"`,
  });

  revalidatePath(`/prep/resume-lab/${resume.id}`);
  redirect(`/prep/resume-lab/${resume.id}/${version.id}`);
}

async function assertOwnsVersion(userId: string, resumeVersionId: string) {
  const version = await prisma.resumeVersion.findFirst({
    where: { id: resumeVersionId, resume: { userId } },
    include: { resume: true },
  });
  if (!version) throw new Error('Resume version not found or not owned by this user.');
  return version;
}

export async function createResumeBullet(_prevState: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = resumeBulletSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input.' };

  const version = await assertOwnsVersion(user.id, parsed.data.resumeVersionId);

  const count = await prisma.resumeBullet.count({ where: { resumeVersionId: parsed.data.resumeVersionId } });

  await prisma.resumeBullet.create({
    data: {
      resumeVersionId: parsed.data.resumeVersionId,
      text: parsed.data.text,
      experienceId: parsed.data.experienceId || undefined,
      achievementId: parsed.data.achievementId || undefined,
      sortOrder: count,
    },
  });

  await logActivity({
    userId: user.id,
    type: 'CREATED',
    entityType: 'ResumeBullet',
    entityId: version.id,
    summary: `Added a bullet to resume version "${version.label}"`,
  });

  revalidatePath(`/prep/resume-lab/${version.resumeId}/${version.id}`);
  return {};
}

export async function linkResumeEvidence(_prevState: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = resumeEvidenceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input.' };

  const bullet = await prisma.resumeBullet.findFirst({
    where: { id: parsed.data.bulletId, resumeVersion: { resume: { userId: user.id } } },
    include: { resumeVersion: true },
  });
  if (!bullet) return { error: 'Bullet not found.' };

  await prisma.resumeEvidence.create({
    data: {
      bulletId: parsed.data.bulletId,
      projectId: parsed.data.projectId || undefined,
      skillId: parsed.data.skillId || undefined,
      note: parsed.data.note || undefined,
    },
  });

  revalidatePath(`/prep/resume-lab/${bullet.resumeVersion.resumeId}/${bullet.resumeVersionId}`);
  return {};
}
