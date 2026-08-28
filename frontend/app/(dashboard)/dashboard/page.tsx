'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight, Bell, Check, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { formatCurrency } from '@/lib/utils';

interface DashboardData {
  revenue: { mrr: number; arr: number; arpu: number; totalRevenue: number };
  customers: { total: number; active: number };
  subscriptions: { byStatus: Array<{ status: string; count: number }> };
  revenueByPlan: Array<{ plan: string; subscribers: number }>;
}

export default function DashboardPage() {
  const { data: dashboard, loading } = useApi<DashboardData>('/api/reports');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; type: string; message: string; read: boolean }>>([
    { id: '1', type: 'success', message: 'Payment received from John Doe - $99.00', read: false },
    { id: '2', type: 'warning', message: 'Subscription past due for Jane Smith', read: false },
    { id: '3', type: 'info', message: 'New customer registered: bob@example.com', read: false },
  ]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center animate-pulse">
          <DollarSign className="w-5 h-5 text-white" />
        </div>
        <p className="text-slate-400 text-sm">Loading dashboard...</p>
      </div>
    </div>
  );

  const mrr = dashboard?.revenue?.mrr || 0;
  const activeSubs = dashboard?.customers?.active || 0;
  const totalCustomers = dashboard?.customers?.total || 0;
  const arr = dashboard?.revenue?.arr || 0;
  const arpu = dashboard?.revenue?.arpu || 0;
  const subsByStatus = dashboard?.subscriptions?.byStatus || [];
  const planData = dashboard?.revenueByPlan || [];
  const totalSubs = subsByStatus.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back! Here&apos;s your business overview.</p>
        </div>
        <div className="relative">
          <button onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl border border-slate-700/50 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 transition-colors">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-violet-600 text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-12 w-96 rounded-2xl border border-slate-800/50 bg-slate-900/95 backdrop-blur-xl shadow-2xl z-50">
              <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
                <h3 className="font-semibold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map(notif => (
                  <div key={notif.id} onClick={() => markAsRead(notif.id)}
                    className={`flex items-start gap-3 p-4 border-b border-slate-800/50 hover:bg-slate-800/50 cursor-pointer transition-colors ${!notif.read ? 'bg-violet-500/5' : ''}`}>
                    <div className={`p-2 rounded-lg ${notif.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : notif.type === 'warning' ? 'bg-amber-500/10 text-amber-400' : 'bg-sky-500/10 text-sky-400'}`}>
                      {notif.type === 'success' ? <CheckCircle className="w-4 h-4" /> : notif.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notif.read ? 'text-white' : 'text-slate-300'}`}>{notif.message}</p>
                      <p className="text-xs text-slate-500 mt-1">Just now</p>
                    </div>
                    {!notif.read && <div className="w-2 h-2 rounded-full bg-violet-500 mt-2" />}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'MRR', value: formatCurrency(mrr), icon: <DollarSign className="w-5 h-5" />, color: 'text-emerald-400', bg: 'from-emerald-500/10 to-emerald-600/5' },
          { label: 'Active Subscriptions', value: activeSubs.toString(), icon: <CreditCard className="w-5 h-5" />, color: 'text-sky-400', bg: 'from-sky-500/10 to-sky-600/5' },
          { label: 'Total Customers', value: totalCustomers.toString(), icon: <Users className="w-5 h-5" />, color: 'text-violet-400', bg: 'from-violet-500/10 to-violet-600/5' },
          { label: 'ARR', value: formatCurrency(arr), icon: <TrendingUp className="w-5 h-5" />, color: 'text-amber-400', bg: 'from-amber-500/10 to-amber-600/5' },
        ].map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
            className={`rounded-2xl border border-slate-800/50 bg-gradient-to-br ${stat.bg} backdrop-blur-xl p-5 hover:border-violet-500/30 transition-all duration-300`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-xl bg-slate-800/50 ${stat.color}`}>{stat.icon}</div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-sm text-slate-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Subscription Status</h3>
          <div className="space-y-4">
            {subsByStatus.length > 0 ? subsByStatus.map((item, index) => {
              const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#6366f1'];
              const percentage = totalSubs > 0 ? (item.count / totalSubs) * 100 : 0;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">{item.status}</span>
                    <span className="text-white">{item.count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800">
                    <div className="h-full rounded-full transition-all" style={{ width: `${percentage}%`, backgroundColor: COLORS[index % COLORS.length] }} />
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-8 text-slate-500">No subscription data yet</div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue by Plan</h3>
          <div className="space-y-4">
            {planData.length > 0 ? planData.map((plan, index) => {
              const maxSubs = Math.max(...planData.map(p => p.subscribers), 1);
              const COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#22d3ee', '#10b981'];
              const percentage = (plan.subscribers / maxSubs) * 100;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">{plan.plan}</span>
                    <span className="text-white">{plan.subscribers} subscribers</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800">
                    <div className="h-full rounded-full transition-all" style={{ width: `${percentage}%`, backgroundColor: COLORS[index % COLORS.length] }} />
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-8 text-slate-500">No plan data yet</div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30">
              <span className="text-sm text-slate-400">ARPU</span>
              <span className="text-sm font-semibold text-white">{formatCurrency(arpu)}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30">
              <span className="text-sm text-slate-400">Total Subscriptions</span>
              <span className="text-sm font-semibold text-white">{totalSubs}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30">
              <span className="text-sm text-slate-400">Active Plans</span>
              <span className="text-sm font-semibold text-white">{planData.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30">
              <span className="text-sm text-slate-400">Revenue (30d)</span>
              <span className="text-sm font-semibold text-white">{formatCurrency(mrr)}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
