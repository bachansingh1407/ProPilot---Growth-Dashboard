import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  explanation: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
};

/**
 * Every empty state in the app must explain: what's missing, why it matters,
 * and what to do next (Section 39). Never render a bare "No data found."
 */
export function EmptyState({ icon: Icon, title, explanation, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-16 text-center">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{explanation}</p>
      {actionLabel && actionHref && (
        <Button asChild size="sm" className="mt-4">
          <a href={actionHref}>{actionLabel}</a>
        </Button>
      )}
    </div>
  );
}
