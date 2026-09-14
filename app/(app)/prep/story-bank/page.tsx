import Link from 'next/link';
import { BookMarked, Plus } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/data-display/empty-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default async function StoryBankPage() {
  const user = await requireUser();
  const stories = await prisma.story.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <PageHeader
        title="Story Bank"
        description="STAR-format stories, reusable across interviews — connected to real projects, skills, and achievements."
        actions={
          <Button asChild size="sm">
            <Link href="/prep/story-bank/new">
              <Plus className="mr-1.5 h-4 w-4" /> Add Story
            </Link>
          </Button>
        }
      />

      {stories.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title="No stories yet"
          explanation="A good story bank means you're never improvising a behavioral answer — write out Situation, Task, Action, Result once and reuse it."
          actionLabel="Add your first story"
          actionHref="/prep/story-bank/new"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {stories.map((story) => (
            <Link key={story.id} href={`/prep/story-bank/${story.id}`} className="block rounded-lg border border-border p-4 hover:bg-muted/30">
              <div className="flex items-center justify-between">
                <p className="font-medium">{story.title}</p>
                <Badge variant="outline">{story.category.replace(/_/g, ' ')}</Badge>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{story.result}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
