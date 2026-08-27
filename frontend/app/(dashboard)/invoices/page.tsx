'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Download, Send, Eye, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, StatusBadge } from '@/components/dashboard/data-table';
import { formatCurrency, formatDate } from '@/lib/utils';

const invoices = [
  { id: '1', invoiceNumber: 'INV-000001', customerName: 'John Doe', customerEmail: 'john@acme.com', status: 'PAID', subtotal: 495, tax: 0, total: 495, amountPaid: 495, dueDate: '2024-02-15', paidAt: '2024-02-14' },
  { id: '2', invoiceNumber: 'INV-000002', customerName: 'Sarah Wilson', customerEmail: 'sarah@globex.com', status: 'OPEN', subtotal: 2990, tax: 0, total: 2990, amountPaid: 0, dueDate: '2024-03-20', paidAt: null },
  { id: '3', invoiceNumber: 'INV-000003', customerName: 'Mike Johnson', customerEmail: 'mike@initech.com', status: 'PAID', subtotal: 29, tax: 0, total: 29, amountPaid: 29, dueDate: '2024-03-10', paidAt: '2024-03-09' },
  { id: '4', invoiceNumber: 'INV-000004', customerName: 'Emily Brown', customerEmail: 'emily@umbrella.com', status: 'DRAFT', subtotal: 297, tax: 0, total: 297, amountPaid: 0, dueDate: '2024-04-05', paidAt: null },
  { id: '5', invoiceNumber: 'INV-000005', customerName: 'David Lee', customerEmail: 'david@wayne.com', status: 'UNCOLLECTIBLE', subtotal: 299, tax: 0, total: 299, amountPaid: 0, dueDate: '2024-02-12', paidAt: null },
];

export default function InvoicesPage() {
  const columns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice',
      render: (item: typeof invoices[0]) => (
        <span className="text-sm font-medium text-violet-400">{item.invoiceNumber}</span>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (item: typeof invoices[0]) => (
        <div>
          <p className="text-sm font-medium text-white">{item.customerName}</p>
          <p className="text-xs text-slate-400">{item.customerEmail}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: typeof invoices[0]) => (
        <StatusBadge status={item.status} />
      ),
    },
    {
      key: 'total',
      label: 'Amount',
      render: (item: typeof invoices[0]) => (
        <span className="text-sm font-medium text-white">{formatCurrency(item.total)}</span>
      ),
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (item: typeof invoices[0]) => (
        <span className="text-sm text-slate-400">{formatDate(item.dueDate)}</span>
      ),
    },
    {
      key: 'paidAt',
      label: 'Paid At',
      render: (item: typeof invoices[0]) => (
        item.paidAt ? (
          <span className="text-sm text-emerald-400">{formatDate(item.paidAt)}</span>
        ) : (
          <span className="text-sm text-slate-500">—</span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <p className="text-slate-400 mt-1">Manage and track invoices</p>
        </div>
        <Button>
          <Plus className="w-4 h-4" />
          Create Invoice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: '$48,250', change: '+12%' },
          { label: 'Paid', value: '$42,100', change: '+8%' },
          { label: 'Pending', value: '$5,150', change: '+24%' },
          { label: 'Overdue', value: '$1,000', change: '-15%' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-xl border border-slate-800/50 bg-slate-900/50 p-4"
          >
            <p className="text-sm text-slate-400">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                {stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search invoices..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
          />
        </div>
        <select className="h-10 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50">
          <option>All Status</option>
          <option>Draft</option>
          <option>Open</option>
          <option>Paid</option>
          <option>Uncollectible</option>
        </select>
      </div>

      <DataTable data={invoices} columns={columns} />
    </div>
  );
}
