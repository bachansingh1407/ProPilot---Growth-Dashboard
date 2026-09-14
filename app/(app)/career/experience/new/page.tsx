'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createExperience } from '@/lib/actions/career';
import { PageHeader } from '@/components/shared/page-header';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP'] as const;

export default function NewExperiencePage() {
  const [state, formAction, pending] = useActionState(createExperience, undefined);

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/career/experience" className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Experience
      </Link>
      <PageHeader title="Add Experience" />

      <form action={formAction} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="company">Company</Label>
            <Input id="company" name="company" required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Employment type</Label>
            <Select name="employmentType" defaultValue="FULL_TIME">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="startDate">Start date</Label>
            <Input id="startDate" name="startDate" type="date" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="endDate">End date (leave blank if current)</Label>
            <Input id="endDate" name="endDate" type="date" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={3} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="responsibilities">Responsibilities (one per line)</Label>
          <Textarea id="responsibilities" name="responsibilities" rows={3} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="technologies">Technologies (comma-separated)</Label>
          <Input id="technologies" name="technologies" />
        </div>

        {state?.error && (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}

        <div className="mt-2 flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving…' : 'Add Experience'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/career/experience">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
