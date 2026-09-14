'use client';

import * as React from 'react';
import { updateApplicationStatus } from '@/lib/actions/applications';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const STATUSES = ['RESEARCHING', 'APPLIED', 'PHONE_SCREEN', 'INTERVIEWING', 'OFFER', 'REJECTED', 'WITHDRAWN'] as const;
type Status = (typeof STATUSES)[number];

export function ApplicationStatusSelect({ applicationId, status }: { applicationId: string; status: Status }) {
  const [, startTransition] = React.useTransition();

  return (
    <Select
      value={status}
      onValueChange={(next) => startTransition(() => updateApplicationStatus(applicationId, next as Status))}
    >
      <SelectTrigger className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {s.replace('_', ' ')}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
