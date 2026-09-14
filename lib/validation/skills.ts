import { z } from 'zod';

export const skillSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category: z.string().min(1, 'Category is required').max(60),
  yearsOfExperience: z.coerce.number().min(0).max(60).optional().nullable(),
  description: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
  manualLevelOverride: z
    .enum(['STRONG', 'DEVELOPING', 'WEAK', 'NEEDS_EVIDENCE', 'NOT_ENOUGH_DATA'])
    .optional()
    .nullable(),
});

export type SkillInput = z.infer<typeof skillSchema>;

export const skillEvidenceSchema = z
  .object({
    skillId: z.string().min(1),
    projectId: z.string().optional(),
    achievementId: z.string().optional(),
    metricId: z.string().optional(),
    adrId: z.string().optional(),
    noteId: z.string().optional(),
    note_text: z.string().max(500).optional(),
  })
  .refine(
    (data) => [data.projectId, data.achievementId, data.metricId, data.adrId, data.noteId].filter(Boolean).length === 1,
    { message: 'Link evidence to exactly one source.' },
  );

export type SkillEvidenceInput = z.infer<typeof skillEvidenceSchema>;
