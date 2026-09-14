'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { Plus } from 'lucide-react';
import { addInterviewAnswer } from '@/lib/actions/interviews';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export function AddAnswerDialog({
  interviewId,
  questions,
}: {
  interviewId: string;
  questions: { id: string; text: string }[];
}) {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<'existing' | 'new'>(questions.length > 0 ? 'existing' : 'new');
  const [state, formAction, pending] = useActionState(addInterviewAnswer, undefined);

  React.useEffect(() => {
    if (state && !state.error) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="mr-1.5 h-4 w-4" /> Record answer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record a question &amp; answer</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
          <input type="hidden" name="interviewId" value={interviewId} />

          <div className="flex gap-2">
            <Button type="button" size="sm" variant={mode === 'existing' ? 'default' : 'outline'} onClick={() => setMode('existing')} disabled={questions.length === 0}>
              From question bank
            </Button>
            <Button type="button" size="sm" variant={mode === 'new' ? 'default' : 'outline'} onClick={() => setMode('new')}>
              New question
            </Button>
          </div>

          {mode === 'existing' ? (
            <div className="flex flex-col gap-1.5">
              <Label>Question</Label>
              <Select name="questionId">
                <SelectTrigger>
                  <SelectValue placeholder="Choose a question" />
                </SelectTrigger>
                <SelectContent>
                  {questions.map((q) => (
                    <SelectItem key={q.id} value={q.id}>
                      {q.text.slice(0, 80)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="newQuestionText">Question text</Label>
                <Textarea id="newQuestionText" name="newQuestionText" rows={2} required={mode === 'new'} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="newQuestionCategory">Category</Label>
                <Input id="newQuestionCategory" name="newQuestionCategory" placeholder="e.g. System Design" />
              </div>
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="myAnswer">Your answer</Label>
            <Textarea id="myAnswer" name="myAnswer" rows={4} required />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>How did it go?</Label>
            <Select name="selfRating">
              <SelectTrigger>
                <SelectValue placeholder="Optional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EASY">Went well</SelectItem>
                <SelectItem value="MEDIUM">Okay</SelectItem>
                <SelectItem value="HARD">Struggled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wentWell">What went well</Label>
            <Textarea id="wentWell" name="wentWell" rows={2} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wentPoorly">What went poorly</Label>
            <Textarea id="wentPoorly" name="wentPoorly" rows={2} />
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
