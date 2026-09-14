import { z } from 'zod';

export const interviewSchema = z.object({
  applicationId: z.string().optional(),
  round: z.string().min(1, 'Round is required').max(150),
  type: z.enum(['PHONE_SCREEN', 'TECHNICAL', 'SYSTEM_DESIGN', 'BEHAVIORAL', 'ONSITE_LOOP', 'TAKE_HOME', 'OTHER']),
  scheduledAt: z.coerce.date().optional(),
  durationMinutes: z.coerce.number().int().positive().optional(),
  notes: z.string().max(3000).optional(),
});
export type InterviewInput = z.infer<typeof interviewSchema>;

export const interviewQuestionSchema = z.object({
  text: z.string().min(1, 'Question text is required').max(2000),
  category: z.string().max(100).optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  source: z.string().max(150).optional(),
});
export type InterviewQuestionInput = z.infer<typeof interviewQuestionSchema>;

export const interviewAnswerSchema = z.object({
  interviewId: z.string().min(1),
  // Either pick an existing question from the bank, or type a new one inline —
  // exactly one of these must be present (enforced below).
  questionId: z.string().optional(),
  newQuestionText: z.string().max(2000).optional(),
  newQuestionCategory: z.string().max(100).optional(),
  myAnswer: z.string().min(1, 'Your answer is required').max(4000),
  selfRating: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  wentWell: z.string().max(2000).optional(),
  wentPoorly: z.string().max(2000).optional(),
}).refine((data) => !!data.questionId || !!data.newQuestionText, {
  message: 'Pick an existing question or type a new one.',
  path: ['questionId'],
});
export type InterviewAnswerInput = z.infer<typeof interviewAnswerSchema>;

export const interviewFeedbackSchema = z.object({
  interviewId: z.string().min(1),
  strengths: z.string().max(2000).optional(),
  weaknesses: z.string().max(2000).optional(),
  outcome: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
});
export type InterviewFeedbackInput = z.infer<typeof interviewFeedbackSchema>;
