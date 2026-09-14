import { describe, it, expect } from 'vitest';
import { resolveReadinessState } from './readiness';

describe('resolveReadinessState', () => {
  it('returns NOT_ENOUGH_DATA for zero signals with no open improvement', () => {
    expect(resolveReadinessState(0, false)).toBe('NOT_ENOUGH_DATA');
  });

  it('returns NEEDS_EVIDENCE for exactly one signal', () => {
    expect(resolveReadinessState(1, false)).toBe('NEEDS_EVIDENCE');
  });

  it('returns DEVELOPING for two or three signals', () => {
    expect(resolveReadinessState(2, false)).toBe('DEVELOPING');
    expect(resolveReadinessState(3, false)).toBe('DEVELOPING');
  });

  it('returns STRONG for four or more signals', () => {
    expect(resolveReadinessState(4, false)).toBe('STRONG');
    expect(resolveReadinessState(10, false)).toBe('STRONG');
  });

  it('forces NEEDS_IMPROVEMENT whenever there is an open improvement, regardless of signal count', () => {
    expect(resolveReadinessState(10, true)).toBe('NEEDS_IMPROVEMENT');
    expect(resolveReadinessState(0, true)).toBe('NEEDS_IMPROVEMENT');
  });
});
