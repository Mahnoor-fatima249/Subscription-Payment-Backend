'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Mail, Clock, CheckCircle, DollarSign } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';

interface DunningData {
  failedPayments: Array<{
    id: string;
    invoiceNumber: string;
    status: string;
    attemptCount: number;
    total: number;
    amountDue: number;
    nextPaymentAttempt: string | null;
    createdAt: string;
    customer: { user: { firstName: string; lastName: string; email: string } };
  }>;
  metrics: {
    totalFailed: number;
    totalAmount: number;
    recoveredThisMonth: number;
  };
}

export default function DunningPage() {
  const { data: dunning, loading } = useApi<DunningData>('/api/dunning');

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center animate-pulse">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <p className="text-slate-400 text-sm">Loading dunning records...</p>
      </div>
    </div>
  );

  const failedPayments = dunning?.failedPayments || [];
  const metrics = dunning?.metrics || { totalFailed: 0, totalAmount: 0, recoveredThisMonth: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dunning Management</h1>
        <p className="text-slate-400 mt-1">Failed payment recovery tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Cases', value: metrics.totalFailed, color: 'text-amber-400', icon: <AlertTriangle className="w-5 h-5" />, bg: 'from-amber-500/10 to-amber-600/5' },
          { label: 'Recovered This Month', value: metrics.recoveredThisMonth, color: 'text-emerald-400', icon: <CheckCircle className="w-5 h-5" />, bg: 'from-emerald-500/10 to-emerald-600/5' },
          { label: 'Total Cases', value: failedPayments.length, color: 'text-violet-400', icon: <Clock className="w-5 h-5" />, bg: 'from-violet-500/10 to-violet-600/5' },
          { label: 'At Risk Revenue', value: formatCurrency(Number(metrics.totalAmount)), color: 'text-red-400', icon: <DollarSign className="w-5 h-5" />, bg: 'from-red-500/10 to-red-600/5' },
        ].map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
            className={`rounded-2xl border border-slate-800/50 bg-gradient-to-br ${stat.bg} backdrop-blur-xl p-5`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-slate-800/50 ${stat.color}`}>{stat.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800/50">
          <h3 className="text-lg font-semibold text-white">Failed Payments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/50">
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Customer</th>
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Invoice</th>
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Amount Due</th>
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Attempts</th>
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Status</th>
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Next Retry</th>
              </tr>
            </thead>
            <tbody>
              {failedPayments.map((record, index) => (
                <motion.tr key={record.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <p className="text-sm font-medium text-white">{record.customer.user.firstName} {record.customer.user.lastName}</p>
                    <p className="text-xs text-slate-400">{record.customer.user.email}</p>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-violet-400 font-mono">{record.invoiceNumber}</span>
                  </td>
                  <td className="p-4 text-sm font-medium text-white">{formatCurrency(Number(record.amountDue))}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1">
                        {Array.from({ length: Math.min(record.attemptCount, 5) }, (_, i) => (
                          <div key={i} className="w-2 h-2 rounded-full bg-amber-500" />
                        ))}
                      </div>
                      <span className="text-sm text-slate-400">{record.attemptCount}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-400">
                    {record.nextPaymentAttempt ? formatDate(record.nextPaymentAttempt) : '—'}
                  </td>
                </motion.tr>
              ))}
              {failedPayments.length === 0 && (
                <tr><td colSpan={6} className="p-12 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-3">
                    <CheckCircle className="w-12 h-12 text-emerald-500/50" />
                    <p>No dunning cases - all payments are healthy!</p>
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
