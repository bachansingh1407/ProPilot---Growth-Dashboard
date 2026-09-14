'use client';

import { NAV_TOP, NAV_SECTIONS, NAV_SETTINGS } from '@/lib/navigation';
import { NavLink } from './nav-link';

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-semibold text-primary-foreground">
          C
        </div>
        <span className="text-sm font-semibold tracking-tight">Career OS</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Primary">
        <NavLink item={NAV_TOP} />

        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mt-5">
            <p className="px-2.5 pb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
              {section.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border px-3 py-3">
        <NavLink item={NAV_SETTINGS} />
      </div>
    </aside>
  );
}
