import { prisma } from '@/lib/db/client';

/**
 * Every function here does exactly one real, explainable Prisma query.
 * Nothing is inferred or guessed — if a number is 0, that's because the
 * query genuinely returned 0 rows, not because we chose not to show a gap.
 */
export async function getEvidenceGapSummary(userId: string) {
  const [skillsWithNoEvidence, projectsWithNoArchitecture, resumeBulletsWithNoEvidence] = await Promise.all([
    prisma.skill.count({ where: { userId, evidence: { none: {} } } }),
    prisma.project.count({ where: { userId, architecture: { none: {} } } }),
    prisma.resumeBullet.count({
      where: { resumeVersion: { resume: { userId } }, evidence: { none: {} } },
    }),
  ]);

  return { skillsWithNoEvidence, projectsWithNoArchitecture, resumeBulletsWithNoEvidence };
}
