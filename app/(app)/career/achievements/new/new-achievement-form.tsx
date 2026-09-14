'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createAchievement } from '@/lib/actions/career';
import { PageHeader } from '@/components/shared/page-header';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export function NewAchievementForm({
  projects,
  experiences,
}: {
  projects: { id: string; name: string }[];
  experiences: { id: string; company: string; title: string }[];
}) {
  const [state, formAction, pending] = useActionState(createAchievement, undefined);

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/career/achievements" className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Achievements
      </Link>
      <PageHeader title="Add Achievement" description="Context, action, and measurable impact — not just a title." />

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="context">Context</Label>
          <Textarea id="context" name="context" rows={2} required placeholder="What was the situation?" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="problem">Problem</Label>
          <Textarea id="problem" name="problem" rows={2} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="action">Action</Label>
          <Textarea id="action" name="action" rows={2} required placeholder="What did you specifically do?" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="technicalComplexity">Technical complexity</Label>
          <Textarea id="technicalComplexity" name="technicalComplexity" rows={2} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="impact">Impact</Label>
          <Textarea id="impact" name="impact" rows={2} required placeholder="Quantify it if you can." />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date">Date</Label>
          <Input id="date" name="date" type="date" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="technologies">Technologies (comma-separated)</Label>
          <Input id="technologies" name="technologies" />
        </div>

        {projects.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <Label>Related project</Label>
            <Select name="projectId">
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {experiences.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <Label>Related experience</Label>
            <Select name="experienceId">
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                {experiences.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.title} · {e.company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {state?.error && (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}

        <div className="mt-2 flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving…' : 'Add Achievement'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/career/achievements">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
