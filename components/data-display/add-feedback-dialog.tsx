'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { Plus } from 'lucide-react';
import { createInterviewFeedback } from '@/lib/actions/interviews';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function AddFeedbackDialog({ interviewId }: { interviewId: string }) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState(createInterviewFeedback, undefined);

  React.useEffect(() => {
    if (state && !state.error) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="mr-1.5 h-4 w-4" /> Add feedback
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record feedback</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="interviewId" value={interviewId} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="outcome">Outcome</Label>
            <Input id="outcome" name="outcome" placeholder="e.g. Passed, Did not pass, Pending" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="strengths">Strengths</Label>
            <Textarea id="strengths" name="strengths" rows={2} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="weaknesses">Weaknesses</Label>
            <Textarea id="weaknesses" name="weaknesses" rows={2} />
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

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
