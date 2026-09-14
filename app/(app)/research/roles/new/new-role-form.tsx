'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createRole } from '@/lib/actions/companies';
import { PageHeader } from '@/components/shared/page-header';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export function NewRoleForm({
  companies,
  skills,
  defaultCompanyId,
}: {
  companies: { id: string; name: string }[];
  skills: { id: string; name: string }[];
  defaultCompanyId?: string;
}) {
  const [state, formAction, pending] = useActionState(createRole, undefined);

  if (companies.length === 0) {
    return (
      <div className="mx-auto max-w-xl">
        <PageHeader title="Add Role" />
        <p className="text-sm text-muted-foreground">
          You need a company first. <Link href="/research/companies/new" className="underline">Add a company</Link>, then come back here.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/research/roles" className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Roles
      </Link>
      <PageHeader title="Add Role" description="Paste the real job description — it's what ATS Analysis compares your resume against." />

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Company</Label>
          <Select name="companyId" defaultValue={defaultCompanyId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="seniority">Seniority</Label>
            <Input id="seniority" name="seniority" placeholder="e.g. Senior" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="jobUrl">Job URL</Label>
          <Input id="jobUrl" name="jobUrl" type="url" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="jobDescription">Job description (full text)</Label>
          <Textarea id="jobDescription" name="jobDescription" rows={8} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="requirements">Requirements (one per line)</Label>
          <Textarea id="requirements" name="requirements" rows={3} />
        </div>

        {skills.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <Label>Skills this role requires</Label>
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
          <Label htmlFor="fit">Personal fit</Label>
          <Textarea id="fit" name="fit" rows={2} />
        </div>
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
            {pending ? 'Saving…' : 'Add Role'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/research/roles">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
