'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, CreditCard, ArrowUpRight, ArrowDownRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, StatusBadge } from '@/components/dashboard/data-table';
import { formatCurrency, formatDate } from '@/lib/utils';

const payments = [
  { id: '1', customerName: 'John Doe', amount: 495, currency: 'usd', status: 'SUCCEEDED', paymentMethod: 'Visa •••• 4242', createdAt: '2024-02-14', invoiceNumber: 'INV-000001' },
  { id: '2', customerName: 'Sarah Wilson', amount: 2990, currency: 'usd', status: 'PENDING', paymentMethod: 'Mastercard •••• 8888', createdAt: '2024-03-20', invoiceNumber: 'INV-000002' },
  { id: '3', customerName: 'Mike Johnson', amount: 29, currency: 'usd', status: 'SUCCEEDED', paymentMethod: 'Visa •••• 1234', createdAt: '2024-03-09', invoiceNumber: 'INV-000003' },
  { id: '4', customerName: 'David Lee', amount: 299, currency: 'usd', status: 'FAILED', paymentMethod: 'Visa •••• 5678', createdAt: '2024-02-12', invoiceNumber: 'INV-000005' },
  { id: '5', customerName: 'Emily Brown', amount: 150, currency: 'usd', status: 'REFUNDED', paymentMethod: 'Visa •••• 4242', createdAt: '2024-03-01', invoiceNumber: 'INV-000004' },
];

export default function PaymentsPage() {
  const columns = [
    {
      key: 'customer',
      label: 'Customer',
      render: (item: typeof payments[0]) => (
        <p className="text-sm font-medium text-white">{item.customerName}</p>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (item: typeof payments[0]) => (
        <span className="text-sm font-medium text-white">{formatCurrency(item.amount)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: typeof payments[0]) => (
        <StatusBadge status={item.status} />
      ),
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      render: (item: typeof payments[0]) => (
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <CreditCard className="w-4 h-4 text-slate-500" />
          {item.paymentMethod}
        </div>
      ),
    },
    {
      key: 'invoice',
      label: 'Invoice',
      render: (item: typeof payments[0]) => (
        <span className="text-sm text-violet-400">{item.invoiceNumber}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (item: typeof payments[0]) => (
        <span className="text-sm text-slate-400">{formatDate(item.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Payments</h1>
          <p className="text-slate-400 mt-1">Track all payment transactions</p>
        </div>
        <Button variant="outline">
          <RotateCcw className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Payments', value: '$42,100', icon: <ArrowUpRight className="w-5 h-5 text-emerald-400" /> },
          { label: 'Successful', value: '$38,500', icon: <ArrowUpRight className="w-5 h-5 text-emerald-400" /> },
          { label: 'Failed', value: '$2,600', icon: <ArrowDownRight className="w-5 h-5 text-red-400" /> },
          { label: 'Refunded', value: '$1,000', icon: <RotateCcw className="w-5 h-5 text-amber-400" /> },
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
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search payments..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
          />
        </div>
        <select className="h-10 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50">
          <option>All Status</option>
          <option>Succeeded</option>
          <option>Pending</option>
          <option>Failed</option>
          <option>Refunded</option>
        </select>
      </div>

      <DataTable data={payments} columns={columns} />
    </div>
  );
}
