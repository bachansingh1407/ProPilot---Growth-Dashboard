'use client';

import { useActionState } from 'react';
import { updateProfile } from '@/lib/actions/settings';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { Profile } from '@prisma/client';

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const [state, formAction, pending] = useActionState(updateProfile, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" defaultValue={profile?.fullName} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="currentTitle">Current title</Label>
          <Input id="currentTitle" name="currentTitle" defaultValue={profile?.currentTitle ?? ''} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="headline">Headline</Label>
          <Input id="headline" name="headline" defaultValue={profile?.headline ?? ''} placeholder="e.g. Senior Backend Engineer" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="yearsOfExperience">Years of experience</Label>
          <Input id="yearsOfExperience" name="yearsOfExperience" type="number" step="0.5" defaultValue={profile?.yearsOfExperience ?? ''} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue={profile?.location ?? ''} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="primaryFocus">Primary engineering focus</Label>
        <Input id="primaryFocus" name="primaryFocus" defaultValue={profile?.primaryFocus ?? ''} placeholder="e.g. Distributed Systems, Backend" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" rows={4} defaultValue={profile?.bio ?? ''} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contactEmail">Public contact email</Label>
          <Input id="contactEmail" name="contactEmail" type="email" defaultValue={profile?.contactEmail ?? ''} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="githubUrl">GitHub</Label>
          <Input id="githubUrl" name="githubUrl" type="url" defaultValue={profile?.githubUrl ?? ''} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="linkedinUrl">LinkedIn</Label>
          <Input id="linkedinUrl" name="linkedinUrl" type="url" defaultValue={profile?.linkedinUrl ?? ''} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="websiteUrl">Website</Label>
          <Input id="websiteUrl" name="websiteUrl" type="url" defaultValue={profile?.websiteUrl ?? ''} />
        </div>
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state?.success && <p className="text-sm text-evidence-strong">Saved.</p>}

      <Button type="submit" disabled={pending} className="mt-2 self-start">
        {pending ? 'Saving…' : 'Save profile'}
      </Button>
    </form>
  );
}
