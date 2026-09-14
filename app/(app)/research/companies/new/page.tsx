'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createCompany } from '@/lib/actions/companies';
import { PageHeader } from '@/components/shared/page-header';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function NewCompanyPage() {
  const [state, formAction, pending] = useActionState(createCompany, undefined);

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/research/companies" className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Companies
      </Link>
      <PageHeader title="Add Company" />

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="website">Website</Label>
            <Input id="website" name="website" type="url" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="engineeringBlogUrl">Engineering blog</Label>
            <Input id="engineeringBlogUrl" name="engineeringBlogUrl" type="url" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="githubUrl">GitHub</Label>
          <Input id="githubUrl" name="githubUrl" type="url" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="techStack">Tech stack (comma-separated)</Label>
          <Input id="techStack" name="techStack" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="engineeringCulture">Engineering culture</Label>
          <Textarea id="engineeringCulture" name="engineeringCulture" rows={3} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="interviewProcess">Interview process</Label>
          <Textarea id="interviewProcess" name="interviewProcess" rows={3} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="knownInterviewTopics">Known interview topics (comma-separated)</Label>
          <Input id="knownInterviewTopics" name="knownInterviewTopics" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pros">Pros</Label>
            <Textarea id="pros" name="pros" rows={3} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="concerns">Concerns</Label>
            <Textarea id="concerns" name="concerns" rows={3} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="personalFit">Personal fit</Label>
          <Textarea id="personalFit" name="personalFit" rows={2} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Priority</Label>
          <Select name="priority" defaultValue="MEDIUM">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {state?.error && (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}

        <div className="mt-2 flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving…' : 'Add Company'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/research/companies">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
