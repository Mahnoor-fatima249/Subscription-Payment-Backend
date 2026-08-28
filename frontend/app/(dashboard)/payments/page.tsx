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
  customer: { user: { firstName: string; lastName: string; email: string } };
  invoice: { invoiceNumber: string } | null;
}

export default function PaymentsPage() {
  const { data: payments, loading } = useApi<Payment[]>('/api/payments');
  const [statusFilter, setStatusFilter] = React.useState('');

  const filtered = (payments || []).filter(p => !statusFilter || p.status === statusFilter);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center animate-pulse">
          <DollarSign className="w-5 h-5 text-white" />
        </div>
        <p className="text-slate-400 text-sm">Loading payments...</p>
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
        <h1 className="text-2xl font-bold text-white">Payments</h1>
        <p className="text-slate-400 mt-1">Track all payment transactions</p>
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
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-slate-800/50 ${stat.color}`}>{stat.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Search payments..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="h-10 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50">
          <option value="">All Status</option>
          <option value="SUCCEEDED">Succeeded</option>
          <option value="FAILED">Failed</option>
          <option value="PENDING">Pending</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      <div className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/50">
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Customer</th>
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Invoice</th>
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Amount</th>
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Status</th>
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Stripe ID</th>
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((payment, index) => (
                <motion.tr key={payment.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <p className="text-sm font-medium text-white">{payment.customer.user.firstName} {payment.customer.user.lastName}</p>
                    <p className="text-xs text-slate-400">{payment.customer.user.email}</p>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-violet-400 font-mono">
                      {payment.invoice?.invoiceNumber || '—'}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-medium text-white">{formatCurrency(payment.amount)}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs text-slate-500 font-mono">
                      {payment.stripePaymentIntentId ? payment.stripePaymentIntentId.slice(0, 20) + '...' : '—'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-400">{formatDate(payment.createdAt)}</td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-12 text-center text-slate-500">
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
