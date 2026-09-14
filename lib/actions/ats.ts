'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { runAnalysisSchema } from '@/lib/validation/resumes';
import { computeKeywordAlignment, computeSkillsAlignment, findWeakBullets, findEvidenceGaps } from '@/lib/analysis/ats';
import { logActivity } from './activity';

export async function runATSAnalysis(_prevState: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = runAnalysisSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input.' };

  const [version, role] = await Promise.all([
    prisma.resumeVersion.findFirst({
      where: { id: parsed.data.resumeVersionId, resume: { userId: user.id } },
      include: { bullets: { include: { evidence: true } } },
    }),
    prisma.role.findFirst({
      where: { id: parsed.data.roleId, userId: user.id },
      include: { skills: true },
    }),
  ]);

  if (!version) return { error: 'Resume version not found.' };
  if (!role) return { error: 'Role not found.' };
  if (!role.jobDescription) {
    return { error: 'This role has no stored job description to analyze against — add one on the role page first.' };
  }

  // Resolve role.skills (RoleSkill rows) to actual skill names for a real
  // name-based comparison, since RoleSkill only stores skillId.
  const roleSkillIds = role.skills.map((s) => s.skillId);
  const [roleSkills, userSkills] = await Promise.all([
    prisma.skill.findMany({ where: { id: { in: roleSkillIds } }, select: { name: true } }),
    prisma.skill.findMany({ where: { userId: user.id }, select: { name: true } }),
  ]);

  const resumeText = version.bullets.map((b) => b.text).join('\n');
  const bulletsForAnalysis = version.bullets.map((b) => ({ id: b.id, text: b.text, hasEvidence: b.evidence.length > 0 }));

  const keywordAlignment = computeKeywordAlignment(role.jobDescription, resumeText);
  const skillsAlignment = computeSkillsAlignment(
    roleSkills.map((s) => s.name),
    userSkills.map((s) => s.name),
  );
  const weakBullets = findWeakBullets(bulletsForAnalysis);
  const evidenceGapBulletIds = findEvidenceGaps(bulletsForAnalysis);

  const analysis = await prisma.resumeAnalysis.create({
    data: {
      resumeVersionId: version.id,
      roleId: role.id,
      jobDescriptionSnapshot: role.jobDescription,
      keywordAlignment,
      skillsAlignment,
      experienceAlignment: { note: 'Experience-date alignment is not yet implemented — see docs/architecture.md Phase 5.' },
      evidenceGaps: evidenceGapBulletIds,
      weakBullets,
      source: 'RULE_BASED',
    },
  });

  await logActivity({
    userId: user.id,
    type: 'CREATED',
    entityType: 'ResumeAnalysis',
    entityId: analysis.id,
    summary: `Ran ATS analysis of "${version.label}" against "${role.title}"`,
  });

  revalidatePath('/prep/ats-analysis');
  redirect(`/prep/ats-analysis/${analysis.id}`);
}
