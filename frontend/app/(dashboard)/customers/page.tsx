'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, Mail, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { DataTable, StatusBadge } from '@/components/dashboard/data-table';
import { formatCurrency, formatDate } from '@/lib/utils';

const customers = [
  { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@acme.com', company: 'Acme Corp', currency: 'usd', createdAt: '2024-01-15', subscriptions: 2, totalSpent: 1299, status: 'ACTIVE' },
  { id: '2', firstName: 'Sarah', lastName: 'Wilson', email: 'sarah@globex.com', company: 'Globex Inc', currency: 'usd', createdAt: '2024-02-20', subscriptions: 1, totalSpent: 599, status: 'ACTIVE' },
  { id: '3', firstName: 'Mike', lastName: 'Johnson', email: 'mike@initech.com', company: 'Initech', currency: 'usd', createdAt: '2024-03-10', subscriptions: 1, totalSpent: 299, status: 'ACTIVE' },
  { id: '4', firstName: 'Emily', lastName: 'Brown', email: 'emily@umbrella.com', company: 'Umbrella Corp', currency: 'usd', createdAt: '2024-04-05', subscriptions: 3, totalSpent: 2899, status: 'ACTIVE' },
  { id: '5', firstName: 'David', lastName: 'Lee', email: 'david@wayne.com', company: 'Wayne Enterprises', currency: 'usd', createdAt: '2024-05-12', subscriptions: 1, totalSpent: 0, status: 'INACTIVE' },
];

export default function CustomersPage() {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  const columns = [
    {
      key: 'customer',
      label: 'Customer',
      render: (item: typeof customers[0]) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center">
            <span className="text-sm font-bold text-violet-400">
              {item.firstName[0]}{item.lastName[0]}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">{item.firstName} {item.lastName}</p>
            <p className="text-xs text-slate-400">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'company',
      label: 'Company',
      render: (item: typeof customers[0]) => (
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Building2 className="w-4 h-4 text-slate-500" />
          {item.company}
        </div>
      ),
    },
    {
      key: 'subscriptions',
      label: 'Subscriptions',
      render: (item: typeof customers[0]) => (
        <Badge variant="info">{item.subscriptions} active</Badge>
      ),
    },
    {
      key: 'totalSpent',
      label: 'Total Spent',
      render: (item: typeof customers[0]) => (
        <span className="text-sm font-medium text-white">{formatCurrency(item.totalSpent)}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (item: typeof customers[0]) => (
        <span className="text-sm text-slate-400">{formatDate(item.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-slate-400 mt-1">Manage your customer base</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Customer
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search customers..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      <DataTable data={customers} columns={columns} />

      {/* Create Customer Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Customer"
        description="Add a new customer to your system"
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">First name</label>
              <input
                type="text"
                placeholder="John"
                className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Last name</label>
              <input
                type="text"
                placeholder="Doe"
                className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email</label>
            <input
              type="email"
              placeholder="john@company.com"
              className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Company</label>
            <input
              type="text"
              placeholder="Acme Corp"
              className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Currency</label>
              <select className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all">
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Country</label>
              <select className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all">
                <option>United States</option>
                <option>United Kingdom</option>
                <option>Germany</option>
                <option>France</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button>Add Customer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
