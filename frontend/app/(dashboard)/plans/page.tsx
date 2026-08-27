'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, CreditCard, Users, Zap, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useApi, useApiPost } from '@/hooks/useApi';
import { formatCurrency } from '@/lib/utils';

interface PlanFeature {
  id: string;
  name: string;
  value: string;
  isLimit: boolean;
  limitValue: number | null;
}

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  billingModel: string;
  billingInterval: string;
  basePrice: number;
  currency: string;
  isActive: boolean;
  sortOrder: number;
  features: PlanFeature[];
  _count: { subscriptions: number };
}

const planIcons = [
  { icon: <Zap className="w-5 h-5" />, color: 'text-sky-400 bg-sky-500/10' },
  { icon: <CreditCard className="w-5 h-5" />, color: 'text-violet-400 bg-violet-500/10' },
  { icon: <Users className="w-5 h-5" />, color: 'text-emerald-400 bg-emerald-500/10' },
  { icon: <Zap className="w-5 h-5" />, color: 'text-amber-400 bg-amber-500/10' },
];

export default function PlansPage() {
  const { data: plans, loading, refetch } = useApi<Plan[]>('/api/plans');
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    name: '', slug: '', description: '', billingModel: 'FLAT_RATE', billingInterval: 'MONTHLY', basePrice: 0,
  });
  const { post, loading: posting } = useApiPost();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await post('/api/plans', form);
      setIsCreateOpen(false);
      setForm({ name: '', slug: '', description: '', billingModel: 'FLAT_RATE', billingInterval: 'MONTHLY', basePrice: 0 });
      refetch();
    } catch {}
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading plans...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Plans</h1>
          <p className="text-slate-400 mt-1">Manage your subscription plans</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4" /> Create Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(plans || []).map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl p-6 hover:border-violet-500/30 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${planIcons[index % planIcons.length]?.color}`}>
                {planIcons[index % planIcons.length]?.icon}
              </div>
              <button className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
            {plan.description && <p className="text-sm text-slate-400 mb-2">{plan.description}</p>}
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-white">{formatCurrency(plan.basePrice)}</span>
              <span className="text-slate-400">/{plan.billingInterval.toLowerCase()}</span>
            </div>

            <ul className="space-y-2 mb-6">
              {plan.features.map((feature) => (
                <li key={feature.id} className="flex items-center gap-2 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  {feature.name}: {feature.value}
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
              <span className="text-sm text-slate-400">{plan._count.subscriptions} subscribers</span>
              <Badge variant={plan.isActive ? 'success' : 'danger'}>
                {plan.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </motion.div>
        ))}

        {(plans || []).length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">
            No plans found. Create your first plan!
          </div>
        )}
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Plan" description="Add a new subscription plan" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Plan name</label>
              <input type="text" placeholder="e.g., Pro" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Slug</label>
              <input type="text" placeholder="e.g., pro" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})}
                className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Description</label>
            <textarea placeholder="Plan description..." value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full h-24 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Billing model</label>
              <select value={form.billingModel} onChange={e => setForm({...form, billingModel: e.target.value})}
                className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all">
                <option value="FLAT_RATE">Flat rate</option>
                <option value="PER_SEAT">Per seat</option>
                <option value="USAGE_BASED">Usage based</option>
                <option value="TIERED">Tiered</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Billing interval</label>
              <select value={form.billingInterval} onChange={e => setForm({...form, billingInterval: e.target.value})}
                className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all">
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
                <option value="WEEKLY">Weekly</option>
                <option value="DAILY">Daily</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Base price ($)</label>
            <input type="number" step="0.01" min="0" placeholder="0.00" value={form.basePrice || ''} onChange={e => setForm({...form, basePrice: parseFloat(e.target.value) || 0})}
              className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" required />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={posting}>Create Plan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
