'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { Plus } from 'lucide-react';
import { linkSkillEvidence } from '@/lib/actions/skills';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type Option = { id: string; label: string };

export function LinkEvidenceDialog({
  skillId,
  projects,
  achievements,
  metrics,
  adrs,
  notes,
}: {
  skillId: string;
  projects: Option[];
  achievements: Option[];
  metrics: Option[];
  adrs: Option[];
  notes: Option[];
}) {
  const [open, setOpen] = React.useState(false);
  const [sourceType, setSourceType] = React.useState<'project' | 'achievement' | 'metric' | 'adr' | 'note'>('project');
  const [state, formAction, pending] = useActionState(linkSkillEvidence, undefined);

  React.useEffect(() => {
    if (state && !state.error) setOpen(false);
  }, [state]);

  const optionsByType: Record<typeof sourceType, Option[]> = {
    project: projects,
    achievement: achievements,
    metric: metrics,
    adr: adrs,
    note: notes,
  };
  const fieldNameByType: Record<typeof sourceType, string> = {
    project: 'projectId',
    achievement: 'achievementId',
    metric: 'metricId',
    adr: 'adrId',
    note: 'noteId',
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="mr-1.5 h-4 w-4" /> Link Evidence
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link evidence</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="skillId" value={skillId} />

          <div className="flex flex-col gap-1.5">
            <Label>Evidence type</Label>
            <Select value={sourceType} onValueChange={(v) => setSourceType(v as typeof sourceType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="achievement">Achievement</SelectItem>
                <SelectItem value="metric">Metric</SelectItem>
                <SelectItem value="adr">ADR</SelectItem>
                <SelectItem value="note">Engineering Note</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Source</Label>
            <Select name={fieldNameByType[sourceType]} required>
              <SelectTrigger>
                <SelectValue placeholder="Choose…" />
              </SelectTrigger>
              <SelectContent>
                {optionsByType[sourceType].length === 0 ? (
                  <p className="px-3 py-2 text-sm text-muted-foreground">
                    None yet — create one first.
                  </p>
                ) : (
                  optionsByType[sourceType].map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note_text">Why this counts as evidence (optional)</Label>
            <Textarea id="note_text" name="note_text" rows={2} />
          </div>

          {state?.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? 'Linking…' : 'Link evidence'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
