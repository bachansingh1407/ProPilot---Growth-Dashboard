'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createStory } from '@/lib/actions/stories';
import { PageHeader } from '@/components/shared/page-header';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const CATEGORIES = [
  'LEADERSHIP', 'CONFLICT', 'FAILURE', 'ARCHITECTURE', 'PERFORMANCE', 'INCIDENT',
  'MENTORING', 'OWNERSHIP', 'AMBIGUITY', 'TECHNICAL_DECISION', 'MIGRATION', 'PRODUCTION_OUTAGE',
] as const;

export function NewStoryForm({
  experiences,
  projects,
  skills,
  achievements,
}: {
  experiences: { id: string; company: string; title: string }[];
  projects: { id: string; name: string }[];
  skills: { id: string; name: string }[];
  achievements: { id: string; title: string }[];
}) {
  const [state, formAction, pending] = useActionState(createStory, undefined);

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/prep/story-bank" className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Story Bank
      </Link>
      <PageHeader title="Add Story" description="Situation, Task, Action, Result." />

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Category</Label>
          <Select name="category" defaultValue="TECHNICAL_DECISION">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="situation">Situation</Label>
          <Textarea id="situation" name="situation" rows={3} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="task">Task</Label>
          <Textarea id="task" name="task" rows={2} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="action">Action</Label>
          <Textarea id="action" name="action" rows={4} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="result">Result</Label>
          <Textarea id="result" name="result" rows={3} required />
        </div>

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

        {skills.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <Label>Related skills</Label>
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

        {achievements.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <Label>Related achievements</Label>
            <div className="flex flex-wrap gap-3 rounded-md border border-border p-3">
              {achievements.map((a) => (
                <label key={a.id} className="flex items-center gap-1.5 text-sm">
                  <input type="checkbox" name="achievementIds" value={a.id} className="h-3.5 w-3.5" />
                  {a.title}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" rows={2} />
        </div>

        {state?.error && (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}

        <div className="mt-2 flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving…' : 'Add Story'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/prep/story-bank">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
