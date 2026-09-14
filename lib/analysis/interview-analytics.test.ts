import { describe, it, expect } from 'vitest';
import { computeTopicFrequency, computeWeakTopics, summarizeOutcomes } from './interview-analytics';

describe('computeTopicFrequency', () => {
  it('counts occurrences per category, falling back to Uncategorized', () => {
    const result = computeTopicFrequency([
      { category: 'System Design', hadDifficulty: false },
      { category: 'System Design', hadDifficulty: false },
      { category: null, hadDifficulty: false },
    ]);
    expect(result).toEqual([
      { category: 'System Design', count: 2 },
      { category: 'Uncategorized', count: 1 },
    ]);
  });
});

describe('computeWeakTopics', () => {
  it('only counts answers explicitly flagged as difficult', () => {
    const result = computeWeakTopics([
      { category: 'Distributed Systems', hadDifficulty: true },
      { category: 'Distributed Systems', hadDifficulty: false },
      { category: 'Behavioral', hadDifficulty: true },
    ]);
    expect(result).toEqual([
      { category: 'Distributed Systems', count: 1 },
      { category: 'Behavioral', count: 1 },
    ]);
  });

  it('returns an empty array when nothing was flagged difficult', () => {
    expect(computeWeakTopics([{ category: 'Caching', hadDifficulty: false }])).toEqual([]);
  });
});

describe('summarizeOutcomes', () => {
  it('ignores null outcomes and counts the rest', () => {
    const result = summarizeOutcomes(['Passed', 'Passed', null, 'Did not pass']);
    expect(result).toEqual([
      { outcome: 'Passed', count: 2 },
      { outcome: 'Did not pass', count: 1 },
    ]);
  });
});
