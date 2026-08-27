'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, RotateCcw, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, StatusBadge } from '@/components/dashboard/data-table';
import { formatCurrency, formatDate } from '@/lib/utils';

const dunningItems = [
  { id: '1', customerName: 'David Lee', customerEmail: 'david@wayne.com', invoiceNumber: 'INV-000005', amount: 299, attemptCount: 2, maxRetries: 4, nextPaymentAttempt: '2024-02-19', lastAttemptAt: '2024-02-12', failureReason: 'Insufficient funds' },
  { id: '2', customerName: 'Mike Johnson', customerEmail: 'mike@initech.com', invoiceNumber: 'INV-000003', amount: 29, attemptCount: 1, maxRetries: 4, nextPaymentAttempt: '2024-03-17', lastAttemptAt: '2024-03-10', failureReason: 'Card declined' },
];

export default function DunningPage() {
  const columns = [
    {
      key: 'customer',
      label: 'Customer',
      render: (item: typeof dunningItems[0]) => (
        <div>
          <p className="text-sm font-medium text-white">{item.customerName}</p>
          <p className="text-xs text-slate-400">{item.customerEmail}</p>
        </div>
      ),
    },
    {
      key: 'invoice',
      label: 'Invoice',
      render: (item: typeof dunningItems[0]) => (
        <span className="text-sm text-violet-400">{item.invoiceNumber}</span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (item: typeof dunningItems[0]) => (
        <span className="text-sm font-medium text-white">{formatCurrency(item.amount)}</span>
      ),
    },
    {
      key: 'attempts',
      label: 'Attempts',
      render: (item: typeof dunningItems[0]) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
              style={{ width: `${(item.attemptCount / item.maxRetries) * 100}%` }}
            />
          </div>
          <span className="text-sm text-slate-400">{item.attemptCount}/{item.maxRetries}</span>
        </div>
      ),
    },
    {
      key: 'failureReason',
      label: 'Reason',
      render: (item: typeof dunningItems[0]) => (
        <span className="text-sm text-red-400">{item.failureReason}</span>
      ),
    },
    {
      key: 'nextPaymentAttempt',
      label: 'Next Attempt',
      render: (item: typeof dunningItems[0]) => (
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Clock className="w-4 h-4 text-slate-500" />
          {formatDate(item.nextPaymentAttempt)}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dunning</h1>
          <p className="text-slate-400 mt-1">Manage failed payment retries</p>
        </div>
        <Button>
          <RotateCcw className="w-4 h-4" />
          Process All
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Failed Payments', value: '2', icon: <AlertTriangle className="w-5 h-5 text-amber-400" />, color: 'text-amber-400' },
          { label: 'Amount at Risk', value: '$328', icon: <DollarSign className="w-5 h-5 text-red-400" />, color: 'text-red-400' },
          { label: 'Recovery Rate', value: '68%', icon: <TrendingUp className="w-5 h-5 text-emerald-400" />, color: 'text-emerald-400' },
          { label: 'Recovered This Month', value: '$2,450', icon: <TrendingDown className="w-5 h-5 text-sky-400" />, color: 'text-sky-400' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-xl border border-slate-800/50 bg-slate-900/50 p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">{stat.label}</p>
              {stat.icon}
            </div>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <DataTable data={dunningItems} columns={columns} />
    </div>
  );
}
