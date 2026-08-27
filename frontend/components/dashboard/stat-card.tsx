'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color?: 'violet' | 'emerald' | 'amber' | 'rose' | 'sky';
}

const colorMap = {
  violet: 'from-violet-600/20 to-indigo-600/20 border-violet-500/20',
  emerald: 'from-emerald-600/20 to-teal-600/20 border-emerald-500/20',
  amber: 'from-amber-600/20 to-orange-600/20 border-amber-500/20',
  rose: 'from-rose-600/20 to-red-600/20 border-rose-500/20',
  sky: 'from-sky-600/20 to-blue-600/20 border-sky-500/20',
};

const iconColorMap = {
  violet: 'text-violet-400',
  emerald: 'text-emerald-400',
  amber: 'text-amber-400',
  rose: 'text-rose-400',
  sky: 'text-sky-400',
};

export function StatCard({ title, value, change, icon, color = 'violet' }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6',
        colorMap[color]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          {change !== undefined && (
            <p className={cn('mt-1 text-sm font-medium', change >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
              {change >= 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl bg-slate-900/50', iconColorMap[color])}>
          {icon}
        </div>
      </div>
      {/* Decorative gradient */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br from-white/5 to-transparent blur-2xl" />
    </motion.div>
  );
}
