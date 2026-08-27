'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Users,
  Repeat,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { Chart, PieChartComponent } from '@/components/dashboard/chart';
import { StatusBadge, TrendIndicator } from '@/components/dashboard/data-table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';

const revenueData = [
  { month: 'Jan', revenue: 4500 },
  { month: 'Feb', revenue: 5200 },
  { month: 'Mar', revenue: 6100 },
  { month: 'Apr', revenue: 5800 },
  { month: 'May', revenue: 7200 },
  { month: 'Jun', revenue: 8100 },
  { month: 'Jul', revenue: 8900 },
  { month: 'Aug', revenue: 9500 },
];

const subscriptionData = [
  { name: 'Active', value: 1250 },
  { name: 'Trial', value: 180 },
  { name: 'Paused', value: 45 },
  { name: 'Cancelled', value: 89 },
];

const recentActivity = [
  { id: '1', type: 'subscription', message: 'New subscription created', user: 'John Doe', plan: 'Pro', amount: 99, time: '2 min ago', status: 'ACTIVE' },
  { id: '2', type: 'payment', message: 'Payment received', user: 'Sarah Wilson', plan: 'Enterprise', amount: 299, time: '15 min ago', status: 'SUCCEEDED' },
  { id: '3', type: 'invoice', message: 'Invoice generated', user: 'Mike Johnson', plan: 'Starter', amount: 29, time: '1 hour ago', status: 'OPEN' },
  { id: '4', type: 'subscription', message: 'Plan upgraded', user: 'Emily Brown', plan: 'Pro', amount: 99, time: '2 hours ago', status: 'ACTIVE' },
  { id: '5', type: 'payment', message: 'Payment failed', user: 'David Lee', plan: 'Enterprise', amount: 299, time: '3 hours ago', status: 'FAILED' },
];

const topPlans = [
  { name: 'Enterprise', subscribers: 342, revenue: 102258, growth: 12 },
  { name: 'Pro', subscribers: 567, revenue: 56133, growth: 8 },
  { name: 'Starter', subscribers: 234, revenue: 6786, growth: -2 },
  { name: 'Free', subscribers: 108, revenue: 0, growth: 5 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back! Here&apos;s what&apos;s happening.</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="h-10 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Monthly Revenue"
          value="$9,500"
          change={12}
          icon={<DollarSign className="w-6 h-6" />}
          color="violet"
        />
        <StatCard
          title="Active Customers"
          value="1,250"
          change={8}
          icon={<Users className="w-6 h-6" />}
          color="emerald"
        />
        <StatCard
          title="Active Subscriptions"
          value="1,568"
          change={15}
          icon={<Repeat className="w-6 h-6" />}
          color="sky"
        />
        <StatCard
          title="Churn Rate"
          value="2.4%"
          change={-0.5}
          icon={<TrendingUp className="w-6 h-6" />}
          color="amber"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Chart
            data={revenueData}
            xKey="month"
            yKey="revenue"
            title="Revenue Overview"
            type="area"
          />
        </div>
        <PieChartComponent
          data={subscriptionData}
          title="Subscription Status"
        />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <button className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/30 transition-colors"
              >
                <div className={`p-2 rounded-lg ${
                  activity.type === 'subscription' ? 'bg-violet-500/10 text-violet-400' :
                  activity.type === 'payment' ? 'bg-emerald-500/10 text-emerald-400' :
                  'bg-sky-500/10 text-sky-400'
                }`}>
                  {activity.type === 'subscription' ? <Repeat className="w-4 h-4" /> :
                   activity.type === 'payment' ? <CreditCard className="w-4 h-4" /> :
                   <Clock className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{activity.message}</p>
                  <p className="text-xs text-slate-400">{activity.user} · {activity.plan}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{formatCurrency(activity.amount)}</p>
                  <p className="text-xs text-slate-500">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Top Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Top Plans</h3>
            <button className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {topPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-violet-400">#{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{plan.name}</p>
                  <p className="text-xs text-slate-400">{plan.subscribers} subscribers</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{formatCurrency(plan.revenue)}</p>
                  <TrendIndicator value={plan.growth} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
