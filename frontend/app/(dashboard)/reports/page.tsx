'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Repeat, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Chart, PieChartComponent } from '@/components/dashboard/chart';
import { StatCard } from '@/components/dashboard/stat-card';
import { formatCurrency } from '@/lib/utils';

const revenueByMonth = [
  { month: 'Jan', revenue: 45000, subscriptions: 1200 },
  { month: 'Feb', revenue: 52000, subscriptions: 1350 },
  { month: 'Mar', revenue: 61000, subscriptions: 1500 },
  { month: 'Apr', revenue: 58000, subscriptions: 1420 },
  { month: 'May', revenue: 72000, subscriptions: 1680 },
  { month: 'Jun', revenue: 81000, subscriptions: 1850 },
];

const revenueByPlan = [
  { name: 'Enterprise', value: 102258 },
  { name: 'Pro', value: 56133 },
  { name: 'Starter', value: 6786 },
  { name: 'Free', value: 0 },
];

const churnData = [
  { month: 'Jan', churned: 25, new: 45 },
  { month: 'Feb', churned: 18, new: 52 },
  { month: 'Mar', churned: 32, new: 61 },
  { month: 'Apr', churned: 22, new: 58 },
  { month: 'May', churned: 28, new: 72 },
  { month: 'Jun', churned: 20, new: 81 },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
        <p className="text-slate-400 mt-1">Track your business metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Annual Recurring Revenue"
          value="$114K"
          change={18}
          icon={<DollarSign className="w-6 h-6" />}
          color="violet"
        />
        <StatCard
          title="Monthly Recurring Revenue"
          value="$9,500"
          change={12}
          icon={<TrendingUp className="w-6 h-6" />}
          color="emerald"
        />
        <StatCard
          title="Customer Lifetime Value"
          value="$2,450"
          change={8}
          icon={<Users className="w-6 h-6" />}
          color="sky"
        />
        <StatCard
          title="Churn Rate"
          value="2.4%"
          change={-0.5}
          icon={<Repeat className="w-6 h-6" />}
          color="amber"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Chart
          data={revenueByMonth}
          xKey="month"
          yKey="revenue"
          title="Revenue Growth"
          type="area"
        />
        <Chart
          data={churnData}
          xKey="month"
          yKey="new"
          title="New vs Churned Customers"
          type="bar"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PieChartComponent
          data={revenueByPlan}
          title="Revenue by Plan"
        />
        
        {/* Top Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2 rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Key Metrics</h3>
          <div className="grid grid-cols-2 gap-6">
            {[
              { label: 'Average Revenue Per User', value: formatCurrency(7.6), change: 5 },
              { label: 'Net Revenue Retention', value: '112%', change: 3 },
              { label: 'Customer Acquisition Cost', value: formatCurrency(125), change: -8 },
              { label: 'Payback Period', value: '3.2 months', change: -12 },
              { label: 'Active Subscriptions', value: '1,568', change: 15 },
              { label: 'Trial Conversion Rate', value: '24%', change: 2 },
            ].map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30"
              >
                <p className="text-sm text-slate-400">{metric.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-xl font-bold text-white">{metric.value}</p>
                  <span className={`text-xs font-medium ${metric.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {metric.change >= 0 ? '+' : ''}{metric.change}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
