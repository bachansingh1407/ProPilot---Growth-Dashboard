'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { MobileNav } from './mobile-nav';
import { ThemeToggle } from './theme-toggle';

export function Topbar() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4">
      <div className="flex items-center gap-2">
        <MobileNav />
      </div>

      <button
        type="button"
        onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
        className="flex w-full max-w-sm items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted md:max-w-md"
      >
        <Search className="h-4 w-4" aria-hidden />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium">⌘K</kbd>
      </button>

      <div className="flex items-center gap-1">
        <ThemeToggle />
      </div>
    </header>
  );
}
