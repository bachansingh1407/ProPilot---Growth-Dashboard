import { z } from 'zod';

export const achievementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  context: z.string().min(1, 'Context is required').max(3000),
  problem: z.string().max(3000).optional(),
  action: z.string().min(1, 'Action is required').max(3000),
  technicalComplexity: z.string().max(2000).optional(),
  impact: z.string().min(1, 'Impact is required').max(2000),
  date: z.coerce.date().optional(),
  technologies: z.string().optional(), // comma-separated
  projectId: z.string().optional(),
  experienceId: z.string().optional(),
});

export type AchievementInput = z.infer<typeof achievementSchema>;

export const experienceSchema = z.object({
  company: z.string().min(1, 'Company is required').max(150),
  title: z.string().min(1, 'Title is required').max(150),
  location: z.string().max(150).optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP']),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  description: z.string().max(3000).optional(),
  responsibilities: z.string().optional(), // newline-separated
  technologies: z.string().optional(), // comma-separated
});

export type ExperienceInput = z.infer<typeof experienceSchema>;
