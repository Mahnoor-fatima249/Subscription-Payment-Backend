'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, DollarSign, ArrowUpRight, RefreshCw, CreditCard } from 'lucide-react';
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
        <p className="text-slate-400 text-sm">Loading reports...</p>
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
          <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-slate-400 mt-1">Business intelligence dashboard</p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700/50 text-sm text-slate-300 hover:bg-slate-800/50 transition-colors">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Subscription Status Distribution</h3>
          <div className="space-y-4">
            {subsByStatus.length > 0 ? subsByStatus.map((item, index) => {
              const percentage = totalSubs > 0 ? (item.count / totalSubs) * 100 : 0;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">{item.status}</span>
                    <span className="text-white">{item.count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-800">
                    <div className="h-full rounded-full transition-all" style={{ width: `${percentage}%`, backgroundColor: COLORS[index % COLORS.length] }} />
                  </div>
                </div>
              );
            }) : (
              <div className="text-center text-slate-500 py-8">No subscription data yet</div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue by Plan</h3>
          <div className="space-y-4">
            {planData.length > 0 ? planData.map((plan, index) => {
              const maxSubs = Math.max(...planData.map(p => p.subscribers), 1);
              const percentage = (plan.subscribers / maxSubs) * 100;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">{plan.plan}</span>
                    <span className="text-white">{plan.subscribers} subscribers</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-800">
                    <div className="h-full rounded-full transition-all" style={{ width: `${percentage}%`, backgroundColor: COLORS[index % COLORS.length] }} />
                  </div>
                </div>
              );
            }) : (
              <div className="text-center text-slate-500 py-8">No plan data yet</div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Key Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400"><DollarSign className="w-4 h-4" /></div>
                <span className="text-sm text-slate-300">Average Revenue Per User</span>
              </div>
              <span className="text-sm font-semibold text-white">{formatCurrency(revenue.arpu)}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400"><CreditCard className="w-4 h-4" /></div>
                <span className="text-sm text-slate-300">Total Subscriptions</span>
              </div>
              <span className="text-sm font-semibold text-white">{totalSubs}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400"><BarChart3 className="w-4 h-4" /></div>
                <span className="text-sm text-slate-300">Active Plans</span>
              </div>
              <span className="text-sm font-semibold text-white">{planData.length}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400"><Users className="w-4 h-4" /></div>
                <span className="text-sm text-slate-300">Customer Base</span>
              </div>
              <span className="text-sm font-semibold text-white">{customers.total}</span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Overview</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border border-violet-500/20">
              <p className="text-sm text-slate-400 mb-1">Monthly Recurring Revenue</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(revenue.mrr)}</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-600/10 to-teal-600/10 border border-emerald-500/20">
              <p className="text-sm text-slate-400 mb-1">Annual Recurring Revenue</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(revenue.arr)}</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-r from-sky-600/10 to-blue-600/10 border border-sky-500/20">
              <p className="text-sm text-slate-400 mb-1">Total Revenue (30d)</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(revenue.totalRevenue)}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
