'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createInterviewQuestion } from '@/lib/actions/interviews';
import { PageHeader } from '@/components/shared/page-header';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export function NewQuestionForm({
  skills,
  projects,
}: {
  skills: { id: string; name: string }[];
  projects: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createInterviewQuestion, undefined);

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/prep/interview-questions" className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Questions
      </Link>
      <PageHeader title="Add Question" />

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="text">Question</Label>
          <Textarea id="text" name="text" rows={3} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" placeholder="e.g. System Design" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Difficulty</Label>
            <Select name="difficulty">
              <SelectTrigger>
                <SelectValue placeholder="Optional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="source">Source</Label>
          <Input id="source" name="source" placeholder="e.g. Glassdoor, past interview, self-authored" />
        </div>

        {skills.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <Label>Tests these skills</Label>
            <div className="flex flex-wrap gap-3 rounded-md border border-border p-3">
              {skills.map((s) => (
                <label key={s.id} className="flex items-center gap-1.5 text-sm">
                  <input type="checkbox" name="skillIds" value={s.id} className="h-3.5 w-3.5" />
                  {s.name}
                </label>
              ))}
            </div>
          </div>
        )}

        {projects.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <Label>Related projects</Label>
            <div className="flex flex-wrap gap-3 rounded-md border border-border p-3">
              {projects.map((p) => (
                <label key={p.id} className="flex items-center gap-1.5 text-sm">
                  <input type="checkbox" name="projectIds" value={p.id} className="h-3.5 w-3.5" />
                  {p.name}
                </label>
              ))}
            </div>
          </div>
        )}

        {state?.error && (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}

        <div className="mt-2 flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving…' : 'Add Question'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/prep/interview-questions">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
