import { z } from 'zod';

export const storySchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  situation: z.string().min(1, 'Situation is required').max(3000),
  task: z.string().min(1, 'Task is required').max(3000),
  action: z.string().min(1, 'Action is required').max(3000),
  result: z.string().min(1, 'Result is required').max(3000),
  category: z.enum([
    'LEADERSHIP',
    'CONFLICT',
    'FAILURE',
    'ARCHITECTURE',
    'PERFORMANCE',
    'INCIDENT',
    'MENTORING',
    'OWNERSHIP',
    'AMBIGUITY',
    'TECHNICAL_DECISION',
    'MIGRATION',
    'PRODUCTION_OUTAGE',
  ]),
  company: z.string().max(150).optional(),
  notes: z.string().max(2000).optional(),
  experienceId: z.string().optional(),
});
export type StoryInput = z.infer<typeof storySchema>;
