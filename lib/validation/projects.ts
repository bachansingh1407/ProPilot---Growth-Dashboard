import { z } from 'zod';

export const projectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(150),
  description: z.string().max(2000).optional(),
  githubUrl: z.string().url().optional().or(z.literal('')),
  liveUrl: z.string().url().optional().or(z.literal('')),
  technologies: z.string().optional(), // comma-separated in the form, split server-side
  problem: z.string().max(4000).optional(),
  requirements: z.string().max(4000).optional(),
  implementation: z.string().max(4000).optional(),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export const architectureSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1).max(150),
  category: z.enum([
    'SYSTEM_DESIGN',
    'DISTRIBUTED_SYSTEMS',
    'DATABASE_DESIGN',
    'EVENT_DRIVEN',
    'CACHING',
    'QUEUES',
    'API_GATEWAY',
    'MICROSERVICES',
    'MONOLITH',
    'CLOUD_ARCHITECTURE',
    'OTHER',
  ]),
  description: z.string().min(1, 'Description is required').max(4000),
  tradeoffs: z.string().max(4000).optional(),
});

export type ArchitectureInput = z.infer<typeof architectureSchema>;

export const adrSchema = z.object({
  projectId: z.string().min(1),
  identifier: z.string().min(1, 'e.g. ADR-001').max(30),
  title: z.string().min(1).max(150),
  status: z.enum(['PROPOSED', 'ACCEPTED', 'REJECTED', 'DEPRECATED', 'SUPERSEDED']),
  context: z.string().min(1, 'Context is required').max(4000),
  problem: z.string().min(1, 'Problem is required').max(4000),
  decision: z.string().min(1, 'Decision is required').max(4000),
  alternatives: z.string().max(4000).optional(),
  tradeoffs: z.string().max(4000).optional(),
  consequences: z.string().max(4000).optional(),
  notes: z.string().max(4000).optional(),
});

export type ADRInput = z.infer<typeof adrSchema>;

export const metricSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1, 'Name is required').max(100),
  value: z.coerce.number(),
  unit: z.string().min(1, 'Unit is required').max(20),
  date: z.coerce.date().optional(),
  source: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
});

export type MetricInput = z.infer<typeof metricSchema>;
