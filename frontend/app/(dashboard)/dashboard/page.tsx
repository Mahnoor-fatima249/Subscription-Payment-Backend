'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, CreditCard, TrendingUp, Bell, AlertTriangle, CheckCircle } from 'lucide-react';
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
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">Crunching the numbers for you...</p>
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
          <h1 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold">Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }} className="mt-1">Here&apos;s what&apos;s happening with your business today.</p>
        </div>
        <div className="relative">
          <button onClick={() => setShowNotifications(!showNotifications)}
            style={{ borderColor: 'var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-secondary)' }}
            className="relative p-2.5 rounded-xl border hover:opacity-80 transition-colors">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-violet-600 text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ backgroundColor: 'var(--card-bg-from)', borderColor: 'var(--card-border)' }}
              className="absolute right-0 top-12 w-96 rounded-2xl border shadow-2xl z-50">
              <div style={{ borderBottomColor: 'var(--card-border)' }} className="flex items-center justify-between p-4 border-b">
                <h3 style={{ color: 'var(--text-primary)' }} className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map(notif => (
                  <div key={notif.id} onClick={() => markAsRead(notif.id)}
                    style={{ borderBottomColor: 'var(--card-border)' }}
                    className={`flex items-start gap-3 p-4 border-b hover:opacity-80 cursor-pointer transition-colors ${!notif.read ? 'bg-violet-500/5' : ''}`}>
                    <div className={`p-2 rounded-lg ${notif.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : notif.type === 'warning' ? 'bg-amber-500/10 text-amber-400' : 'bg-sky-500/10 text-sky-400'}`}>
                      {notif.type === 'success' ? <CheckCircle className="w-4 h-4" /> : notif.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ color: 'var(--text-primary)' }} className={`text-sm ${!notif.read ? 'font-medium' : ''}`}>{notif.message}</p>
                      <p style={{ color: 'var(--text-muted)' }} className="text-xs mt-1">Just now</p>
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
          { label: 'ARPU', value: formatCurrency(arpu), icon: <TrendingUp className="w-5 h-5" />, color: 'text-amber-400', bg: 'from-amber-500/10 to-amber-600/5' },
        ].map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
            style={{ backgroundColor: 'var(--stat-card-bg)', borderColor: 'var(--card-border)' }}
            className={`rounded-2xl border bg-gradient-to-br ${stat.bg} p-5 hover:opacity-90 transition-all duration-300`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-xl bg-black/5 dark:bg-white/5 ${stat.color}`}>{stat.icon}</div>
            </div>
            <p style={{ color: 'var(--text-primary)' }} className="text-3xl font-bold mb-1">{stat.value}</p>
            <p style={{ color: 'var(--text-muted)' }} className="text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ backgroundColor: 'var(--card-bg-from)', borderColor: 'var(--card-border)' }}
          className="rounded-2xl border p-6">
          <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-semibold mb-4">Subscription Status</h3>
          <div className="space-y-4">
            {subsByStatus.length > 0 ? subsByStatus.map((item, index) => {
              const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#6366f1'];
              const percentage = totalSubs > 0 ? (item.count / totalSubs) * 100 : 0;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>{item.status}</span>
                    <span style={{ color: 'var(--text-primary)' }}>{item.count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div style={{ backgroundColor: 'var(--input-bg)' }} className="w-full h-2.5 rounded-full">
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
              const COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#22d3ee', '#10b981'];
              const percentage = (plan.subscribers / maxSubs) * 100;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>{plan.plan}</span>
                    <span style={{ color: 'var(--text-primary)' }}>{plan.subscribers} subscribers</span>
                  </div>
                  <div style={{ backgroundColor: 'var(--input-bg)' }} className="w-full h-2.5 rounded-full">
                    <div className="h-full rounded-full transition-all" style={{ width: `${percentage}%`, backgroundColor: COLORS[index % COLORS.length] }} />
                  </div>
                </div>
              );
            }) : (
              <div style={{ color: 'var(--text-muted)' }} className="text-center py-8">No plan data yet</div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ backgroundColor: 'var(--card-bg-from)', borderColor: 'var(--card-border)' }}
          className="rounded-2xl border p-6">
          <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-4">
            {[
              { label: 'Total Subscriptions', value: totalSubs.toString() },
              { label: 'Active Plans', value: planData.length.toString() },
            ].map((item) => (
              <div key={item.label} style={{ backgroundColor: 'var(--input-bg)' }} className="flex items-center justify-between p-3 rounded-xl">
                <span style={{ color: 'var(--text-muted)' }} className="text-sm">{item.label}</span>
                <span style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
