'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Pause, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApi, useApiPost } from '@/hooks/useApi';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';

interface Subscription {
  id: string;
  status: string;
  quantity: number;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
  customer: { user: { firstName: string; lastName: string; email: string } };
  plan: { name: string; basePrice: number };
}

export default function SubscriptionsPage() {
  const { data: subscriptions, loading, refetch } = useApi<Subscription[]>('/api/subscriptions');
  const [statusFilter, setStatusFilter] = React.useState('');
  const { post } = useApiPost();

  const filtered = (subscriptions || []).filter(s => !statusFilter || s.status === statusFilter);

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this subscription?')) return;
    try {
      await post(`/api/subscriptions/${id}`, { action: 'cancel' });
      refetch();
    } catch {}
  };

  const handlePause = async (id: string) => {
    try {
      await post(`/api/subscriptions/${id}`, { action: 'pause' });
      refetch();
    } catch {}
  };

  const handleResume = async (id: string) => {
    try {
      await post(`/api/subscriptions/${id}`, { action: 'resume' });
      refetch();
    } catch {}
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading subscriptions...</div>;

  const stats = {
    active: (subscriptions || []).filter(s => s.status === 'ACTIVE').length,
    trial: (subscriptions || []).filter(s => s.status === 'TRIALING').length,
    pastDue: (subscriptions || []).filter(s => s.status === 'PAST_DUE').length,
    cancelled: (subscriptions || []).filter(s => s.status === 'CANCELLED').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
          <p className="text-slate-400 mt-1">Manage all subscriptions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active', value: stats.active, color: 'text-emerald-400' },
          { label: 'Trial', value: stats.trial, color: 'text-violet-400' },
          { label: 'Past Due', value: stats.pastDue, color: 'text-amber-400' },
          { label: 'Cancelled', value: stats.cancelled, color: 'text-red-400' },
        ].map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
            className="rounded-xl border border-slate-800/50 bg-slate-900/50 p-4">
            <p className="text-sm text-slate-400">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Search..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="h-10 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50">
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="TRIALING">Trial</option>
          <option value="PAST_DUE">Past Due</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="PAUSED">Paused</option>
        </select>
      </div>

      <div className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/50">
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Customer</th>
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Plan</th>
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Status</th>
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Amount</th>
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Next Billing</th>
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub, index) => (
                <motion.tr key={sub.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <p className="text-sm font-medium text-white">{sub.customer.user.firstName} {sub.customer.user.lastName}</p>
                    <p className="text-xs text-slate-400">{sub.customer.user.email}</p>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-400 px-3 py-1 text-xs font-medium">
                      {sub.plan.name}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(sub.status)}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-medium text-white">{formatCurrency(sub.plan.basePrice * sub.quantity)}/mo</td>
                  <td className="p-4 text-sm text-slate-400">{sub.currentPeriodEnd ? formatDate(sub.currentPeriodEnd) : '—'}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {sub.status === 'ACTIVE' && (
                        <button onClick={() => handlePause(sub.id)} className="p-1.5 rounded-lg hover:bg-amber-500/10 text-amber-400 transition-colors" title="Pause">
                          <Pause className="w-4 h-4" />
                        </button>
                      )}
                      {sub.status === 'PAUSED' && (
                        <button onClick={() => handleResume(sub.id)} className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-400 transition-colors" title="Resume">
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      {(sub.status === 'ACTIVE' || sub.status === 'PAUSED') && (
                        <button onClick={() => handleCancel(sub.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors" title="Cancel">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-12 text-center text-slate-500">No subscriptions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
