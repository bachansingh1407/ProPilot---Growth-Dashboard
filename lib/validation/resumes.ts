import { z } from 'zod';

export const resumeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(150),
});
export type ResumeInput = z.infer<typeof resumeSchema>;

export const resumeVersionSchema = z.object({
  resumeId: z.string().min(1),
  label: z.string().min(1, 'Label is required').max(150),
  targetRoleId: z.string().optional(),
});
export type ResumeVersionInput = z.infer<typeof resumeVersionSchema>;

export const resumeBulletSchema = z.object({
  resumeVersionId: z.string().min(1),
  text: z.string().min(1, 'Bullet text is required').max(500),
  experienceId: z.string().optional(),
  achievementId: z.string().optional(),
});
export type ResumeBulletInput = z.infer<typeof resumeBulletSchema>;

export const resumeEvidenceSchema = z.object({
  bulletId: z.string().min(1),
  projectId: z.string().optional(),
  skillId: z.string().optional(),
  note: z.string().max(500).optional(),
});
export type ResumeEvidenceInput = z.infer<typeof resumeEvidenceSchema>;

export const runAnalysisSchema = z.object({
  resumeVersionId: z.string().min(1),
  roleId: z.string().min(1),
});
export type RunAnalysisInput = z.infer<typeof runAnalysisSchema>;

export const applicationSchema = z.object({
  roleId: z.string().min(1),
  resumeVersionId: z.string().optional(),
  status: z.enum(['RESEARCHING', 'APPLIED', 'PHONE_SCREEN', 'INTERVIEWING', 'OFFER', 'REJECTED', 'WITHDRAWN']).default('RESEARCHING'),
  appliedAt: z.coerce.date().optional(),
  notes: z.string().max(2000).optional(),
});
export type ApplicationInput = z.infer<typeof applicationSchema>;
