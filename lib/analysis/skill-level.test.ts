import { describe, it, expect } from 'vitest';
import { computeSkillLevel, resolveSkillLevel } from './skill-level';

describe('computeSkillLevel', () => {
  it('returns NOT_ENOUGH_DATA when there is no evidence and no claimed experience', () => {
    expect(computeSkillLevel({ evidenceCount: 0, projectCount: 0, yearsOfExperience: null })).toBe(
      'NOT_ENOUGH_DATA',
    );
  });

  it('returns NEEDS_EVIDENCE when experience is claimed but nothing backs it', () => {
    expect(computeSkillLevel({ evidenceCount: 0, projectCount: 0, yearsOfExperience: 3 })).toBe(
      'NEEDS_EVIDENCE',
    );
  });

  it('returns WEAK for exactly one piece of evidence', () => {
    expect(computeSkillLevel({ evidenceCount: 1, projectCount: 1, yearsOfExperience: 1 })).toBe('WEAK');
  });

  it('returns DEVELOPING for a handful of evidence in a single project', () => {
    expect(computeSkillLevel({ evidenceCount: 3, projectCount: 1, yearsOfExperience: 2 })).toBe('DEVELOPING');
  });

  it('returns STRONG only when evidence is both plentiful and spread across projects', () => {
    expect(computeSkillLevel({ evidenceCount: 5, projectCount: 2, yearsOfExperience: 4 })).toBe('STRONG');
  });

  it('does not return STRONG for plentiful evidence confined to one project', () => {
    expect(computeSkillLevel({ evidenceCount: 6, projectCount: 1, yearsOfExperience: 4 })).toBe('DEVELOPING');
  });
});

describe('resolveSkillLevel', () => {
  it('prefers a manual override over the computed level', () => {
    const result = resolveSkillLevel('STRONG', { evidenceCount: 0, projectCount: 0, yearsOfExperience: null });
    expect(result).toEqual({ level: 'STRONG', isOverridden: true });
  });

  it('falls back to the computed level when there is no override', () => {
    const result = resolveSkillLevel(null, { evidenceCount: 1, projectCount: 1, yearsOfExperience: 1 });
    expect(result).toEqual({ level: 'WEAK', isOverridden: false });
  });
});
