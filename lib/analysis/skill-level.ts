import type { SkillLevel } from '@prisma/client';

export type SkillEvidenceCounts = {
  evidenceCount: number;
  projectCount: number;
  yearsOfExperience: number | null;
};

/**
 * Derives a Skill's state from real signal — never a hand-picked score.
 *
 * Rules (deliberately simple and explainable, not a black-box formula):
 * - No evidence at all AND no years of experience recorded  → NOT_ENOUGH_DATA
 * - No evidence at all but years of experience is recorded  → NEEDS_EVIDENCE
 *   (the user claims experience but hasn't linked anything to prove it)
 * - 1 evidence item                                          → WEAK
 * - 2-3 evidence items, or spread across 2+ projects         → DEVELOPING
 * - 4+ evidence items across 2+ projects                     → STRONG
 *
 * A manual override on the Skill record always wins over this computation —
 * see the `manualLevelOverride` field and how callers should prefer it.
 */
export function computeSkillLevel(counts: SkillEvidenceCounts): SkillLevel {
  const { evidenceCount, projectCount, yearsOfExperience } = counts;

  if (evidenceCount === 0) {
    return yearsOfExperience && yearsOfExperience > 0 ? 'NEEDS_EVIDENCE' : 'NOT_ENOUGH_DATA';
  }
  if (evidenceCount === 1) return 'WEAK';
  if (evidenceCount >= 4 && projectCount >= 2) return 'STRONG';
  return 'DEVELOPING';
}

export function resolveSkillLevel(
  manualOverride: SkillLevel | null,
  counts: SkillEvidenceCounts,
): { level: SkillLevel; isOverridden: boolean } {
  if (manualOverride) return { level: manualOverride, isOverridden: true };
  return { level: computeSkillLevel(counts), isOverridden: false };
}

export const SKILL_LEVEL_LABEL: Record<SkillLevel, string> = {
  STRONG: 'Strong',
  DEVELOPING: 'Developing',
  WEAK: 'Weak',
  NEEDS_EVIDENCE: 'Needs Evidence',
  NOT_ENOUGH_DATA: 'Not Enough Data',
};

export const SKILL_LEVEL_BADGE_VARIANT: Record<SkillLevel, 'strong' | 'developing' | 'weak' | 'gap' | 'unknown'> = {
  STRONG: 'strong',
  DEVELOPING: 'developing',
  WEAK: 'weak',
  NEEDS_EVIDENCE: 'gap',
  NOT_ENOUGH_DATA: 'unknown',
};
