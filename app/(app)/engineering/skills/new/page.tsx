'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createSkill } from '@/lib/actions/skills';
import { PageHeader } from '@/components/shared/page-header';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function NewSkillPage() {
  const [state, formAction, pending] = useActionState(createSkill, undefined);

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/engineering/skills" className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Skills
      </Link>
      <PageHeader title="Add Skill" description="You'll link evidence to this skill afterward — projects, metrics, ADRs, notes." />

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="e.g. Redis" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" placeholder="e.g. Databases, Backend, Cloud" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="yearsOfExperience">Years of experience</Label>
          <Input id="yearsOfExperience" name="yearsOfExperience" type="number" step="0.5" min="0" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={3} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" rows={3} />
        </div>

        {state?.error && (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}

        <div className="mt-2 flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving…' : 'Add Skill'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/engineering/skills">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
