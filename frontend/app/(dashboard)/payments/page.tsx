'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, DollarSign, TrendingUp, AlertTriangle, CreditCard } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  stripePaymentIntentId: string | null;
  createdAt: string;
  customer: { company: string; user: { firstName: string; lastName: string; email: string } };
  invoice: { invoiceNumber: string } | null;
}

export default function PaymentsPage() {
  const { data: payments, loading } = useApi<Payment[]>('/api/payments');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [search, setSearch] = React.useState('');

  const filtered = (payments || []).filter(p => {
    if (statusFilter && p.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const fullName = `${p.customer.user.firstName} ${p.customer.user.lastName}`.toLowerCase();
      const email = p.customer.user.email.toLowerCase();
      const company = p.customer.company.toLowerCase();
      if (!fullName.includes(q) && !email.includes(q) && !company.includes(q)) return false;
    }
    return true;
  });

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center animate-pulse">
          <DollarSign className="w-5 h-5 text-white" />
        </div>
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">Loading payments...</p>
      </div>
    </div>
  );

  const stats = {
    total: (payments || []).reduce((sum, p) => sum + Number(p.amount), 0),
    succeeded: (payments || []).filter(p => p.status === 'SUCCEEDED').reduce((sum, p) => sum + Number(p.amount), 0),
    failed: (payments || []).filter(p => p.status === 'FAILED').length,
    count: (payments || []).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold">Payments</h1>
        <p style={{ color: 'var(--text-muted)' }} className="mt-1">A complete log of every payment — successful, failed, or refunded.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Volume', value: formatCurrency(stats.total), icon: <DollarSign className="w-5 h-5" />, color: 'text-emerald-400', bg: 'from-emerald-500/10 to-emerald-600/5' },
          { label: 'Succeeded', value: formatCurrency(stats.succeeded), icon: <TrendingUp className="w-5 h-5" />, color: 'text-sky-400', bg: 'from-sky-500/10 to-sky-600/5' },
          { label: 'Failed', value: stats.failed.toString(), icon: <AlertTriangle className="w-5 h-5" />, color: 'text-red-400', bg: 'from-red-500/10 to-red-600/5' },
          { label: 'Total Payments', value: stats.count.toString(), icon: <CreditCard className="w-5 h-5" />, color: 'text-violet-400', bg: 'from-violet-500/10 to-violet-600/5' },
        ].map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
            className={`rounded-2xl border border-slate-800/50 bg-gradient-to-br ${stat.bg} backdrop-blur-xl p-5`}>
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: 'var(--text-muted)' }} className="text-sm">{stat.label}</p>
                <p style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-slate-800/50 ${stat.color}`}>{stat.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search style={{ color: 'var(--text-muted)' }} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
          <input type="text" placeholder="Search payments..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
            className="w-full h-10 pl-10 pr-4 rounded-xl border text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
          className="h-10 px-4 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50">
          <option value="">All Status</option>
          <option value="SUCCEEDED">Succeeded</option>
          <option value="FAILED">Failed</option>
          <option value="PENDING">Pending</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      <div style={{ borderColor: 'var(--card-border)', background: 'linear-gradient(to bottom right, var(--card-bg-from), var(--card-bg-to))' }} className="rounded-2xl border backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderColor: 'var(--card-border)' }} className="border-b">
                <th style={{ color: 'var(--text-muted)' }} className="h-12 px-4 text-left text-sm font-medium">Customer</th>
                <th style={{ color: 'var(--text-muted)' }} className="h-12 px-4 text-left text-sm font-medium">Invoice</th>
                <th style={{ color: 'var(--text-muted)' }} className="h-12 px-4 text-left text-sm font-medium">Amount</th>
                <th style={{ color: 'var(--text-muted)' }} className="h-12 px-4 text-left text-sm font-medium">Status</th>
                <th style={{ color: 'var(--text-muted)' }} className="h-12 px-4 text-left text-sm font-medium">Stripe ID</th>
                <th style={{ color: 'var(--text-muted)' }} className="h-12 px-4 text-left text-sm font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((payment, index) => (
                <motion.tr key={payment.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}
                  style={{ borderColor: 'var(--card-border)' }}
                  className="border-b hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <p style={{ color: 'var(--text-primary)' }} className="text-sm font-medium">{payment.customer.user.firstName} {payment.customer.user.lastName}</p>
                    <p style={{ color: 'var(--text-muted)' }} className="text-xs">{payment.customer.user.email}</p>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-violet-400 font-mono">
                      {payment.invoice?.invoiceNumber || '—'}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{formatCurrency(payment.amount)}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                      {payment.stripePaymentIntentId ? payment.stripePaymentIntentId.slice(0, 20) + '...' : '—'}
                    </span>
                  </td>
                  <td className="p-4 text-sm" style={{ color: 'var(--text-muted)' }}>{formatDate(payment.createdAt)}</td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-12 text-center" style={{ color: 'var(--text-muted)' }}>
                  <div className="flex flex-col items-center gap-3">
                    <DollarSign className="w-12 h-12 text-slate-600" />
                    <p>No payments found</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
