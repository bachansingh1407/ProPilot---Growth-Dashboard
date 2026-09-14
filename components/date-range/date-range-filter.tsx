'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useDateRangeFilter, PRESET_LABELS, type DateRangePreset } from './use-date-range-filter';
import 'react-day-picker/dist/style.css';

const QUICK_PRESETS: DateRangePreset[] = ['24h', '7d', '30d'];

/**
 * The single reusable date-range control described in the build spec
 * (Section 11 & 42). Drop this into any page that has genuinely time-series
 * data — dashboard, metrics, interview/application analytics, activity,
 * timeline, engineering trends. Do NOT add it to pages without time-based
 * data (e.g. a single entity detail view).
 */
export function DateRangeFilter({ defaultPreset = '30d' }: { defaultPreset?: DateRangePreset }) {
  const { range, setRange } = useDateRangeFilter(defaultPreset);
  const [draftFrom, setDraftFrom] = React.useState<Date | undefined>(range.from);
  const [draftTo, setDraftTo] = React.useState<Date | undefined>(range.to);
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  const label =
    range.preset === 'custom'
      ? `${format(range.from, 'MMM d')} – ${format(range.to, 'MMM d, yyyy')}`
      : PRESET_LABELS[range.preset];

  return (
    <div className="flex items-center gap-1 rounded-md border border-border bg-surface p-0.5">
      {QUICK_PRESETS.map((p) => (
        <button
          key={p}
          onClick={() => setRange({ preset: p })}
          className={cn(
            'rounded px-2.5 py-1 text-xs font-medium transition-colors',
            range.preset === p ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {PRESET_LABELS[p]}
        </button>
      ))}

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              'flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors',
              range.preset === 'custom' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            {range.preset === 'custom' ? label : 'Custom'}
            <ChevronDown className="h-3 w-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end">
          <DayPicker
            mode="range"
            selected={{ from: draftFrom, to: draftTo }}
            onSelect={(sel) => {
              setDraftFrom(sel?.from);
              setDraftTo(sel?.to);
            }}
            toDate={new Date()}
            numberOfMonths={2}
          />
          <div className="mt-2 flex justify-end gap-2 border-t border-border pt-2">
            <Button variant="ghost" size="sm" onClick={() => setPopoverOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!draftFrom || !draftTo}
              onClick={() => {
                if (draftFrom && draftTo) {
                  setRange({ preset: 'custom', from: draftFrom, to: draftTo });
                  setPopoverOpen(false);
                }
              }}
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <span className="sr-only" role="status">
        Showing {label}
      </span>
    </div>
  );
}
