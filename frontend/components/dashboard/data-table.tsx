'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, Eye, Edit, Trash2, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn, getStatusColor, formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
}

export function DataTable<T extends { id: string }>({ data, columns, onRowClick, actions }: DataTableProps<T>) {
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-800/50 hover:bg-transparent">
            {columns.map((col) => (
              <TableHead key={col.key} className={col.className}>
                {col.label}
              </TableHead>
            ))}
            {actions && <TableHead className="w-12"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <motion.tr
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'border-b border-slate-800/50 transition-colors hover:bg-slate-800/30',
                onRowClick && 'cursor-pointer'
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <TableCell key={col.key} className={col.className}>
                  {col.render
                    ? col.render(item)
                    : (item as Record<string, unknown>)[col.key] as React.ReactNode}
                </TableCell>
              ))}
              {actions && (
                <TableCell>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(openDropdown === item.id ? null : item.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {openDropdown === item.id && (
                      <div className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-slate-700/50 bg-slate-800 shadow-xl shadow-black/20 py-1 z-50">
                        {actions(item)}
                      </div>
                    )}
                  </div>
                </TableCell>
              )}
            </motion.tr>
          ))}
        </TableBody>
      </Table>
      {data.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-slate-500">No data found</p>
        </div>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
      getStatusColor(status)
    )}>
      {status}
    </span>
  );
}

export function TrendIndicator({ value }: { value: number }) {
  if (value > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-400 text-sm font-medium">
        <ArrowUpRight className="w-4 h-4" />
        {Math.abs(value)}%
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-rose-400 text-sm font-medium">
        <ArrowDownRight className="w-4 h-4" />
        {Math.abs(value)}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-slate-400 text-sm font-medium">
      <Minus className="w-4 h-4" />
      0%
    </span>
  );
}
