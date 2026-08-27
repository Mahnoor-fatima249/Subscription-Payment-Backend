'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Mail, Clock, CheckCircle } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';

interface DunningRecord {
  id: string;
  attemptNumber: number;
  status: string;
  nextRetryAt: string | null;
  createdAt: string;
  invoice: { invoiceNumber: string; total: number; amountDue: number; customer: { user: { firstName: string; lastName: string; email: string } } };
}

export default function DunningPage() {
  const { data: dunning, loading } = useApi<DunningRecord[]>('/api/dunning');

  if (loading) return <div className="text-center py-20 text-slate-400">Loading dunning records...</div>;

  const stats = {
    total: (dunning || []).length,
    active: (dunning || []).filter(d => d.status === 'ACTIVE').length,
    recovered: (dunning || []).filter(d => d.status === 'RECOVERED').length,
    totalAtRisk: (dunning || []).filter(d => d.status === 'ACTIVE').reduce((sum, d) => sum + Number(d.invoice.amountDue), 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dunning Management</h1>
        <p className="text-slate-400 mt-1">Failed payment recovery tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Cases', value: stats.active, color: 'text-amber-400', icon: <AlertTriangle className="w-5 h-5" /> },
          { label: 'Recovered', value: stats.recovered, color: 'text-emerald-400', icon: <CheckCircle className="w-5 h-5" /> },
          { label: 'Total Cases', value: stats.total, color: 'text-violet-400', icon: <Clock className="w-5 h-5" /> },
          { label: 'At Risk Revenue', value: formatCurrency(stats.totalAtRisk), color: 'text-red-400', icon: <Mail className="w-5 h-5" /> },
        ].map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
            className="rounded-xl border border-slate-800/50 bg-slate-900/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color} bg-current/10`}>{stat.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/50">
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Customer</th>
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Invoice</th>
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Amount Due</th>
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Attempt</th>
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Status</th>
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Next Retry</th>
              </tr>
            </thead>
            <tbody>
              {(dunning || []).map((record, index) => (
                <motion.tr key={record.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <p className="text-sm font-medium text-white">{record.invoice.customer.user.firstName} {record.invoice.customer.user.lastName}</p>
                    <p className="text-xs text-slate-400">{record.invoice.customer.user.email}</p>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-violet-400 font-mono">{record.invoice.invoiceNumber}</span>
                  </td>
                  <td className="p-4 text-sm font-medium text-white">{formatCurrency(record.invoice.amountDue)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1">
                        {Array.from({ length: record.attemptNumber }, (_, i) => (
                          <div key={i} className="w-2 h-2 rounded-full bg-amber-500" />
                        ))}
                      </div>
                      <span className="text-sm text-slate-400">{record.attemptNumber}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-400">
                    {record.nextRetryAt ? formatDate(record.nextRetryAt) : '—'}
                  </td>
                </motion.tr>
              ))}
              {(dunning || []).length === 0 && (
                <tr><td colSpan={6} className="p-12 text-center text-slate-500">No dunning cases - all payments are healthy!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
