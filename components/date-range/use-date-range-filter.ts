'use client';

import * as React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { subDays, startOfDay, endOfDay, isValid, parseISO } from 'date-fns';

export type DateRangePreset = '24h' | '7d' | '30d' | 'custom';

export type DateRange = {
  preset: DateRangePreset;
  from: Date;
  to: Date;
};

export const PRESET_LABELS: Record<DateRangePreset, string> = {
  '24h': 'Last 24 hours',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  custom: 'Custom',
};

function presetToRange(preset: Exclude<DateRangePreset, 'custom'>): { from: Date; to: Date } {
  const to = new Date();
  const days = preset === '24h' ? 1 : preset === '7d' ? 7 : 30;
  return { from: subDays(to, days), to };
}

/**
 * The one reusable date-range implementation described in
 * docs/architecture.md §7. Synced to the URL (?range=7d or
 * ?range=custom&from=...&to=...) so it's shareable, survives refresh, and
 * every page that needs time filtering (dashboard, metrics, interview
 * analytics, application analytics, activity, timeline, engineering trends)
 * shares one source of truth instead of re-implementing this.
 */
export function useDateRangeFilter(defaultPreset: DateRangePreset = '30d') {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const range = React.useMemo<DateRange>(() => {
    const presetParam = searchParams.get('range') as DateRangePreset | null;

    if (presetParam === 'custom') {
      const fromParam = searchParams.get('from');
      const toParam = searchParams.get('to');
      const from = fromParam ? parseISO(fromParam) : null;
      const to = toParam ? parseISO(toParam) : null;
      if (from && to && isValid(from) && isValid(to) && from <= to) {
        return { preset: 'custom', from: startOfDay(from), to: endOfDay(to) };
      }
      // Invalid/incomplete custom range in the URL — fall back rather than
      // rendering a broken chart (Section 11: "prevent invalid ranges").
    }

    const preset = presetParam && presetParam !== 'custom' ? presetParam : defaultPreset;
    const { from, to } = presetToRange(preset as Exclude<DateRangePreset, 'custom'>);
    return { preset, from, to };
  }, [searchParams, defaultPreset]);

  const setRange = React.useCallback(
    (next: { preset: DateRangePreset; from?: Date; to?: Date }) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('range', next.preset);
      if (next.preset === 'custom' && next.from && next.to) {
        params.set('from', next.from.toISOString().slice(0, 10));
        params.set('to', next.to.toISOString().slice(0, 10));
      } else {
        params.delete('from');
        params.delete('to');
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  return { range, setRange };
}
