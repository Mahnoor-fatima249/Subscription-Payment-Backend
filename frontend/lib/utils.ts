import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    PAUSED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
    PAST_DUE: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    TRIALING: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    EXPIRED: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    INCOMPLETE: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    DRAFT: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    OPEN: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    PAID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    UNCOLLECTIBLE: 'bg-red-500/10 text-red-400 border-red-500/20',
    VOID: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    SUCCEEDED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
    REFUNDED: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    DISPUTED: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  };
  return colors[status] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
}
