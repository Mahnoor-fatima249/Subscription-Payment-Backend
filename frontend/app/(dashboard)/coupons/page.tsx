'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Tag } from 'lucide-react';
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
  isActive: boolean;
  plan: { name: string } | null;
  _count: { discounts: number };
  redemptionCount: number;
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
    trialDays: 7,
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
        discountAmount: form.couponType === 'FIXED_AMOUNT' ? form.discountAmount : null,
        trialDays: form.couponType === 'FREE_TRIAL' ? form.trialDays : null,
        maxRedemptions: form.maxRedemptions || null,
        validFrom: new Date().toISOString(),
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      });
      setIsCreateOpen(false);
      setForm({ code: '', description: '', couponType: 'PERCENTAGE', discountPercent: 10, discountAmount: 0, trialDays: 7, maxRedemptions: 100, expiresAt: '' });
      refetch();
    } catch {}
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center animate-pulse">
          <Tag className="w-5 h-5 text-white" />
        </div>
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">Fetching your coupons...</p>
      </div>
    </div>
  );

  const getCouponValue = (coupon: Coupon) => {
    if (coupon.couponType === 'PERCENTAGE') return `${coupon.discountPercent}%`;
    if (coupon.couponType === 'FIXED_AMOUNT') return formatCurrency(Number(coupon.discountAmount || 0));
    if (coupon.couponType === 'FREE_TRIAL') return `${coupon.trialDays} days`;
    return '—';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold">Coupons</h1>
          <p style={{ color: 'var(--text-muted)' }} className="mt-1">Create and track discount codes to reward your customers.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4" /> Create Coupon
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(coupons || []).map((coupon, index) => (
          <motion.div key={coupon.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
            style={{ backgroundColor: 'var(--card-bg-from)', borderColor: 'var(--card-border)' }}
            className="relative rounded-2xl border p-6 hover:opacity-90 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-600/20 to-emerald-500/10 border border-emerald-500/20">
                <Tag className="w-5 h-5 text-emerald-400" />
              </div>
              <StatusBadge isActive={coupon.isActive} />
            </div>

            <div className="mb-4">
              <p style={{ color: 'var(--text-muted)' }} className="text-xs font-mono mb-1">{coupon.code}</p>
              {coupon.description && <p style={{ color: 'var(--text-secondary)' }} className="text-sm mt-1">{coupon.description}</p>}
            </div>

            <div className="flex items-baseline gap-1 mb-4">
              <span style={{ color: 'var(--text-primary)' }} className="text-3xl font-bold">{getCouponValue(coupon)}</span>
              <span style={{ color: 'var(--text-muted)' }} className="text-sm">discount</span>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-muted)' }}>Used</span>
                <span style={{ color: 'var(--text-primary)' }}>{coupon.redemptionCount} / {coupon.maxRedemptions || '∞'}</span>
              </div>
              {coupon.maxRedemptions && (
                <div style={{ backgroundColor: 'var(--input-bg)' }} className="w-full h-2 rounded-full">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all"
                    style={{ width: `${Math.min((coupon.redemptionCount / coupon.maxRedemptions) * 100, 100)}%` }} />
                </div>
              )}
            </div>

            <div style={{ borderTopColor: 'var(--card-border)' }} className="flex items-center justify-between pt-4 border-t">
              <span style={{ color: 'var(--text-muted)' }} className="text-xs">
                {coupon.expiresAt ? `Expires ${formatDate(coupon.expiresAt)}` : 'No expiry'}
              </span>
              <span style={{ color: 'var(--text-muted)' }} className="text-xs">{coupon.couponType.replace('_', ' ')}</span>
            </div>
          </motion.div>
        ))}

        {(coupons || []).length === 0 && (
          <div className="col-span-full text-center py-12">
            <Tag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p style={{ color: 'var(--text-muted)' }}>No coupons yet. Create your first coupon!</p>
          </div>
        )}
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Coupon">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <label style={{ color: 'var(--text-secondary)' }} className="text-sm font-medium">Code</label>
            <input type="text" placeholder="SAVE20" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
              style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
              className="w-full h-11 px-4 rounded-xl border text-sm font-mono placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" required />
          </div>
          <div className="space-y-2">
            <label style={{ color: 'var(--text-secondary)' }} className="text-sm font-medium">Description</label>
            <input type="text" placeholder="Get 20% off" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
              className="w-full h-11 px-4 rounded-xl border text-sm placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label style={{ color: 'var(--text-secondary)' }} className="text-sm font-medium">Type</label>
              <select value={form.couponType} onChange={e => setForm({...form, couponType: e.target.value})}
                style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
                className="w-full h-11 px-4 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all">
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED_AMOUNT">Fixed Amount</option>
                <option value="FREE_TRIAL">Free Trial</option>
              </select>
            </div>
            <div className="space-y-2">
              <label style={{ color: 'var(--text-secondary)' }} className="text-sm font-medium">
                {form.couponType === 'PERCENTAGE' ? 'Percentage Off' : form.couponType === 'FIXED_AMOUNT' ? 'Amount Off' : 'Trial Days'}
              </label>
              <input type="number" step={form.couponType === 'FREE_TRIAL' ? '1' : '0.01'} min="0" placeholder="10"
                value={form.couponType === 'PERCENTAGE' ? form.discountPercent : form.couponType === 'FREE_TRIAL' ? form.trialDays : form.discountAmount}
                onChange={e => {
                  const val = parseFloat(e.target.value) || 0;
                  if (form.couponType === 'PERCENTAGE') setForm({...form, discountPercent: val});
                  else if (form.couponType === 'FREE_TRIAL') setForm({...form, trialDays: val});
                  else setForm({...form, discountAmount: val});
                }}
                style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
                className="w-full h-11 px-4 rounded-xl border text-sm placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label style={{ color: 'var(--text-secondary)' }} className="text-sm font-medium">Max Redemptions</label>
              <input type="number" min="0" placeholder="100" value={form.maxRedemptions || ''} onChange={e => setForm({...form, maxRedemptions: parseInt(e.target.value) || 0})}
                style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
                className="w-full h-11 px-4 rounded-xl border text-sm placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" />
            </div>
            <div className="space-y-2">
              <label style={{ color: 'var(--text-secondary)' }} className="text-sm font-medium">Expires At</label>
              <input type="date" value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})}
                style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
                className="w-full h-11 px-4 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" />
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
