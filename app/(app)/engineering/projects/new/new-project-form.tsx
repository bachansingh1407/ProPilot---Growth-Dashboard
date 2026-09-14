'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createProject } from '@/lib/actions/projects';
import { PageHeader } from '@/components/shared/page-header';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export function NewProjectForm({ skills }: { skills: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createProject, undefined);

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/engineering/projects" className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Projects
      </Link>
      <PageHeader
        title="Add Project"
        description="Start with the basics. You'll add architecture, ADRs, metrics, and achievements from the project page."
      />

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="githubUrl">GitHub URL</Label>
            <Input id="githubUrl" name="githubUrl" type="url" placeholder="https://github.com/…" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="liveUrl">Live URL</Label>
            <Input id="liveUrl" name="liveUrl" type="url" placeholder="https://…" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="technologies">Technologies (comma-separated)</Label>
          <Input id="technologies" name="technologies" placeholder="PostgreSQL, Next.js, Redis" />
        </div>

        {skills.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <Label>Related skills</Label>
            <div className="flex flex-wrap gap-3 rounded-md border border-border p-3">
              {skills.map((skill) => (
                <label key={skill.id} className="flex items-center gap-1.5 text-sm">
                  <input type="checkbox" name="skillIds" value={skill.id} className="h-3.5 w-3.5" />
                  {skill.name}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="problem">Problem it solves</Label>
          <Textarea id="problem" name="problem" rows={3} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="requirements">Requirements</Label>
          <Textarea id="requirements" name="requirements" rows={3} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="implementation">Implementation notes</Label>
          <Textarea id="implementation" name="implementation" rows={3} />
        </div>

        {state?.error && (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}

        <div className="mt-2 flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving…' : 'Add Project'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/engineering/projects">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
