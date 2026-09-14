'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Menu, X } from 'lucide-react';
import { NAV_TOP, NAV_SECTIONS, NAV_SETTINGS } from '@/lib/navigation';
import { NavLink } from './nav-link';
import { Button } from '@/components/ui/button';

export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 animate-fade-in" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-surface shadow-lg outline-none">
          <div className="flex h-14 items-center justify-between border-b border-border px-4">
            <Dialog.Title className="text-sm font-semibold">Career OS</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close navigation">
                <X className="h-5 w-5" />
              </Button>
            </Dialog.Close>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Primary">
            <NavLink item={NAV_TOP} onNavigate={() => setOpen(false)} />
            {NAV_SECTIONS.map((section) => (
              <div key={section.label} className="mt-5">
                <p className="px-2.5 pb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
                  {section.label}
                </p>
                <div className="flex flex-col gap-0.5">
                  {section.items.map((item) => (
                    <NavLink key={item.href} item={item} onNavigate={() => setOpen(false)} />
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <div className="border-t border-border px-3 py-3">
            <NavLink item={NAV_SETTINGS} onNavigate={() => setOpen(false)} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
