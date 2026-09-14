'use client';

import { useActionState } from 'react';
import { createImprovement } from '@/lib/actions/improvements';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export function NewImprovementForm({ skills }: { skills: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createImprovement, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <p className="text-sm font-medium">Identify an improvement area</p>
      {skills.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <Label>Related skill (optional)</Label>
          <Select name="skillId">
            <SelectTrigger>
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              {skills.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="weakness">Weakness</Label>
        <Textarea id="weakness" name="weakness" rows={2} required placeholder="e.g. Struggled explaining tradeoffs in system design interviews" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="evidenceGap">Evidence gap</Label>
        <Textarea id="evidenceGap" name="evidenceGap" rows={2} placeholder="What's missing that would prove improvement?" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="strategy">Strategy</Label>
        <Textarea id="strategy" name="strategy" rows={2} required placeholder="What will you do about it?" />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" size="sm" disabled={pending} className="self-start">
        {pending ? 'Saving…' : 'Add improvement'}
      </Button>
    </form>
  );
}
