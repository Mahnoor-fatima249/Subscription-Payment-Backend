'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, DollarSign, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { formatCurrency } from '@/lib/utils';
import { Bar, Line, Pie } from 'recharts';

interface ReportData {
  overview: { mrr: number; arr: number; activeSubscriptions: number; totalCustomers: number; mrrGrowth: number; churnRate: number };
  revenue: Array<{ month: string; mrr: number; newRevenue: number; churnedRevenue: number }>;
  planDistribution: Array<{ planName: string; count: number; revenue: number }>;
  churn: { churnRate: number; churnedCount: number; totalStart: number };
}

export default function ReportsPage() {
  const { data: report, loading, refetch } = useApi<ReportData>('/api/reports');

  if (loading) return <div className="text-center py-20 text-slate-400">Loading reports...</div>;

  const overview = report?.overview;
  const revenue = report?.revenue || [];
  const planDistribution = report?.planDistribution || [];

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'MRR', value: formatCurrency(overview?.mrr || 0), icon: <DollarSign className="w-5 h-5" />, color: 'text-emerald-400', change: `+${overview?.mrrGrowth || 0}%` },
          { label: 'ARR', value: formatCurrency(overview?.arr || 0), icon: <TrendingUp className="w-5 h-5" />, color: 'text-violet-400' },
          { label: 'Active Subs', value: overview?.activeSubscriptions || 0, icon: <Users className="w-5 h-5" />, color: 'text-sky-400' },
          { label: 'Churn Rate', value: `${overview?.churnRate || 0}%`, icon: <BarChart3 className="w-5 h-5" />, color: 'text-amber-400' },
        ].map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
            className="rounded-xl border border-slate-800/50 bg-slate-900/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                {stat.change && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 mt-1">
                    <ArrowUpRight className="w-3 h-3" /> {stat.change}
                  </span>
                )}
              </div>
              <div className={`p-3 rounded-xl bg-current/10 ${stat.color}`}>{stat.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend</h3>
          <div className="h-64">
            {revenue.length > 0 ? (
              <div className="h-full flex items-end gap-1">
                {revenue.map((r, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t bg-gradient-to-t from-violet-600 to-indigo-600 transition-all hover:from-violet-500 hover:to-indigo-500"
                      style={{ height: `${Math.max((r.mrr / Math.max(...revenue.map(x => x.mrr), 1)) * 200, 4)}px` }} />
                    <span className="text-[10px] text-slate-500">{r.month.slice(-2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">No data yet</div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Plan Distribution</h3>
          <div className="space-y-4">
            {planDistribution.length > 0 ? planDistribution.map((plan, index) => {
              const total = planDistribution.reduce((sum, p) => sum + p.count, 0);
              const percentage = total > 0 ? (plan.count / total) * 100 : 0;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">{plan.planName}</span>
                    <span className="text-white">{plan.count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800">
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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Revenue History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/50">
                <th className="h-10 px-4 text-left text-xs font-medium text-slate-400">Month</th>
                <th className="h-10 px-4 text-right text-xs font-medium text-slate-400">MRR</th>
                <th className="h-10 px-4 text-right text-xs font-medium text-slate-400">New Revenue</th>
                <th className="h-10 px-4 text-right text-xs font-medium text-slate-400">Churned</th>
              </tr>
            </thead>
            <tbody>
              {revenue.map((r, index) => (
                <tr key={index} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-sm font-medium text-white">{r.month}</td>
                  <td className="p-4 text-sm text-right text-white">{formatCurrency(r.mrr)}</td>
                  <td className="p-4 text-sm text-right text-emerald-400">+{formatCurrency(r.newRevenue)}</td>
                  <td className="p-4 text-sm text-right text-red-400">-{formatCurrency(r.churnedRevenue)}</td>
                </tr>
              ))}
              {revenue.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">No revenue data yet. Data will appear as subscriptions are created.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
