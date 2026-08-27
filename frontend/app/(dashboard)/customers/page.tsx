'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Building2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useApi, useApiPost } from '@/hooks/useApi';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Customer {
  id: string;
  company: string | null;
  currency: string;
  country: string | null;
  createdAt: string;
  user: { id: string; email: string; firstName: string; lastName: string };
  _count: { subscriptions: number; invoices: number };
}

export default function CustomersPage() {
  const { data: customers, loading, refetch } = useApi<Customer[]>('/api/customers');
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [form, setForm] = React.useState({ firstName: '', lastName: '', email: '', password: '', company: '' });
  const { post, loading: posting } = useApiPost();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await post('/api/auth/register', form);
      setIsCreateOpen(false);
      setForm({ firstName: '', lastName: '', email: '', password: '', company: '' });
      refetch();
    } catch {}
  };

  const filtered = (customers || []).filter(c =>
    c.user.firstName.toLowerCase().includes(search.toLowerCase()) ||
    c.user.lastName.toLowerCase().includes(search.toLowerCase()) ||
    c.user.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="text-center py-20 text-slate-400">Loading customers...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-slate-400 mt-1">Manage your customer base</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4" /> Add Customer
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/50">
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Customer</th>
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Company</th>
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Subscriptions</th>
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Invoices</th>
                <th className="h-12 px-4 text-left text-sm font-medium text-slate-400">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer, index) => (
                <motion.tr
                  key={customer.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-violet-400">
                          {customer.user.firstName[0]}{customer.user.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{customer.user.firstName} {customer.user.lastName}</p>
                        <p className="text-xs text-slate-400">{customer.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Building2 className="w-4 h-4 text-slate-500" />
                      {customer.company || '—'}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center rounded-full border border-sky-500/20 bg-sky-500/10 text-sky-400 px-3 py-1 text-xs font-medium">
                      {customer._count.subscriptions} active
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-300">{customer._count.invoices}</td>
                  <td className="p-4 text-sm text-slate-400">{formatDate(customer.createdAt)}</td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="p-12 text-center text-slate-500">No customers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add Customer">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">First name</label>
              <input type="text" placeholder="John" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})}
                className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Last name</label>
              <input type="text" placeholder="Doe" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})}
                className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email</label>
            <input type="email" placeholder="john@company.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <input type="password" placeholder="Min 8 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" required minLength={8} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Company</label>
            <input type="text" placeholder="Acme Corp" value={form.company} onChange={e => setForm({...form, company: e.target.value})}
              className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={posting}>Add Customer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
