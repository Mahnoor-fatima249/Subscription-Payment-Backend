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

  if (loading) return <div style={{ color: 'var(--text-muted)' }} className="text-center py-20">Loading your customers...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold">Customers</h1>
          <p style={{ color: 'var(--text-muted)' }} className="mt-1">See everyone who's using your product and how they're engaged.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4" /> Add a new customer
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search style={{ color: 'var(--text-muted)' }} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
          <input type="text" placeholder="Find someone by name, email, or company..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
            className="w-full h-10 pl-10 pr-4 rounded-xl border text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" />
        </div>
      </div>

      <div style={{ borderColor: 'var(--card-border)', background: 'linear-gradient(to bottom right, var(--card-bg-from), var(--card-bg-to))' }} className="rounded-2xl border backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderColor: 'var(--card-border)' }} className="border-b">
                <th style={{ color: 'var(--text-muted)' }} className="h-12 px-4 text-left text-sm font-medium">Customer</th>
                <th style={{ color: 'var(--text-muted)' }} className="h-12 px-4 text-left text-sm font-medium">Company</th>
                <th style={{ color: 'var(--text-muted)' }} className="h-12 px-4 text-left text-sm font-medium">Subscriptions</th>
                <th style={{ color: 'var(--text-muted)' }} className="h-12 px-4 text-left text-sm font-medium">Invoices</th>
                <th style={{ color: 'var(--text-muted)' }} className="h-12 px-4 text-left text-sm font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer, index) => (
                <motion.tr
                  key={customer.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  style={{ borderColor: 'var(--card-border)' }}
                  className="border-b hover:bg-slate-800/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-violet-400">
                          {customer.user.firstName[0]}{customer.user.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p style={{ color: 'var(--text-primary)' }} className="text-sm font-medium">{customer.user.firstName} {customer.user.lastName}</p>
                        <p style={{ color: 'var(--text-muted)' }} className="text-xs">{customer.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <Building2 style={{ color: 'var(--text-muted)' }} className="w-4 h-4" />
                      {customer.company || '—'}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center rounded-full border border-sky-500/20 bg-sky-500/10 text-sky-400 px-3 py-1 text-xs font-medium">
                      {customer._count.subscriptions} active subscription
                    </span>
                  </td>
                  <td className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{customer._count.invoices}</td>
                  <td className="p-4 text-sm" style={{ color: 'var(--text-muted)' }}>{formatDate(customer.createdAt)}</td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="p-12 text-center" style={{ color: 'var(--text-muted)' }}>No customers match your search — try a different name or email.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add a new customer">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>First name</label>
              <input type="text" placeholder="John" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})}
                style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
                className="w-full h-11 px-4 rounded-xl border text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Last name</label>
              <input type="text" placeholder="Doe" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})}
                style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
                className="w-full h-11 px-4 rounded-xl border text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <input type="email" placeholder="john@company.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
              className="w-full h-11 px-4 rounded-xl border text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Password</label>
            <input type="password" placeholder="Min 8 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
              className="w-full h-11 px-4 rounded-xl border text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" required minLength={8} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Company</label>
            <input type="text" placeholder="Acme Corp" value={form.company} onChange={e => setForm({...form, company: e.target.value})}
              style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
              className="w-full h-11 px-4 rounded-xl border text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={posting}>Add new customer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
