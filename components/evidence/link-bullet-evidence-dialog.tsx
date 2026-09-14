'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { Link2 } from 'lucide-react';
import { linkResumeEvidence } from '@/lib/actions/resumes';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export function LinkBulletEvidenceDialog({
  bulletId,
  projects,
  skills,
}: {
  bulletId: string;
  projects: { id: string; name: string }[];
  skills: { id: string; name: string }[];
}) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState(linkResumeEvidence, undefined);

  React.useEffect(() => {
    if (state && !state.error) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <Link2 className="mr-1.5 h-3.5 w-3.5" /> Link evidence
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link evidence to this bullet</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="bulletId" value={bulletId} />

          {projects.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label>Project</Label>
              <Select name="projectId">
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {skills.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label>Skill</Label>
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
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea id="note" name="note" rows={2} />
          </div>

          {state?.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? 'Linking…' : 'Link'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
