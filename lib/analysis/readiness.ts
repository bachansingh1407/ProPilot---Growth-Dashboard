export type ReadinessState = 'STRONG' | 'DEVELOPING' | 'NEEDS_EVIDENCE' | 'NEEDS_IMPROVEMENT' | 'NOT_ENOUGH_DATA';

/**
 * Resolves a readiness category's state from a real signal count (skills,
 * architecture records, stories, etc. that match the category) — never a
 * hand-picked score.
 *
 * An open Improvement targeting this category always wins and forces
 * NEEDS_IMPROVEMENT, because the user has explicitly told the system "this
 * is a known weakness" — that self-assessment should never be silently
 * overridden by an evidence count looking healthy.
 */
export function resolveReadinessState(signalCount: number, hasOpenImprovement: boolean): ReadinessState {
  if (hasOpenImprovement) return 'NEEDS_IMPROVEMENT';
  if (signalCount === 0) return 'NOT_ENOUGH_DATA';
  if (signalCount === 1) return 'NEEDS_EVIDENCE';
  if (signalCount <= 3) return 'DEVELOPING';
  return 'STRONG';
}

export const READINESS_STATE_LABEL: Record<ReadinessState, string> = {
  STRONG: 'Strong',
  DEVELOPING: 'Developing',
  NEEDS_EVIDENCE: 'Needs Evidence',
  NEEDS_IMPROVEMENT: 'Needs Improvement',
  NOT_ENOUGH_DATA: 'Not Enough Data',
};

export const READINESS_BADGE_VARIANT: Record<ReadinessState, 'strong' | 'developing' | 'weak' | 'gap' | 'unknown'> = {
  STRONG: 'strong',
  DEVELOPING: 'developing',
  NEEDS_EVIDENCE: 'weak',
  NEEDS_IMPROVEMENT: 'gap',
  NOT_ENOUGH_DATA: 'unknown',
};

export type ReadinessCategoryDef = {
  key: string;
  label: string;
  skillKeywords?: string[];
  architectureCategories?: string[];
  storyCategories?: string[];
  useDocsSignal?: boolean; // Technical Documentation: counts ADRs + notes directly
};

/**
 * Categories from Section 28. Each maps to keywords/enum values used to find
 * real matching evidence — free-text `Skill.category`/`.name` matching is a
 * simple case-insensitive substring check, done in the page that queries the DB.
 */
export const READINESS_CATEGORIES: ReadinessCategoryDef[] = [
  { key: 'TECHNICAL_DEPTH', label: 'Technical Depth', skillKeywords: ['backend', 'algorithm', 'programming', 'language'] },
  { key: 'SYSTEM_DESIGN', label: 'System Design', architectureCategories: ['SYSTEM_DESIGN'] },
  { key: 'ARCHITECTURE', label: 'Architecture', architectureCategories: ['MICROSERVICES', 'MONOLITH', 'API_GATEWAY'] },
  { key: 'DISTRIBUTED_SYSTEMS', label: 'Distributed Systems', architectureCategories: ['DISTRIBUTED_SYSTEMS', 'EVENT_DRIVEN', 'QUEUES'] },
  { key: 'PRODUCTION_EXPERIENCE', label: 'Production Experience', storyCategories: ['PRODUCTION_OUTAGE', 'INCIDENT'] },
  { key: 'CLOUD', label: 'Cloud', skillKeywords: ['cloud', 'aws', 'gcp', 'azure'], architectureCategories: ['CLOUD_ARCHITECTURE'] },
  { key: 'DEBUGGING', label: 'Debugging', storyCategories: ['INCIDENT', 'PRODUCTION_OUTAGE'] },
  { key: 'PERFORMANCE', label: 'Performance', skillKeywords: ['performance'] },
  { key: 'SECURITY', label: 'Security', skillKeywords: ['security'] },
  { key: 'TESTING', label: 'Testing', skillKeywords: ['test'] },
  { key: 'OBSERVABILITY', label: 'Observability', skillKeywords: ['observability', 'monitoring', 'logging'] },
  { key: 'LEADERSHIP', label: 'Leadership', storyCategories: ['LEADERSHIP', 'MENTORING'] },
  { key: 'COMMUNICATION', label: 'Communication', storyCategories: ['CONFLICT', 'AMBIGUITY'] },
  { key: 'OWNERSHIP', label: 'Ownership', storyCategories: ['OWNERSHIP'] },
  { key: 'TECHNICAL_DOCUMENTATION', label: 'Technical Documentation', useDocsSignal: true },
];
