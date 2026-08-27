'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Tag, Percent, DollarSign, Gift, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, StatusBadge } from '@/components/dashboard/data-table';
import { formatCurrency, formatDate } from '@/lib/utils';

const coupons = [
  { id: '1', code: 'SAVE20', description: '20% off', couponType: 'PERCENTAGE', discountPercent: 20, discountAmount: null, maxRedemptions: 100, redemptionCount: 45, isActive: true, validFrom: '2024-01-01', expiresAt: '2024-12-31' },
  { id: '2', code: 'FLAT50', description: '$50 off', couponType: 'FIXED_AMOUNT', discountPercent: null, discountAmount: 50, maxRedemptions: 50, redemptionCount: 12, isActive: true, validFrom: '2024-02-01', expiresAt: '2024-06-30' },
  { id: '3', code: 'FREETRIAL', description: '30 days free', couponType: 'FREE_TRIAL', discountPercent: null, discountAmount: null, maxRedemptions: null, redemptionCount: 234, isActive: true, validFrom: '2024-01-01', expiresAt: null },
  { id: '4', code: 'WELCOME10', description: '10% off first month', couponType: 'PERCENTAGE', discountPercent: 10, discountAmount: null, maxRedemptions: 500, redemptionCount: 189, isActive: true, validFrom: '2024-01-01', expiresAt: '2024-12-31' },
  { id: '5', code: 'EXPIRED20', description: '20% off (expired)', couponType: 'PERCENTAGE', discountPercent: 20, discountAmount: null, maxRedemptions: 100, redemptionCount: 100, isActive: false, validFrom: '2023-01-01', expiresAt: '2023-12-31' },
];

const couponTypeIcons = {
  PERCENTAGE: { icon: <Percent className="w-4 h-4" />, color: 'text-violet-400 bg-violet-500/10' },
  FIXED_AMOUNT: { icon: <DollarSign className="w-4 h-4" />, color: 'text-emerald-400 bg-emerald-500/10' },
  FREE_TRIAL: { icon: <Gift className="w-4 h-4" />, color: 'text-sky-400 bg-sky-500/10' },
  TRIAL_EXTENSION: { icon: <Calendar className="w-4 h-4" />, color: 'text-amber-400 bg-amber-500/10' },
};

export default function CouponsPage() {
  const columns = [
    {
      key: 'code',
      label: 'Code',
      render: (item: typeof coupons[0]) => (
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${couponTypeIcons[item.couponType as keyof typeof couponTypeIcons]?.color}`}>
            {couponTypeIcons[item.couponType as keyof typeof couponTypeIcons]?.icon}
          </div>
          <span className="text-sm font-mono font-medium text-white">{item.code}</span>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (item: typeof coupons[0]) => (
        <span className="text-sm text-slate-300">{item.description}</span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (item: typeof coupons[0]) => (
        <Badge variant="violet">{item.couponType.replace('_', ' ')}</Badge>
      ),
    },
    {
      key: 'redemptions',
      label: 'Redemptions',
      render: (item: typeof coupons[0]) => (
        <span className="text-sm text-slate-300">
          {item.redemptionCount} / {item.maxRedemptions || '∞'}
        </span>
      ),
    },
    {
      key: 'expiresAt',
      label: 'Expires',
      render: (item: typeof coupons[0]) => (
        item.expiresAt ? (
          <span className="text-sm text-slate-400">{formatDate(item.expiresAt)}</span>
        ) : (
          <span className="text-sm text-slate-500">Never</span>
        )
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: typeof coupons[0]) => (
        <StatusBadge status={item.isActive ? 'ACTIVE' : 'INACTIVE'} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Coupons</h1>
          <p className="text-slate-400 mt-1">Manage discount coupons</p>
        </div>
        <Button>
          <Plus className="w-4 h-4" />
          Create Coupon
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Coupons', value: '4', icon: <Tag className="w-5 h-5 text-violet-400" /> },
          { label: 'Total Redemptions', value: '480', icon: <Gift className="w-5 h-5 text-emerald-400" /> },
          { label: 'Revenue Impact', value: '-$12,500', icon: <Percent className="w-5 h-5 text-amber-400" /> },
          { label: 'Avg. Discount', value: '15%', icon: <DollarSign className="w-5 h-5 text-sky-400" /> },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-xl border border-slate-800/50 bg-slate-900/50 p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">{stat.label}</p>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search coupons..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
          />
        </div>
      </div>

      <DataTable data={coupons} columns={columns} />
    </div>
  );
}
