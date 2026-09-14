export type AnsweredQuestion = {
  category: string | null;
  hadDifficulty: boolean; // selfRating === 'HARD' or wentPoorly was recorded
};

export type TopicCount = { category: string; count: number };

/** How often each question category has come up across all recorded answers. */
export function computeTopicFrequency(answers: AnsweredQuestion[]): TopicCount[] {
  const counts = new Map<string, number>();
  for (const a of answers) {
    const key = a.category ?? 'Uncategorized';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Categories where you've specifically struggled — only counts answers you
 * self-rated HARD or explicitly noted "went poorly". Never infers difficulty
 * from anything else.
 */
export function computeWeakTopics(answers: AnsweredQuestion[]): TopicCount[] {
  const difficultOnly = answers.filter((a) => a.hadDifficulty);
  return computeTopicFrequency(difficultOnly);
}

export type FeedbackOutcomeSummary = { outcome: string; count: number }[];

export function summarizeOutcomes(outcomes: (string | null)[]): FeedbackOutcomeSummary {
  const counts = new Map<string, number>();
  for (const o of outcomes) {
    if (!o) continue;
    counts.set(o, (counts.get(o) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([outcome, count]) => ({ outcome, count }))
    .sort((a, b) => b.count - a.count);
}
