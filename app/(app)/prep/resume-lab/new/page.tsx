'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createResume } from '@/lib/actions/resumes';
import { PageHeader } from '@/components/shared/page-header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function NewResumePage() {
  const [state, formAction, pending] = useActionState(createResume, undefined);

  return (
    <div className="mx-auto max-w-md">
      <Link href="/prep/resume-lab" className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Resume Lab
      </Link>
      <PageHeader title="New Resume" description="Creates the resume with an initial 'v1' version." />

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="e.g. Backend-focused resume" required />
        </div>

        {state?.error && (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}

        <div className="mt-2 flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? 'Creating…' : 'Create Resume'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/prep/resume-lab">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
