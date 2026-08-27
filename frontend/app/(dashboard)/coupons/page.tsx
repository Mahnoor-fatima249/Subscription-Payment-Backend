'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Tag, Percent, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useApi, useApiPost } from '@/hooks/useApi';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';

interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: string;
  value: number;
  maxRedemptions: number | null;
  redemptionCount: number;
  expiresAt: string | null;
  isActive: boolean;
}

export default function CouponsPage() {
  const { data: coupons, loading, refetch } = useApi<Coupon[]>('/api/coupons');
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [form, setForm] = React.useState({ code: '', name: '', description: '', type: 'PERCENTAGE', value: 10, maxRedemptions: 100, expiresAt: '' });
  const { post, loading: posting } = useApiPost();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await post('/api/coupons', {
        ...form,
        maxRedemptions: form.maxRedemptions ? parseInt(String(form.maxRedemptions)) : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      });
      setIsCreateOpen(false);
      setForm({ code: '', name: '', description: '', type: 'PERCENTAGE', value: 10, maxRedemptions: 100, expiresAt: '' });
      refetch();
    } catch {}
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading coupons...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Coupons</h1>
          <p className="text-slate-400 mt-1">Manage discount coupons</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4" /> Create Coupon
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(coupons || []).map((coupon, index) => (
          <motion.div key={coupon.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
            className="relative rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl p-6 hover:border-violet-500/30 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-600/20 to-emerald-500/10 border border-emerald-500/20">
                <Tag className="w-5 h-5 text-emerald-400" />
              </div>
              <Badge isActive={coupon.isActive} />
            </div>

            <div className="mb-4">
              <p className="text-xs text-slate-500 font-mono mb-1">{coupon.code}</p>
              <h3 className="text-xl font-bold text-white">{coupon.name}</h3>
              {coupon.description && <p className="text-sm text-slate-400 mt-1">{coupon.description}</p>}
            </div>

            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-white">
                {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : formatCurrency(coupon.value)}
              </span>
              <span className="text-slate-400 text-sm">discount</span>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Used</span>
                <span className="text-white">{coupon.redemptionCount} / {coupon.maxRedemptions || '∞'}</span>
              </div>
              {coupon.maxRedemptions && (
                <div className="w-full h-2 rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all"
                    style={{ width: `${Math.min((coupon.redemptionCount / coupon.maxRedemptions) * 100, 100)}%` }} />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
              <span className="text-xs text-slate-500">
                {coupon.expiresAt ? `Expires ${formatDate(coupon.expiresAt)}` : 'No expiry'}
              </span>
              <span className="text-xs text-slate-500">{coupon.type.replace('_', ' ')}</span>
            </div>
          </motion.div>
        ))}

        {(coupons || []).length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">No coupons yet. Create your first coupon!</div>
        )}
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Coupon">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Code</label>
              <input type="text" placeholder="SAVE20" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Name</label>
              <input type="text" placeholder="20% Off" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Description</label>
            <input type="text" placeholder="Get 20% off" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all">
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed Amount</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Value</label>
              <input type="number" step="0.01" min="0" placeholder="10" value={form.value || ''} onChange={e => setForm({...form, value: parseFloat(e.target.value) || 0})}
                className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Max Redemptions</label>
              <input type="number" min="0" placeholder="100" value={form.maxRedemptions || ''} onChange={e => setForm({...form, maxRedemptions: parseInt(e.target.value) || 0})}
                className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Expires At</label>
              <input type="date" value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})}
                className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={posting}>Create Coupon</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Badge({ isActive }: { isActive: boolean }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${isActive ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-red-500/20 bg-red-500/10 text-red-400'}`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}
