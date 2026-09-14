import { z } from 'zod';

export const improvementSchema = z.object({
  skillId: z.string().optional(),
  weakness: z.string().min(1, 'Describe the weakness or gap').max(2000),
  evidenceGap: z.string().max(2000).optional(),
  strategy: z.string().min(1, 'Describe the improvement strategy').max(2000),
  status: z.enum(['IDENTIFIED', 'IN_PROGRESS', 'EVIDENCE_ADDED', 'REVIEWED']).default('IDENTIFIED'),
  linkedProjectId: z.string().optional(),
});

export type ImprovementInput = z.infer<typeof improvementSchema>;
