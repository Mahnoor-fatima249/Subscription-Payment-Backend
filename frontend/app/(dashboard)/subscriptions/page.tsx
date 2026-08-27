'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Pause, Play, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, StatusBadge } from '@/components/dashboard/data-table';
import { formatCurrency, formatDate } from '@/lib/utils';

const subscriptions = [
  { id: '1', customerName: 'John Doe', customerEmail: 'john@acme.com', planName: 'Pro', status: 'ACTIVE', quantity: 5, amount: 495, currentPeriodEnd: '2024-03-15', createdAt: '2024-01-15' },
  { id: '2', customerName: 'Sarah Wilson', customerEmail: 'sarah@globex.com', planName: 'Enterprise', status: 'ACTIVE', quantity: 10, amount: 2990, currentPeriodEnd: '2024-03-20', createdAt: '2024-02-20' },
  { id: '3', customerName: 'Mike Johnson', customerEmail: 'mike@initech.com', planName: 'Starter', status: 'PAST_DUE', quantity: 1, amount: 29, currentPeriodEnd: '2024-03-10', createdAt: '2024-03-10' },
  { id: '4', customerName: 'Emily Brown', customerEmail: 'emily@umbrella.com', planName: 'Pro', status: 'TRIALING', quantity: 3, amount: 297, currentPeriodEnd: '2024-04-05', createdAt: '2024-04-05' },
  { id: '5', customerName: 'David Lee', customerEmail: 'david@wayne.com', planName: 'Enterprise', status: 'CANCELLED', quantity: 1, amount: 299, currentPeriodEnd: '2024-02-12', createdAt: '2024-01-12' },
];

export default function SubscriptionsPage() {
  const columns = [
    {
      key: 'customer',
      label: 'Customer',
      render: (item: typeof subscriptions[0]) => (
        <div>
          <p className="text-sm font-medium text-white">{item.customerName}</p>
          <p className="text-xs text-slate-400">{item.customerEmail}</p>
        </div>
      ),
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (item: typeof subscriptions[0]) => (
        <Badge variant="violet">{item.planName}</Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: typeof subscriptions[0]) => (
        <StatusBadge status={item.status} />
      ),
    },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (item: typeof subscriptions[0]) => (
        <span className="text-sm text-slate-300">{item.quantity}</span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (item: typeof subscriptions[0]) => (
        <span className="text-sm font-medium text-white">{formatCurrency(item.amount)}/mo</span>
      ),
    },
    {
      key: 'currentPeriodEnd',
      label: 'Next billing',
      render: (item: typeof subscriptions[0]) => (
        <span className="text-sm text-slate-400">{formatDate(item.currentPeriodEnd)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
          <p className="text-slate-400 mt-1">Manage all subscriptions</p>
        </div>
        <Button>
          <Plus className="w-4 h-4" />
          Create Subscription
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active', value: '1,250', color: 'text-emerald-400' },
          { label: 'Trial', value: '180', color: 'text-violet-400' },
          { label: 'Past Due', value: '45', color: 'text-amber-400' },
          { label: 'Cancelled', value: '89', color: 'text-red-400' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-xl border border-slate-800/50 bg-slate-900/50 p-4"
          >
            <p className="text-sm text-slate-400">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search subscriptions..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
          />
        </div>
        <select className="h-10 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50">
          <option>All Status</option>
          <option>Active</option>
          <option>Trial</option>
          <option>Past Due</option>
          <option>Cancelled</option>
        </select>
        <Button variant="outline">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      <DataTable data={subscriptions} columns={columns} />
    </div>
  );
}
