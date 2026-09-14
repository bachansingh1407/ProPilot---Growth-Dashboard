import Link from 'next/link';
import { MessagesSquare, Plus } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/data-display/empty-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { computeTopicFrequency, computeWeakTopics, summarizeOutcomes } from '@/lib/analysis/interview-analytics';

export default async function InterviewsPage() {
  const user = await requireUser();

  const [interviews, answers, feedback] = await Promise.all([
    prisma.interview.findMany({
      where: { userId: user.id },
      include: { application: { include: { role: { include: { company: true } } } } },
      orderBy: { scheduledAt: 'desc' },
    }),
    prisma.interviewAnswer.findMany({
      where: { interview: { userId: user.id } },
      include: { question: { select: { category: true } } },
    }),
    prisma.interviewFeedback.findMany({ where: { interview: { userId: user.id } }, select: { outcome: true } }),
  ]);

  const answeredForAnalysis = answers.map((a) => ({
    category: a.question.category,
    hadDifficulty: a.selfRating === 'HARD' || !!a.wentPoorly,
  }));
  const topicFrequency = computeTopicFrequency(answeredForAnalysis);
  const weakTopics = computeWeakTopics(answeredForAnalysis);
  const outcomes = summarizeOutcomes(feedback.map((f) => f.outcome));

  return (
    <div>
      <PageHeader
        title="Interviews"
        description="Interview → Question → Answer → Feedback → Weakness → Skill → Improvement."
        actions={
          <Button asChild size="sm">
            <Link href="/prep/interviews/new">
              <Plus className="mr-1.5 h-4 w-4" /> Log Interview
            </Link>
          </Button>
        }
      />

      {interviews.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title="No interviews logged yet"
          explanation="Log a round, then record each question and answer as it happens — that's what powers the analytics below."
          actionLabel="Log your first interview"
          actionHref="/prep/interviews/new"
        />
      ) : (
        <>
          {answers.length > 0 && (
            <div className="mb-8 grid gap-4 md:grid-cols-3">
              <AnalyticsCard title="Most-tested topics" items={topicFrequency} emptyLabel="Not enough data" />
              <AnalyticsCard title="Topics you've struggled with" items={weakTopics} emptyLabel="None flagged yet" variant="gap" />
              <AnalyticsCard
                title="Outcomes"
                items={outcomes.map((o) => ({ category: o.outcome, count: o.count }))}
                emptyLabel="No feedback recorded yet"
              />
            </div>
          )}

          <div className="flex flex-col gap-3">
            {interviews.map((interview) => (
              <Link key={interview.id} href={`/prep/interviews/${interview.id}`} className="block rounded-lg border border-border p-4 hover:bg-muted/30">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{interview.round}</p>
                  <Badge variant="outline">{interview.type.replace(/_/g, ' ')}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {interview.application?.role.title} {interview.application && `at ${interview.application.role.company.name}`}
                  {interview.scheduledAt && ` · ${new Date(interview.scheduledAt).toLocaleDateString()}`}
                </p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function AnalyticsCard({
  title,
  items,
  emptyLabel,
  variant = 'default',
}: {
  title: string;
  items: { category: string; count: number }[];
  emptyLabel: string;
  variant?: 'default' | 'gap';
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="mb-2 text-xs font-medium text-muted-foreground">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {items.slice(0, 5).map((item) => (
            <div key={item.category} className="flex items-center justify-between text-sm">
              <span>{item.category}</span>
              <Badge variant={variant === 'gap' ? 'gap' : 'default'}>{item.count}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
