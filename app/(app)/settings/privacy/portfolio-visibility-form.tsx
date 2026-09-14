'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { updatePortfolioVisibility } from '@/lib/actions/settings';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { Profile } from '@prisma/client';

export function PortfolioVisibilityForm({ profile }: { profile: Profile | null }) {
  const [state, formAction, pending] = useActionState(updatePortfolioVisibility, undefined);

  if (!profile) {
    return (
      <p className="text-sm text-muted-foreground">
        Set up your profile in <Link href="/settings/account" className="underline">Account</Link> first.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="portfolioSlug">Portfolio URL slug</Label>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>/portfolio/</span>
          <Input id="portfolioSlug" name="portfolioSlug" defaultValue={profile.portfolioSlug ?? ''} placeholder="your-name" className="max-w-[220px]" />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPortfolioPublished" defaultChecked={profile.isPortfolioPublished} className="h-3.5 w-3.5" />
        Publish my portfolio publicly
      </label>

      {profile.isPortfolioPublished && profile.portfolioSlug && (
        <p className="text-sm text-muted-foreground">
          Live at <Link href={`/portfolio/${profile.portfolioSlug}`} className="underline" target="_blank">
            /portfolio/{profile.portfolioSlug}
          </Link>
        </p>
      )}

      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state?.success && <p className="text-sm text-evidence-strong">Saved.</p>}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? 'Saving…' : 'Save'}
      </Button>
    </form>
  );
}
