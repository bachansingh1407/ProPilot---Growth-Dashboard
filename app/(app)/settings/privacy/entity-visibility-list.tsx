'use client';

import * as React from 'react';
import { Switch } from '@/components/ui/switch';
import { toggleProjectVisibility, toggleExperienceVisibility, toggleAchievementVisibility } from '@/lib/actions/settings';

const ACTIONS = {
  project: toggleProjectVisibility,
  experience: toggleExperienceVisibility,
  achievement: toggleAchievementVisibility,
} as const;

export function EntityVisibilityList({
  entityType,
  items,
  emptyLabel,
}: {
  entityType: keyof typeof ACTIONS;
  items: { id: string; label: string; isPublic: boolean }[];
  emptyLabel: string;
}) {
  const [, startTransition] = React.useTransition();
  const [localState, setLocalState] = React.useState(() => new Map(items.map((i) => [i.id, i.isPublic])));

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  const action = ACTIONS[entityType];

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
          <span className="text-sm">{item.label}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{localState.get(item.id) ? 'Public' : 'Private'}</span>
            <Switch
              checked={localState.get(item.id) ?? false}
              onCheckedChange={(checked) => {
                setLocalState((prev) => new Map(prev).set(item.id, checked));
                startTransition(() => action(item.id, checked));
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
