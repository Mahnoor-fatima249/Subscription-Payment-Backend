'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, CheckCircle, XCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApi, useApiPost } from '@/hooks/useApi';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
  customer: { user: { firstName: string; lastName: string; email: string } };
}

export default function InvoicesPage() {
  const { data: invoices, loading, refetch } = useApi<Invoice[]>('/api/invoices');
  const [statusFilter, setStatusFilter] = React.useState('');
  const { post } = useApiPost();

  const filtered = (invoices || []).filter(i => !statusFilter || i.status === statusFilter);

  const handleAction = async (id: string, action: string) => {
    if (!confirm(`${action} this invoice?`)) return;
    try {
      await post(`/api/invoices/${id}`, { action });
      refetch();
    } catch {}
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading invoices...</div>;

  const stats = {
    total: (invoices || []).reduce((sum, i) => sum + Number(i.total), 0),
    paid: (invoices || []).filter(i => i.status === 'PAID').reduce((sum, i) => sum + Number(i.amountPaid), 0),
    pending: (invoices || []).filter(i => i.status === 'OPEN').reduce((sum, i) => sum + Number(i.amountDue), 0),
    count: (invoices || []).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <p className="text-slate-400 mt-1">Manage and track invoices</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(stats.total) },
          { label: 'Paid', value: formatCurrency(stats.paid) },
          { label: 'Pending', value: formatCurrency(stats.pending) },
          { label: 'Total Invoices', value: stats.count.toString() },
        ].map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
            className="rounded-xl border border-slate-800/50 bg-slate-900/50 p-4">
            <p className="text-sm text-slate-400">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Search invoices..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="h-10 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50">
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="OPEN">Open</option>
          <option value="PAID">Paid</option>
          <option value="VOID">Void</option>
        </select>
      </div>

      <div className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/50">
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Invoice</th>
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Customer</th>
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Status</th>
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Amount</th>
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Due Date</th>
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((invoice, index) => (
                <motion.tr key={invoice.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <span className="text-sm font-medium text-violet-400">{invoice.invoiceNumber}</span>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-medium text-white">{invoice.customer.user.firstName} {invoice.customer.user.lastName}</p>
                    <p className="text-xs text-slate-400">{invoice.customer.user.email}</p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-medium text-white">{formatCurrency(invoice.total)}</td>
                  <td className="p-4 text-sm text-slate-400">{invoice.dueDate ? formatDate(invoice.dueDate) : '—'}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {invoice.status === 'DRAFT' && (
                        <button onClick={() => handleAction(invoice.id, 'finalize')} className="p-1.5 rounded-lg hover:bg-sky-500/10 text-sky-400 transition-colors" title="Finalize">
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      {invoice.status === 'OPEN' && (
                        <button onClick={() => handleAction(invoice.id, 'pay')} className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-400 transition-colors" title="Mark Paid">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {invoice.status !== 'PAID' && invoice.status !== 'VOID' && (
                        <button onClick={() => handleAction(invoice.id, 'void')} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors" title="Void">
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-12 text-center text-slate-500">No invoices found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
