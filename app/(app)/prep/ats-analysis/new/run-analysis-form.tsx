'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { runATSAnalysis } from '@/lib/actions/ats';
import { PageHeader } from '@/components/shared/page-header';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { EmptyState } from '@/components/data-display/empty-state';
import { ScanSearch } from 'lucide-react';

export function RunAnalysisForm({
  versions,
  roles,
  defaultVersionId,
  defaultRoleId,
}: {
  versions: { id: string; label: string }[];
  roles: { id: string; label: string; hasJobDescription: boolean }[];
  defaultVersionId?: string;
  defaultRoleId?: string;
}) {
  const [state, formAction, pending] = useActionState(runATSAnalysis, undefined);

  if (versions.length === 0 || roles.length === 0) {
    return (
      <div className="mx-auto max-w-md">
        <PageHeader title="Run ATS Analysis" />
        <EmptyState
          icon={ScanSearch}
          title="You need a resume version and a role first"
          explanation="Create at least one resume version in Resume Lab and one role (with a job description) in Research → Roles before running an analysis."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <Link href="/prep/ats-analysis" className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to ATS Analysis
      </Link>
      <PageHeader title="Run ATS Analysis" description="Compares real keywords and skills — no external ATS is contacted." />

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Resume version</Label>
          <Select name="resumeVersionId" defaultValue={defaultVersionId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a resume version" />
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
                  {!r.hasJobDescription && ' (no job description stored)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {state?.error && (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={pending} className="mt-2">
          {pending ? 'Analyzing…' : 'Run Analysis'}
        </Button>
      </form>
    </div>
  );
}
