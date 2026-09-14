'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type Toast = { id: string; title: string; description?: string; variant?: 'default' | 'destructive' };
type ToastContextValue = { toasts: Toast[]; push: (t: Omit<Toast, 'id'>) => void; dismiss: (id: string) => void };

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const push = React.useCallback((t: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 5000);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return <ToastContext.Provider value={{ toasts, push, dismiss }}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider (see Toaster)');
  return { toast: ctx.push, dismiss: ctx.dismiss };
}

/** Renders the toast viewport. Must be mounted inside <ToastProvider> — see app/layout.tsx,
 * which wraps the whole app in ToastProvider so useToast() works from any page. */
export function Toaster() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('Toaster must be rendered inside ToastProvider');
  return <ToasterInner toasts={ctx.toasts} />;
}

function ToasterInner({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            'animate-fade-in rounded-lg border border-border bg-surface-raised p-4 shadow-md',
            t.variant === 'destructive' && 'border-destructive/40 bg-destructive/5',
          )}
        >
          <p className="text-sm font-medium">{t.title}</p>
          {t.description && <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>}
        </div>
      ))}
    </div>
  );
}
