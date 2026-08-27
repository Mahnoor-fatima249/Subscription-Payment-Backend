import * as React from 'react';
import { cn } from '@/lib/utils';

const Badge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: string }>(
  ({ className, variant, ...props }, ref) => {
    const variants: Record<string, string> = {
      default: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
      success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      danger: 'bg-red-500/10 text-red-400 border-red-500/20',
      info: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors',
          variants[variant || 'default'],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge };
