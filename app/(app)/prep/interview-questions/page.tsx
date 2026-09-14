import Link from 'next/link';
import { HelpCircle, Plus } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/data-display/empty-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default async function InterviewQuestionsPage() {
  const user = await requireUser();
  // Questions themselves aren't user-scoped (a shared bank), but only show
  // ones actually used or created — in this single-user app that's simply all of them.
  void user;

  const questions = await prisma.interviewQuestion.findMany({
    include: { _count: { select: { answers: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <PageHeader
        title="Interview Questions"
        description="Your growing question bank — link each to the skills and projects it tests."
        actions={
          <Button asChild size="sm">
            <Link href="/prep/interview-questions/new">
              <Plus className="mr-1.5 h-4 w-4" /> Add Question
            </Link>
          </Button>
        }
      />

      {questions.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No questions yet"
          explanation="Add questions here, or record them inline while logging an interview — either way they build your reusable bank."
          actionLabel="Add your first question"
          actionHref="/prep/interview-questions/new"
        />
      ) : (
        <div className="flex flex-col gap-2">
          {questions.map((q) => (
            <div key={q.id} className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm">{q.text}</p>
                {q.difficulty && <Badge variant="outline">{q.difficulty}</Badge>}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {q.category && <Badge variant="outline">{q.category}</Badge>}
                <span>{q._count.answers} time{q._count.answers === 1 ? '' : 's'} answered</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
