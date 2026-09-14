const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'of', 'to', 'in', 'on', 'for', 'with', 'as', 'is', 'are',
  'be', 'this', 'that', 'we', 'you', 'our', 'will', 'your', 'at', 'by', 'from', 'it', 'its', 'their',
  'have', 'has', 'not', 'about', 'into', 'across', 'per', 'etc', 'via', 'using', 'who', 'they',
]);

/** Extracts meaningful lowercase tokens (words and simple hyphenated terms), dropping stopwords/short noise. */
export function extractKeywords(text: string): string[] {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9+.#\-\s]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));

  return Array.from(new Set(tokens));
}

export type KeywordAlignment = { matched: string[]; missing: string[] };

/** Compares job-description keywords against resume text — a real set difference, not a guess. */
export function computeKeywordAlignment(jobDescription: string, resumeText: string): KeywordAlignment {
  const jdKeywords = extractKeywords(jobDescription);
  const resumeKeywords = new Set(extractKeywords(resumeText));

  const matched: string[] = [];
  const missing: string[] = [];
  for (const kw of jdKeywords) {
    (resumeKeywords.has(kw) ? matched : missing).push(kw);
  }
  return { matched, missing };
}

export type SkillsAlignment = { matched: string[]; missing: string[] };

export function computeSkillsAlignment(requiredSkillNames: string[], userSkillNames: string[]): SkillsAlignment {
  const userSet = new Set(userSkillNames.map((s) => s.toLowerCase()));
  const matched: string[] = [];
  const missing: string[] = [];
  for (const skill of requiredSkillNames) {
    (userSet.has(skill.toLowerCase()) ? matched : missing).push(skill);
  }
  return { matched, missing };
}

export type BulletForAnalysis = { id: string; text: string; hasEvidence: boolean };

/**
 * "Weak" here means specific, checkable properties — not a vibe:
 * - no digit anywhere (no quantified impact)
 * - fewer than 6 words (too thin to convey context/action/impact)
 * - starts with a weak verb ("responsible for", "helped", "worked on")
 */
const WEAK_OPENERS = ['responsible for', 'helped', 'worked on', 'involved in', 'assisted with'];

export function findWeakBullets(bullets: BulletForAnalysis[]): { id: string; reasons: string[] }[] {
  const results: { id: string; reasons: string[] }[] = [];

  for (const bullet of bullets) {
    const reasons: string[] = [];
    const lower = bullet.text.toLowerCase();
    const wordCount = bullet.text.trim().split(/\s+/).filter(Boolean).length;

    if (!/\d/.test(bullet.text)) reasons.push('No quantified metric (no number found)');
    if (wordCount < 6) reasons.push('Very short — likely missing context or impact');
    if (WEAK_OPENERS.some((opener) => lower.startsWith(opener))) reasons.push('Opens with a passive/weak verb');
    if (!bullet.hasEvidence) reasons.push('Not linked to any evidence');

    if (reasons.length > 0) results.push({ id: bullet.id, reasons });
  }

  return results;
}

export function findEvidenceGaps(bullets: BulletForAnalysis[]): string[] {
  return bullets.filter((b) => !b.hasEvidence).map((b) => b.id);
}
