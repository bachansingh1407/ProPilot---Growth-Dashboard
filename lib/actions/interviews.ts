'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import {
  interviewSchema,
  interviewQuestionSchema,
  interviewAnswerSchema,
  interviewFeedbackSchema,
} from '@/lib/validation/interviews';
import { logActivity } from './activity';

export async function createInterview(_prevState: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = interviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input.' };

  const interview = await prisma.interview.create({
    data: {
      userId: user.id,
      applicationId: parsed.data.applicationId || undefined,
      round: parsed.data.round,
      type: parsed.data.type,
      scheduledAt: parsed.data.scheduledAt,
      durationMinutes: parsed.data.durationMinutes,
      notes: parsed.data.notes || undefined,
    },
  });

  await logActivity({
    userId: user.id,
    type: 'CREATED',
    entityType: 'Interview',
    entityId: interview.id,
    summary: `Logged interview round "${interview.round}"`,
  });

  revalidatePath('/prep/interviews');
  redirect(`/prep/interviews/${interview.id}`);
}

export async function createInterviewQuestion(_prevState: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = interviewQuestionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input.' };

  const skillIds = formData.getAll('skillIds') as string[];
  const projectIds = formData.getAll('projectIds') as string[];

  const question = await prisma.interviewQuestion.create({
    data: {
      text: parsed.data.text,
      category: parsed.data.category || undefined,
      difficulty: parsed.data.difficulty,
      source: parsed.data.source || undefined,
      skills: skillIds.length ? { create: skillIds.map((skillId) => ({ skillId })) } : undefined,
      projects: projectIds.length ? { create: projectIds.map((projectId) => ({ projectId })) } : undefined,
    },
  });

  await logActivity({
    userId: user.id,
    type: 'CREATED',
    entityType: 'InterviewQuestion',
    entityId: question.id,
    summary: `Added question to the bank: "${question.text.slice(0, 60)}"`,
  });

  revalidatePath('/prep/interview-questions');
  redirect('/prep/interview-questions');
}

async function assertOwnsInterview(userId: string, interviewId: string) {
  const interview = await prisma.interview.findFirst({ where: { id: interviewId, userId } });
  if (!interview) throw new Error('Interview not found or not owned by this user.');
  return interview;
}

export async function addInterviewAnswer(_prevState: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = interviewAnswerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input.' };

  const interview = await assertOwnsInterview(user.id, parsed.data.interviewId);

  let questionId = parsed.data.questionId;
  if (!questionId && parsed.data.newQuestionText) {
    const question = await prisma.interviewQuestion.create({
      data: { text: parsed.data.newQuestionText, category: parsed.data.newQuestionCategory || undefined },
    });
    questionId = question.id;
  }
  if (!questionId) return { error: 'Pick an existing question or type a new one.' };

  await prisma.interviewAnswer.create({
    data: {
      interviewId: interview.id,
      questionId,
      myAnswer: parsed.data.myAnswer,
      selfRating: parsed.data.selfRating,
      wentWell: parsed.data.wentWell || undefined,
      wentPoorly: parsed.data.wentPoorly || undefined,
    },
  });

  await logActivity({
    userId: user.id,
    type: 'CREATED',
    entityType: 'InterviewAnswer',
    entityId: interview.id,
    summary: `Recorded an answer for interview "${interview.round}"`,
  });

  revalidatePath(`/prep/interviews/${interview.id}`);
  return {};
}

export async function createInterviewFeedback(_prevState: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = interviewFeedbackSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input.' };

  const interview = await assertOwnsInterview(user.id, parsed.data.interviewId);

  await prisma.interviewFeedback.create({
    data: {
      interviewId: interview.id,
      strengths: parsed.data.strengths || undefined,
      weaknesses: parsed.data.weaknesses || undefined,
      outcome: parsed.data.outcome || undefined,
      notes: parsed.data.notes || undefined,
    },
  });

  await logActivity({
    userId: user.id,
    type: 'CREATED',
    entityType: 'InterviewFeedback',
    entityId: interview.id,
    summary: `Recorded feedback for interview "${interview.round}"`,
  });

  revalidatePath(`/prep/interviews/${interview.id}`);
  return {};
}
