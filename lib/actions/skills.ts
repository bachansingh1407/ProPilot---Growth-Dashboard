'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { skillSchema, skillEvidenceSchema } from '@/lib/validation/skills';
import { logActivity } from './activity';

export async function createSkill(_prevState: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = skillSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input.' };
  }

  const existing = await prisma.skill.findUnique({
    where: { userId_name: { userId: user.id, name: parsed.data.name } },
  });
  if (existing) {
    return { error: `You already have a skill named "${parsed.data.name}".` };
  }

  const skill = await prisma.skill.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      category: parsed.data.category,
      yearsOfExperience: parsed.data.yearsOfExperience ?? undefined,
      description: parsed.data.description || undefined,
      notes: parsed.data.notes || undefined,
      manualLevelOverride: parsed.data.manualLevelOverride || undefined,
    },
  });

  await logActivity({
    userId: user.id,
    type: 'CREATED',
    entityType: 'Skill',
    entityId: skill.id,
    summary: `Added skill "${skill.name}"`,
  });

  revalidatePath('/engineering/skills');
  redirect(`/engineering/skills/${skill.id}`);
}

export async function linkSkillEvidence(_prevState: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = skillEvidenceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input.' };
  }

  // Defense in depth: confirm the skill actually belongs to this user before
  // attaching evidence to it (Section 36 — never trust client input alone).
  const skill = await prisma.skill.findFirst({ where: { id: parsed.data.skillId, userId: user.id } });
  if (!skill) return { error: 'Skill not found.' };

  await prisma.skillEvidence.create({
    data: {
      skillId: parsed.data.skillId,
      projectId: parsed.data.projectId || undefined,
      achievementId: parsed.data.achievementId || undefined,
      metricId: parsed.data.metricId || undefined,
      adrId: parsed.data.adrId || undefined,
      noteId: parsed.data.noteId || undefined,
      note_text: parsed.data.note_text || undefined,
    },
  });

  await logActivity({
    userId: user.id,
    type: 'UPDATED',
    entityType: 'Skill',
    entityId: skill.id,
    summary: `Linked new evidence to skill "${skill.name}"`,
  });

  revalidatePath(`/engineering/skills/${parsed.data.skillId}`);
  return {};
}

export async function deleteSkill(skillId: string) {
  const user = await requireUser();
  const skill = await prisma.skill.findFirst({ where: { id: skillId, userId: user.id } });
  if (!skill) throw new Error('Not found');

  await prisma.skill.delete({ where: { id: skillId } });
  await logActivity({
    userId: user.id,
    type: 'DELETED',
    entityType: 'Skill',
    entityId: skillId,
    summary: `Deleted skill "${skill.name}"`,
  });

  revalidatePath('/engineering/skills');
  redirect('/engineering/skills');
}
