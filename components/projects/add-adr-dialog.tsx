'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { Plus } from 'lucide-react';
import { createADR } from '@/lib/actions/architecture';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const STATUSES = ['PROPOSED', 'ACCEPTED', 'REJECTED', 'DEPRECATED', 'SUPERSEDED'] as const;

export function AddADRDialog({ projectId, nextIdentifier }: { projectId: string; nextIdentifier: string }) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState(createADR, undefined);

  React.useEffect(() => {
    if (state && !state.error) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="mr-1.5 h-4 w-4" /> Add ADR
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Architecture Decision Record</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
          <input type="hidden" name="projectId" value={projectId} />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="identifier">ID</Label>
              <Input id="identifier" name="identifier" defaultValue={nextIdentifier} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select name="status" defaultValue="PROPOSED">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="context">Context</Label>
            <Textarea id="context" name="context" rows={2} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="problem">Problem</Label>
            <Textarea id="problem" name="problem" rows={2} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="decision">Decision</Label>
            <Textarea id="decision" name="decision" rows={2} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="alternatives">Alternatives considered</Label>
            <Textarea id="alternatives" name="alternatives" rows={2} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tradeoffs">Tradeoffs</Label>
            <Textarea id="tradeoffs" name="tradeoffs" rows={2} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="consequences">Consequences</Label>
            <Textarea id="consequences" name="consequences" rows={2} />
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
