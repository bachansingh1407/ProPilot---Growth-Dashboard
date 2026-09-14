'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, Loader2 } from 'lucide-react';
import { NAV_SECTIONS } from '@/lib/navigation';
import type { SearchResults } from '@/app/api/search/route';

/**
 * Section 29/30: global search + Cmd/Ctrl+K command palette.
 * Empty query shows quick actions + navigation. Two or more characters
 * triggers a debounced fetch against /api/search, grouped by entity type.
 */
const QUICK_ACTIONS = [
  { label: 'Add Project', href: '/engineering/projects/new' },
  { label: 'Add Skill', href: '/engineering/skills/new' },
  { label: 'Add Achievement', href: '/career/achievements/new' },
  { label: 'Add Interview', href: '/prep/interviews/new' },
  { label: 'Add Application', href: '/prep/applications/new' },
  { label: 'Open Resume Lab', href: '/prep/resume-lab' },
  { label: 'Open ATS Analyzer', href: '/prep/ats-analysis' },
];

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResults>({});
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  React.useEffect(() => {
    if (query.trim().length < 2) {
      setResults({});
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) setResults(await res.json());
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(handle);
  }, [query]);

  const go = (href: string) => {
    setOpen(false);
    setQuery('');
    router.push(href);
  };

  const hasSearchResults = Object.keys(results).length > 0;
  const isSearching = query.trim().length >= 2;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery('');
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-24 z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-lg border border-border bg-surface-raised shadow-xl outline-none">
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <Command label="Global command menu" shouldFilter={!isSearching} className="flex flex-col">
            <div className="flex items-center gap-2 border-b border-border px-3">
              <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
              <Command.Input
                autoFocus
                value={query}
                onValueChange={setQuery}
                placeholder="Search or run a command…"
                className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden />}
            </div>
            <Command.List className="max-h-80 overflow-y-auto p-2">
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                {isSearching ? 'No results found.' : 'Type to search everything, or run a command.'}
              </Command.Empty>

              {isSearching ? (
                hasSearchResults &&
                Object.entries(results).map(([group, items]) => (
                  <Command.Group key={group} heading={group} className="px-1 text-xs font-medium text-muted-foreground/70">
                    {items.map((item) => (
                      <Command.Item
                        key={item.id}
                        value={`${group}-${item.id}`}
                        onSelect={() => go(item.href)}
                        className="mt-1 flex cursor-pointer flex-col rounded-md px-2 py-2 text-sm data-[selected=true]:bg-muted"
                      >
                        <span>{item.label}</span>
                        {item.sublabel && <span className="text-xs text-muted-foreground">{item.sublabel}</span>}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ))
              ) : (
                <>
                  <Command.Group heading="Quick actions" className="px-1 text-xs font-medium text-muted-foreground/70">
                    {QUICK_ACTIONS.map((action) => (
                      <Command.Item
                        key={action.href}
                        onSelect={() => go(action.href)}
                        className="mt-1 cursor-pointer rounded-md px-2 py-2 text-sm data-[selected=true]:bg-muted"
                      >
                        {action.label}
                      </Command.Item>
                    ))}
                  </Command.Group>

                  <Command.Group heading="Navigate" className="mt-3 px-1 text-xs font-medium text-muted-foreground/70">
                    {NAV_SECTIONS.flatMap((s) => s.items).map((item) => (
                      <Command.Item
                        key={item.href}
                        onSelect={() => go(item.href)}
                        className="mt-1 cursor-pointer rounded-md px-2 py-2 text-sm data-[selected=true]:bg-muted"
                      >
                        {item.label}
                      </Command.Item>
                    ))}
                  </Command.Group>
                </>
              )}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
