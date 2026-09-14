import { describe, it, expect } from 'vitest';
import {
  extractKeywords,
  computeKeywordAlignment,
  computeSkillsAlignment,
  findWeakBullets,
  findEvidenceGaps,
} from './ats';

describe('extractKeywords', () => {
  it('lowercases, strips stopwords, and dedupes', () => {
    const result = extractKeywords('The Redis and the PostgreSQL and Redis');
    expect(result).toContain('redis');
    expect(result).toContain('postgresql');
    expect(result).not.toContain('the');
    expect(result.filter((k) => k === 'redis')).toHaveLength(1);
  });
});

describe('computeKeywordAlignment', () => {
  it('correctly splits matched vs missing keywords', () => {
    const result = computeKeywordAlignment('Requires Kubernetes and PostgreSQL experience', 'Built services with PostgreSQL');
    expect(result.matched).toContain('postgresql');
    expect(result.missing).toContain('kubernetes');
  });
});

describe('computeSkillsAlignment', () => {
  it('is case-insensitive and reports both matched and missing', () => {
    const result = computeSkillsAlignment(['Redis', 'Kafka'], ['redis', 'PostgreSQL']);
    expect(result.matched).toEqual(['Redis']);
    expect(result.missing).toEqual(['Kafka']);
  });
});

describe('findWeakBullets', () => {
  it('flags a bullet with no number, short length, weak opener, and no evidence', () => {
    const result = findWeakBullets([{ id: '1', text: 'Responsible for stuff', hasEvidence: false }]);
    expect(result).toHaveLength(1);
    const [first] = result;
    expect(first?.reasons).toContain('No quantified metric (no number found)');
    expect(first?.reasons).toContain('Opens with a passive/weak verb');
    expect(first?.reasons).toContain('Not linked to any evidence');
  });

  it('does not flag a strong, quantified, evidenced bullet', () => {
    const result = findWeakBullets([
      { id: '1', text: 'Reduced P95 checkout latency by 40% by introducing a Redis cache layer', hasEvidence: true },
    ]);
    expect(result).toHaveLength(0);
  });
});

describe('findEvidenceGaps', () => {
  it('returns only bullet ids lacking evidence', () => {
    const result = findEvidenceGaps([
      { id: 'a', text: 'x', hasEvidence: true },
      { id: 'b', text: 'y', hasEvidence: false },
    ]);
    expect(result).toEqual(['b']);
  });
});
