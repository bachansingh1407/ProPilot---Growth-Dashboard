import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', {
  variants: {
    variant: {
      default: 'bg-muted text-foreground',
      outline: 'border border-border text-muted-foreground',
      strong: 'bg-evidence-strong/15 text-evidence-strong',
      developing: 'bg-evidence-developing/15 text-evidence-developing',
      weak: 'bg-evidence-weak/15 text-evidence-weak',
      gap: 'bg-evidence-gap/15 text-evidence-gap',
      unknown: 'bg-evidence-unknown/15 text-evidence-unknown',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
