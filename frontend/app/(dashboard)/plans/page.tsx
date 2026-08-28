'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, CreditCard, Users, Zap, MoreHorizontal, Trash2, Edit, Search } from 'lucide-react';
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

interface PlanTier {
  id: string;
  upTo: number | null;
  perUnitPrice: number;
  flatFee: number;
  description: string | null;
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
  tiers: PlanTier[];
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
  const [search, setSearch] = React.useState('');
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    name: '', slug: '', description: '', billingModel: 'FLAT_RATE', billingInterval: 'MONTHLY', basePrice: 0,
  });
  const { post, loading: posting } = useApiPost();

  const filteredPlans = React.useMemo(() => {
    if (!plans) return [];
    if (!search.trim()) return plans;
    const q = search.toLowerCase();
    return plans.filter(
      (plan) =>
        plan.name.toLowerCase().includes(q) ||
        (plan.description && plan.description.toLowerCase().includes(q))
    );
  }, [plans, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await post('/api/plans', form);
      setIsCreateOpen(false);
      setForm({ name: '', slug: '', description: '', billingModel: 'FLAT_RATE', billingInterval: 'MONTHLY', basePrice: 0 });
      refetch();
    } catch {}
  };

  if (loading) return <div style={{ color: 'var(--text-muted)' }} className="text-center py-20">Loading plans...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold">Plans</h1>
          <p style={{ color: 'var(--text-muted)' }} className="mt-1">Set up and tweak the plans your customers subscribe to.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4" /> Create Plan
        </Button>
      </div>

      <div className="relative w-full max-w-sm">
        <Search style={{ color: 'var(--text-muted)' }} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
        <input
          type="text"
          placeholder="Find a plan by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
          className="w-full h-10 pl-10 pr-4 rounded-xl border text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{ borderColor: 'var(--card-border)', background: 'linear-gradient(to bottom right, var(--card-bg-from), var(--card-bg-to))' }}
            className="relative rounded-2xl border backdrop-blur-xl p-6 hover:border-violet-500/30 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${planIcons[index % planIcons.length]?.color}`}>
                {planIcons[index % planIcons.length]?.icon}
              </div>
              <button style={{ color: 'var(--text-muted)' }} className="p-2 rounded-lg hover:bg-slate-700/50 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <h3 style={{ color: 'var(--text-primary)' }} className="text-xl font-bold mb-1">{plan.name}</h3>
            {plan.description && <p style={{ color: 'var(--text-muted)' }} className="text-sm mb-2">{plan.description}</p>}
            <div className="flex items-baseline gap-1 mb-4">
              <span style={{ color: 'var(--text-primary)' }} className="text-3xl font-bold">{formatCurrency(plan.basePrice)}</span>
              <span style={{ color: 'var(--text-muted)' }}>/{plan.billingInterval.toLowerCase()}</span>
            </div>

            <ul className="space-y-2 mb-6">
              {plan.features.map((feature) => (
                <li key={feature.id} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  {feature.name}: {feature.value}
                </li>
              ))}
            </ul>

            {plan.tiers && plan.tiers.length > 0 && (
              <div style={{ borderColor: 'var(--card-border)' }} className="mb-6 p-3 rounded-xl border">
                <h4 style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold mb-2">Tier Pricing</h4>
                <div className="space-y-1.5">
                  {plan.tiers.map((tier, i) => (
                    <div key={tier.id} className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span>
                        {i === 0 ? '1' : (plan.tiers[i - 1].upTo ?? 0) + 1}–{tier.upTo ?? '∞'}
                      </span>
                      <span>{formatCurrency(tier.perUnitPrice)}/unit{tier.flatFee > 0 && ` + ${formatCurrency(tier.flatFee)} flat`}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ borderColor: 'var(--card-border)' }} className="flex items-center justify-between pt-4 border-t">
              <span style={{ color: 'var(--text-muted)' }} className="text-sm">{plan._count.subscriptions} subscribers</span>
              <Badge variant={plan.isActive ? 'success' : 'danger'}>
                {plan.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </motion.div>
        ))}

        {(plans || []).length === 0 && (
          <div className="col-span-full text-center py-12" style={{ color: 'var(--text-muted)' }}>
            No plans found. Create your first plan!
          </div>
        )}

        {(plans || []).length > 0 && filteredPlans.length === 0 && (
          <div className="col-span-full text-center py-12" style={{ color: 'var(--text-muted)' }}>
            No plans match your search.
          </div>
        )}
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Plan" description="Add a new subscription plan" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Plan name</label>
              <input type="text" placeholder="e.g., Pro" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
                className="w-full h-11 px-4 rounded-xl border text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Slug</label>
              <input type="text" placeholder="e.g., pro" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})}
                style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
                className="w-full h-11 px-4 rounded-xl border text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Description</label>
            <textarea placeholder="Plan description..." value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
              className="w-full h-24 px-4 py-3 rounded-xl border text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Billing model</label>
              <select value={form.billingModel} onChange={e => setForm({...form, billingModel: e.target.value})}
                style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
                className="w-full h-11 px-4 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all">
                <option value="FLAT_RATE">Flat rate</option>
                <option value="PER_SEAT">Per seat</option>
                <option value="USAGE_BASED">Usage based</option>
                <option value="TIERED">Tiered</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Billing interval</label>
              <select value={form.billingInterval} onChange={e => setForm({...form, billingInterval: e.target.value})}
                style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
                className="w-full h-11 px-4 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all">
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
                <option value="WEEKLY">Weekly</option>
                <option value="DAILY">Daily</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Base price ($)</label>
            <input type="number" step="0.01" min="0" placeholder="0.00" value={form.basePrice || ''} onChange={e => setForm({...form, basePrice: parseFloat(e.target.value) || 0})}
              style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
              className="w-full h-11 px-4 rounded-xl border text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" required />
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
