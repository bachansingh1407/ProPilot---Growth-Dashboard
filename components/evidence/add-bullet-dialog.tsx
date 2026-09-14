'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { Plus } from 'lucide-react';
import { createResumeBullet } from '@/lib/actions/resumes';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export function AddBulletDialog({
  resumeVersionId,
  experiences,
  achievements,
}: {
  resumeVersionId: string;
  experiences: { id: string; company: string; title: string }[];
  achievements: { id: string; title: string }[];
}) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState(createResumeBullet, undefined);

  React.useEffect(() => {
    if (state && !state.error) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="mr-1.5 h-4 w-4" /> Add bullet
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add resume bullet</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="resumeVersionId" value={resumeVersionId} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="text">Bullet text</Label>
            <Textarea id="text" name="text" rows={3} required placeholder="Reduced P95 checkout latency by 40% by introducing a Redis cache layer" />
          </div>

          {experiences.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label>Related experience (optional)</Label>
              <Select name="experienceId">
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {experiences.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.title} · {e.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {achievements.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label>Related achievement (optional)</Label>
              <Select name="achievementId">
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {achievements.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {state?.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : 'Add bullet'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
