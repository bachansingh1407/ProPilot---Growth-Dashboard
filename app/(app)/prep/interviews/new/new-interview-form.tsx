'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createInterview } from '@/lib/actions/interviews';
import { PageHeader } from '@/components/shared/page-header';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const TYPES = ['PHONE_SCREEN', 'TECHNICAL', 'SYSTEM_DESIGN', 'BEHAVIORAL', 'ONSITE_LOOP', 'TAKE_HOME', 'OTHER'] as const;

export function NewInterviewForm({ applications }: { applications: { id: string; label: string }[] }) {
  const [state, formAction, pending] = useActionState(createInterview, undefined);

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/prep/interviews" className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Interviews
      </Link>
      <PageHeader title="Log Interview" />

      <form action={formAction} className="flex flex-col gap-4">
        {applications.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <Label>Application (optional)</Label>
            <Select name="applicationId">
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                {applications.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="round">Round</Label>
          <Input id="round" name="round" placeholder="e.g. Onsite — System Design" required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Type</Label>
            <Select name="type" defaultValue="TECHNICAL">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="durationMinutes">Duration (minutes)</Label>
            <Input id="durationMinutes" name="durationMinutes" type="number" min="1" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="scheduledAt">Date</Label>
          <Input id="scheduledAt" name="scheduledAt" type="date" />
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
            {pending ? 'Saving…' : 'Log Interview'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/prep/interviews">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
