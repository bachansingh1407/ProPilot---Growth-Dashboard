import { z } from 'zod';

export const profileSchema = z.object({
  fullName: z.string().min(1, 'Name is required').max(150),
  headline: z.string().max(150).optional(),
  currentTitle: z.string().max(150).optional(),
  yearsOfExperience: z.coerce.number().min(0).max(60).optional(),
  primaryFocus: z.string().max(150).optional(),
  location: z.string().max(150).optional(),
  bio: z.string().max(3000).optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  websiteUrl: z.string().url().optional().or(z.literal('')),
});
export type ProfileInput = z.infer<typeof profileSchema>;

const SLUG_PATTERN = /^[a-z0-9-]+$/;

export const portfolioVisibilitySchema = z.object({
  isPortfolioPublished: z.coerce.boolean(),
  portfolioSlug: z
    .string()
    .min(3, 'At least 3 characters')
    .max(60)
    .regex(SLUG_PATTERN, 'Lowercase letters, numbers, and hyphens only')
    .optional()
    .or(z.literal('')),
});
export type PortfolioVisibilityInput = z.infer<typeof portfolioVisibilitySchema>;
