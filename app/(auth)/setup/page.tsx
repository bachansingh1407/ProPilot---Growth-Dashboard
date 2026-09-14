'use client';

import { useActionState } from 'react';
import { setupAction } from '@/lib/actions/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SetupPage() {
  const [state, formAction, pending] = useActionState<{ error?: string } | undefined, FormData>(
    setupAction,
    undefined,
  );

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This is a single-user instance. This step runs once — if an account already exists, submitting
          will tell you.
        </p>

        <form action={formAction} className="mt-6 flex flex-col gap-4">
          <Field label="Full name" name="fullName" autoComplete="name" />
          <Field label="Email" name="email" type="email" autoComplete="email" />
          <Field label="Password" name="password" type="password" autoComplete="new-password" />
          <Field label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" />

          {state?.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}

          <Button type="submit" disabled={pending} className="mt-2">
            {pending ? 'Creating…' : 'Create account'}
          </Button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <Input id={name} name={name} type={type} required autoComplete={autoComplete} />
    </div>
  );
}
