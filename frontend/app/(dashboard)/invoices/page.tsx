'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, Send } from 'lucide-react';
import { useApi, useApiPost } from '@/hooks/useApi';
import { formatCurrency, getStatusColor } from '@/lib/utils';

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  amountPaid: number;
  amountDue: number;
  customer: {
    company: string;
    user: { firstName: string; lastName: string; email: string };
  };
  subscription: { plan: { name: string } };
}

export default function InvoicesPage() {
  const { data: invoices, loading, refetch } = useApi<Invoice[]>('/api/invoices');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [search, setSearch] = React.useState('');
  const { post } = useApiPost();

  const filtered = (invoices || []).filter(i => {
    if (statusFilter && i.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = `${i.customer.user.firstName} ${i.customer.user.lastName}`.toLowerCase();
      const email = i.customer.user.email.toLowerCase();
      const num = i.invoiceNumber.toLowerCase();
      if (!num.includes(q) && !name.includes(q) && !email.includes(q)) return false;
    }
    return true;
  });

  const handleAction = async (id: string, action: string) => {
    if (!confirm(`Are you sure you want to ${action} this invoice?`)) return;
    try {
      await post(`/api/invoices/${id}`, { action });
      refetch();
    } catch {}
  };

  if (loading) return <div style={{ color: 'var(--text-muted)' }} className="text-center py-20">Loading your invoices...</div>;

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
          <h1 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold">Invoices</h1>
          <p style={{ color: 'var(--text-muted)' }} className="mt-1">Every invoice in one place — see who's paid, who hasn't, and what's pending.</p>
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
            style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--stat-card-bg)' }}
            className="rounded-xl border p-4">
            <p style={{ color: 'var(--text-muted)' }} className="text-sm">{stat.label}</p>
            <p style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search style={{ color: 'var(--text-muted)' }} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
          <input type="text" placeholder="Search by invoice number or customer name..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
            className="w-full h-10 pl-10 pr-4 rounded-xl border text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
          className="h-10 px-4 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50">
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="OPEN">Open</option>
          <option value="PAID">Paid</option>
          <option value="VOID">Void</option>
        </select>
      </div>

      <div style={{ borderColor: 'var(--card-border)', background: 'linear-gradient(to bottom right, var(--card-bg-from), var(--card-bg-to))' }} className="rounded-2xl border backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderColor: 'var(--card-border)' }} className="border-b">
                <th style={{ color: 'var(--text-muted)' }} className="h-12 px-4 text-left text-sm font-medium">Invoice</th>
                <th style={{ color: 'var(--text-muted)' }} className="h-12 px-4 text-left text-sm font-medium">Customer</th>
                <th style={{ color: 'var(--text-muted)' }} className="h-12 px-4 text-left text-sm font-medium">Status</th>
                <th style={{ color: 'var(--text-muted)' }} className="h-12 px-4 text-left text-sm font-medium">Amount</th>
                <th style={{ color: 'var(--text-muted)' }} className="h-12 px-4 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((invoice, index) => (
                <motion.tr key={invoice.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}
                  style={{ borderColor: 'var(--card-border)' }}
                  className="border-b hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <span className="text-sm font-medium text-violet-400">{invoice.invoiceNumber}</span>
                  </td>
                  <td className="p-4">
                    <p style={{ color: 'var(--text-primary)' }} className="text-sm font-medium">{invoice.customer.user.firstName} {invoice.customer.user.lastName}</p>
                    <p style={{ color: 'var(--text-muted)' }} className="text-xs">{invoice.customer.user.email}</p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0) + invoice.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{formatCurrency(invoice.total)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {invoice.status === 'DRAFT' && (
                        <button onClick={() => handleAction(invoice.id, 'finalize')} className="p-1.5 rounded-lg hover:bg-sky-500/10 text-sky-400 transition-colors" title="Finalize">
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      {invoice.status === 'OPEN' && (
                        <button onClick={() => handleAction(invoice.id, 'pay')} className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-400 transition-colors" title="Mark as paid">
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
                <tr><td colSpan={5} className="p-12 text-center" style={{ color: 'var(--text-muted)' }}>No invoices match your search — try something else.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
