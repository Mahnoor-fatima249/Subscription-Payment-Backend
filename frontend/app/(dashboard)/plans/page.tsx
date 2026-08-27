'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, CreditCard, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { DataTable, StatusBadge } from '@/components/dashboard/data-table';
import { formatCurrency } from '@/lib/utils';

const plans = [
  { id: '1', name: 'Starter', slug: 'starter', billingModel: 'FLAT_RATE', billingInterval: 'MONTHLY', basePrice: 29, currency: 'usd', isActive: true, subscribers: 234, features: ['5 Projects', '10GB Storage', 'Email Support'], sortOrder: 1 },
  { id: '2', name: 'Pro', slug: 'pro', billingModel: 'FLAT_RATE', billingInterval: 'MONTHLY', basePrice: 99, currency: 'usd', isActive: true, subscribers: 567, features: ['Unlimited Projects', '100GB Storage', 'Priority Support', 'API Access'], sortOrder: 2 },
  { id: '3', name: 'Enterprise', slug: 'enterprise', billingModel: 'PER_SEAT', billingInterval: 'MONTHLY', basePrice: 299, currency: 'usd', isActive: true, subscribers: 342, features: ['Unlimited Everything', '1TB Storage', '24/7 Support', 'Custom Integrations', 'SLA'], sortOrder: 3 },
  { id: '4', name: 'Free', slug: 'free', billingModel: 'FLAT_RATE', billingInterval: 'MONTHLY', basePrice: 0, currency: 'usd', isActive: true, subscribers: 108, features: ['1 Project', '1GB Storage', 'Community Support'], sortOrder: 0 },
];

const planIcons = [
  { icon: <Zap className="w-5 h-5" />, color: 'text-sky-400 bg-sky-500/10' },
  { icon: <CreditCard className="w-5 h-5" />, color: 'text-violet-400 bg-violet-500/10' },
  { icon: <Users className="w-5 h-5" />, color: 'text-emerald-400 bg-emerald-500/10' },
  { icon: <Zap className="w-5 h-5" />, color: 'text-amber-400 bg-amber-500/10' },
];

export default function PlansPage() {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Plans</h1>
          <p className="text-slate-400 mt-1">Manage your subscription plans</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4" />
          Create Plan
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl p-6 hover:border-violet-500/30 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${planIcons[index]?.color || planIcons[0].color}`}>
                {planIcons[index]?.icon || planIcons[0].icon}
              </div>
              <div className="relative">
                <button className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-white">{formatCurrency(plan.basePrice)}</span>
              <span className="text-slate-400">/{plan.billingInterval.toLowerCase()}</span>
            </div>

            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
              <span className="text-sm text-slate-400">{plan.subscribers} subscribers</span>
              <StatusBadge status={plan.isActive ? 'ACTIVE' : 'INACTIVE'} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Plan Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Plan"
        description="Add a new subscription plan"
        size="lg"
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Plan name</label>
              <input
                type="text"
                placeholder="e.g., Pro"
                className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Slug</label>
              <input
                type="text"
                placeholder="e.g., pro"
                className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Description</label>
            <textarea
              placeholder="Plan description..."
              className="w-full h-24 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Billing model</label>
              <select className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all">
                <option>Flat rate</option>
                <option>Per seat</option>
                <option>Usage based</option>
                <option>Tiered</option>
                <option>Hybrid</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Billing interval</label>
              <select className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all">
                <option>Monthly</option>
                <option>Yearly</option>
                <option>Weekly</option>
                <option>Daily</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Base price</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                placeholder="0.00"
                className="w-full h-11 pl-8 pr-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button>Create Plan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
