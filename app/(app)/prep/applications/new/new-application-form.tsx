'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createApplication } from '@/lib/actions/applications';
import { PageHeader } from '@/components/shared/page-header';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { EmptyState } from '@/components/data-display/empty-state';
import { ClipboardList } from 'lucide-react';

export function NewApplicationForm({
  roles,
  versions,
  defaultRoleId,
}: {
  roles: { id: string; label: string }[];
  versions: { id: string; label: string }[];
  defaultRoleId?: string;
}) {
  const [state, formAction, pending] = useActionState(createApplication, undefined);

  if (roles.length === 0) {
    return (
      <div className="mx-auto max-w-md">
        <PageHeader title="Track Application" />
        <EmptyState
          icon={ClipboardList}
          title="You need a role first"
          explanation="Add the role in Research → Roles, then come back here to track your application to it."
          actionLabel="Add a role"
          actionHref="/research/roles/new"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <Link href="/prep/applications" className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Applications
      </Link>
      <PageHeader title="Track Application" />

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Role</Label>
          <Select name="roleId" defaultValue={defaultRoleId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {versions.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <Label>Resume version used</Label>
            <Select name="resumeVersionId">
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label>Status</Label>
          <Select name="status" defaultValue="APPLIED">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RESEARCHING">Researching</SelectItem>
              <SelectItem value="APPLIED">Applied</SelectItem>
              <SelectItem value="PHONE_SCREEN">Phone Screen</SelectItem>
              <SelectItem value="INTERVIEWING">Interviewing</SelectItem>
              <SelectItem value="OFFER">Offer</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="appliedAt">Applied on</Label>
          <Input id="appliedAt" name="appliedAt" type="date" />
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
            {pending ? 'Saving…' : 'Track Application'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/prep/applications">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
