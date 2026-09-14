'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { Plus } from 'lucide-react';
import { createArchitecture } from '@/lib/actions/architecture';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const CATEGORIES = [
  'SYSTEM_DESIGN',
  'DISTRIBUTED_SYSTEMS',
  'DATABASE_DESIGN',
  'EVENT_DRIVEN',
  'CACHING',
  'QUEUES',
  'API_GATEWAY',
  'MICROSERVICES',
  'MONOLITH',
  'CLOUD_ARCHITECTURE',
  'OTHER',
] as const;

export function AddArchitectureDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState(createArchitecture, undefined);

  React.useEffect(() => {
    if (state && !state.error) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="mr-1.5 h-4 w-4" /> Document architecture
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Document architecture</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
          <input type="hidden" name="projectId" value={projectId} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required placeholder="e.g. Event-driven order pipeline" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Category</Label>
            <Select name="category" defaultValue="SYSTEM_DESIGN">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={4} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tradeoffs">Tradeoffs</Label>
            <Textarea id="tradeoffs" name="tradeoffs" rows={3} />
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
