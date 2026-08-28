'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, DollarSign, CreditCard, RefreshCw } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { formatCurrency } from '@/lib/utils';

interface ReportData {
  revenue: { mrr: number; arr: number; arpu: number; totalRevenue: number };
  customers: { total: number; active: number };
  subscriptions: { byStatus: Array<{ status: string; count: number }> };
  revenueByPlan: Array<{ plan: string; subscribers: number }>;
}

export default function ReportsPage() {
  const { data: report, loading, refetch } = useApi<ReportData>('/api/reports');

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center animate-pulse">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">Loading reports...</p>
      </div>
    </div>
  );

  const revenue = report?.revenue || { mrr: 0, arr: 0, arpu: 0, totalRevenue: 0 };
  const customers = report?.customers || { total: 0, active: 0 };
  const subsByStatus = report?.subscriptions?.byStatus || [];
  const planData = report?.revenueByPlan || [];
  const totalSubs = subsByStatus.reduce((sum, s) => sum + s.count, 0);
  const COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#22d3ee', '#10b981'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold">Reports & Analytics</h1>
          <p style={{ color: 'var(--text-muted)' }} className="mt-1">A bird's eye view of how your business is growing.</p>
        </div>
        <button onClick={() => refetch()} style={{ borderColor: 'var(--input-border)', color: 'var(--text-secondary)' }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm hover:opacity-80 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'MRR', value: formatCurrency(revenue.mrr), icon: <DollarSign className="w-5 h-5" />, color: 'text-emerald-400', bg: 'from-emerald-500/10 to-emerald-600/5' },
          { label: 'ARR', value: formatCurrency(revenue.arr), icon: <TrendingUp className="w-5 h-5" />, color: 'text-violet-400', bg: 'from-violet-500/10 to-violet-600/5' },
          { label: 'Active Subs', value: customers.active.toString(), icon: <CreditCard className="w-5 h-5" />, color: 'text-sky-400', bg: 'from-sky-500/10 to-sky-600/5' },
          { label: 'Total Customers', value: customers.total.toString(), icon: <Users className="w-5 h-5" />, color: 'text-amber-400', bg: 'from-amber-500/10 to-amber-600/5' },
        ].map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
            style={{ backgroundColor: 'var(--stat-card-bg)', borderColor: 'var(--card-border)' }}
            className={`rounded-2xl border bg-gradient-to-br ${stat.bg} p-5`}>
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: 'var(--text-muted)' }} className="text-sm">{stat.label}</p>
                <p style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-black/5 dark:bg-white/5 ${stat.color}`}>{stat.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ backgroundColor: 'var(--card-bg-from)', borderColor: 'var(--card-border)' }}
          className="rounded-2xl border p-6">
          <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-semibold mb-4">Subscription Status Distribution</h3>
          <div className="space-y-4">
            {subsByStatus.length > 0 ? subsByStatus.map((item, index) => {
              const percentage = totalSubs > 0 ? (item.count / totalSubs) * 100 : 0;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>{item.status}</span>
                    <span style={{ color: 'var(--text-primary)' }}>{item.count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div style={{ backgroundColor: 'var(--input-bg)' }} className="w-full h-3 rounded-full">
                    <div className="h-full rounded-full transition-all" style={{ width: `${percentage}%`, backgroundColor: COLORS[index % COLORS.length] }} />
                  </div>
                </div>
              );
            }) : (
              <div style={{ color: 'var(--text-muted)' }} className="text-center py-8">No subscription data yet</div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ backgroundColor: 'var(--card-bg-from)', borderColor: 'var(--card-border)' }}
          className="rounded-2xl border p-6">
          <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-semibold mb-4">Revenue by Plan</h3>
          <div className="space-y-4">
            {planData.length > 0 ? planData.map((plan, index) => {
              const maxSubs = Math.max(...planData.map(p => p.subscribers), 1);
              const percentage = (plan.subscribers / maxSubs) * 100;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>{plan.plan}</span>
                    <span style={{ color: 'var(--text-primary)' }}>{plan.subscribers} subscribers</span>
                  </div>
                  <div style={{ backgroundColor: 'var(--input-bg)' }} className="w-full h-3 rounded-full">
                    <div className="h-full rounded-full transition-all" style={{ width: `${percentage}%`, backgroundColor: COLORS[index % COLORS.length] }} />
                  </div>
                </div>
              );
            }) : (
              <div style={{ color: 'var(--text-muted)' }} className="text-center py-8">No plan data yet</div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ backgroundColor: 'var(--card-bg-from)', borderColor: 'var(--card-border)' }}
          className="rounded-2xl border p-6">
          <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-semibold mb-4">Key Metrics</h3>
          <div className="space-y-4">
            {[
              { label: 'Average Revenue Per User', value: formatCurrency(revenue.arpu), icon: <DollarSign className="w-4 h-4" />, color: 'text-emerald-400' },
              { label: 'Total Subscriptions', value: totalSubs.toString(), icon: <CreditCard className="w-4 h-4" />, color: 'text-sky-400' },
              { label: 'Active Plans', value: planData.length.toString(), icon: <BarChart3 className="w-4 h-4" />, color: 'text-violet-400' },
              { label: 'Customer Base', value: customers.total.toString(), icon: <Users className="w-4 h-4" />, color: 'text-amber-400' },
            ].map((item) => (
              <div key={item.label} style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--card-border)' }}
                className="flex items-center justify-between p-4 rounded-xl border">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-black/5 dark:bg-white/5 ${item.color}`}>{item.icon}</div>
                  <span style={{ color: 'var(--text-secondary)' }} className="text-sm">{item.label}</span>
                </div>
                <span style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          style={{ backgroundColor: 'var(--card-bg-from)', borderColor: 'var(--card-border)' }}
          className="rounded-2xl border p-6">
          <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-semibold mb-4">Revenue Overview</h3>
          <div className="space-y-4">
            {[
              { label: 'Monthly Recurring Revenue', value: formatCurrency(revenue.mrr), gradient: 'from-violet-600/10 to-indigo-600/10', border: 'border-violet-500/20' },
              { label: 'Annual Recurring Revenue', value: formatCurrency(revenue.arr), gradient: 'from-emerald-600/10 to-teal-600/10', border: 'border-emerald-500/20' },
              { label: 'Total Revenue (30d)', value: formatCurrency(revenue.totalRevenue), gradient: 'from-sky-600/10 to-blue-600/10', border: 'border-sky-500/20' },
            ].map((item) => (
              <div key={item.label} className={`p-4 rounded-xl bg-gradient-to-r ${item.gradient} border ${item.border}`}>
                <p style={{ color: 'var(--text-muted)' }} className="text-sm mb-1">{item.label}</p>
                <p style={{ color: 'var(--text-primary)' }} className="text-3xl font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
