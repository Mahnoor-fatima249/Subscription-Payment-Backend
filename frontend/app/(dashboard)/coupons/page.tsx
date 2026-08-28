'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Tag, Percent, DollarSign, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useApi, useApiPost } from '@/hooks/useApi';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  couponType: string;
  discountPercent: number | null;
  discountAmount: number | null;
  trialDays: number | null;
  maxRedemptions: number | null;
  validFrom: string;
  expiresAt: string | null;
  plan: { name: string } | null;
  _count: { discounts: number };
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${isActive ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-red-500/20 bg-red-500/10 text-red-400'}`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

export default function CouponsPage() {
  const { data: coupons, loading, refetch } = useApi<Coupon[]>('/api/coupons');
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    code: '',
    description: '',
    couponType: 'PERCENTAGE',
    discountPercent: 10,
    discountAmount: 0,
    maxRedemptions: 100,
    expiresAt: '',
  });
  const { post, loading: posting } = useApiPost();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await post('/api/coupons', {
        code: form.code,
        description: form.description || null,
        couponType: form.couponType,
        discountPercent: form.couponType === 'PERCENTAGE' ? form.discountPercent : null,
        discountAmount: form.couponType === 'FIXED' ? form.discountAmount : null,
        maxRedemptions: form.maxRedemptions || null,
        validFrom: new Date().toISOString(),
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      });
      setIsCreateOpen(false);
      setForm({ code: '', description: '', couponType: 'PERCENTAGE', discountPercent: 10, discountAmount: 0, maxRedemptions: 100, expiresAt: '' });
      refetch();
    } catch {}
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center animate-pulse">
          <Tag className="w-5 h-5 text-white" />
        </div>
        <p className="text-slate-400 text-sm">Loading coupons...</p>
      </div>
    </div>
  );

  const getCouponValue = (coupon: Coupon) => {
    if (coupon.couponType === 'PERCENTAGE') return `${coupon.discountPercent}%`;
    if (coupon.couponType === 'FIXED') return formatCurrency(Number(coupon.discountAmount || 0));
    if (coupon.couponType === 'TRIAL') return `${coupon.trialDays} days`;
    return '—';
  };

  const isCouponActive = (coupon: Coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const expiresAt = coupon.expiresAt ? new Date(coupon.expiresAt) : null;
    return now >= validFrom && (!expiresAt || now <= expiresAt);
  };

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
              <StatusBadge isActive={isCouponActive(coupon)} />
            </div>

            <div className="mb-4">
              <p className="text-xs text-slate-500 font-mono mb-1">{coupon.code}</p>
              {coupon.description && <p className="text-sm text-slate-300 mt-1">{coupon.description}</p>}
            </div>

            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-white">{getCouponValue(coupon)}</span>
              <span className="text-slate-400 text-sm">discount</span>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Used</span>
                <span className="text-white">{coupon._count.discounts} / {coupon.maxRedemptions || '∞'}</span>
              </div>
              {coupon.maxRedemptions && (
                <div className="w-full h-2 rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all"
                    style={{ width: `${Math.min((coupon._count.discounts / coupon.maxRedemptions) * 100, 100)}%` }} />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
              <span className="text-xs text-slate-500">
                {coupon.expiresAt ? `Expires ${formatDate(coupon.expiresAt)}` : 'No expiry'}
              </span>
              <span className="text-xs text-slate-500">{coupon.couponType.replace('_', ' ')}</span>
            </div>
          </motion.div>
        ))}

        {(coupons || []).length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">
            <Tag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p>No coupons yet. Create your first coupon!</p>
          </div>
        )}
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Coupon">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Code</label>
            <input type="text" placeholder="SAVE20" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
              className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Description</label>
            <input type="text" placeholder="Get 20% off" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Type</label>
              <select value={form.couponType} onChange={e => setForm({...form, couponType: e.target.value})}
                className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all">
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed Amount</option>
                <option value="TRIAL">Free Trial</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                {form.couponType === 'PERCENTAGE' ? 'Percentage Off' : form.couponType === 'FIXED' ? 'Amount Off' : 'Trial Days'}
              </label>
              <input type="number" step="0.01" min="0" placeholder={form.couponType === 'TRIAL' ? '14' : '10'}
                value={form.couponType === 'PERCENTAGE' ? form.discountPercent : form.couponType === 'FIXED' ? form.discountAmount : ''}
                onChange={e => {
                  const val = parseFloat(e.target.value) || 0;
                  if (form.couponType === 'PERCENTAGE') setForm({...form, discountPercent: val});
                  else setForm({...form, discountAmount: val});
                }}
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
