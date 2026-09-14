import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { Badge } from '@/components/ui/badge';
import { AddAnswerDialog } from '@/components/data-display/add-answer-dialog';
import { AddFeedbackDialog } from '@/components/data-display/add-feedback-dialog';

const SELF_RATING_LABEL: Record<string, string> = { EASY: 'Went well', MEDIUM: 'Okay', HARD: 'Struggled' };
const SELF_RATING_VARIANT: Record<string, 'strong' | 'default' | 'gap'> = { EASY: 'strong', MEDIUM: 'default', HARD: 'gap' };

export default async function InterviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const interview = await prisma.interview.findFirst({
    where: { id: id, userId: user.id },
    include: {
      application: { include: { role: { include: { company: true } } } },
      answers: { include: { question: true }, orderBy: { createdAt: 'asc' } },
      feedback: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!interview) notFound();

  const questionBank = await prisma.interviewQuestion.findMany({
    select: { id: true, text: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/prep/interviews" className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Interviews
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">{interview.round}</h1>
        <Badge variant="outline">{interview.type.replace(/_/g, ' ')}</Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {interview.application && `${interview.application.role.title} at ${interview.application.role.company.name} · `}
        {interview.scheduledAt && new Date(interview.scheduledAt).toLocaleDateString()}
      </p>
      {interview.notes && <p className="mt-3 text-sm text-muted-foreground">{interview.notes}</p>}

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Questions &amp; Answers</h2>
          <AddAnswerDialog interviewId={interview.id} questions={questionBank} />
        </div>
        {interview.answers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No questions recorded yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {interview.answers.map((answer) => (
              <div key={answer.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{answer.question.text}</p>
                  {answer.selfRating && (
                    <Badge variant={SELF_RATING_VARIANT[answer.selfRating]}>{SELF_RATING_LABEL[answer.selfRating]}</Badge>
                  )}
                </div>
                {answer.question.category && <p className="mt-1 text-xs text-muted-foreground">{answer.question.category}</p>}
                <p className="mt-2 text-sm text-muted-foreground">{answer.myAnswer}</p>
                {answer.wentPoorly && (
                  <p className="mt-2 text-sm">
                    <span className="font-medium">What went poorly: </span>
                    <span className="text-muted-foreground">{answer.wentPoorly}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Feedback</h2>
          <AddFeedbackDialog interviewId={interview.id} />
        </div>
        {interview.feedback.length === 0 ? (
          <p className="text-sm text-muted-foreground">No feedback recorded yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {interview.feedback.map((fb) => (
              <div key={fb.id} className="rounded-lg border border-border p-4">
                {fb.outcome && <Badge variant="outline">{fb.outcome}</Badge>}
                {fb.strengths && (
                  <p className="mt-2 text-sm">
                    <span className="font-medium">Strengths: </span>
                    <span className="text-muted-foreground">{fb.strengths}</span>
                  </p>
                )}
                {fb.weaknesses && (
                  <p className="mt-2 text-sm">
                    <span className="font-medium">Weaknesses: </span>
                    <span className="text-muted-foreground">{fb.weaknesses}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
