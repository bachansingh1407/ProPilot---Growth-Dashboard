import { z } from 'zod';

export const companySchema = z.object({
  name: z.string().min(1, 'Name is required').max(150),
  website: z.string().url().optional().or(z.literal('')),
  engineeringBlogUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  techStack: z.string().optional(), // comma-separated
  engineeringCulture: z.string().max(3000).optional(),
  interviewProcess: z.string().max(3000).optional(),
  knownInterviewTopics: z.string().optional(), // comma-separated
  notes: z.string().max(3000).optional(),
  pros: z.string().max(2000).optional(),
  concerns: z.string().max(2000).optional(),
  personalFit: z.string().max(2000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
});

export type CompanyInput = z.infer<typeof companySchema>;

export const roleSchema = z.object({
  companyId: z.string().min(1),
  title: z.string().min(1, 'Title is required').max(150),
  jobUrl: z.string().url().optional().or(z.literal('')),
  jobDescription: z.string().max(8000).optional(),
  requirements: z.string().optional(), // newline-separated
  seniority: z.string().max(60).optional(),
  location: z.string().max(150).optional(),
  notes: z.string().max(2000).optional(),
  fit: z.string().max(2000).optional(),
});

export type RoleInput = z.infer<typeof roleSchema>;
