'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CreditCard, Users, Receipt, FileText, Tag, AlertTriangle, BarChart3, Settings, LogOut, Zap } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/plans', label: 'Plans', icon: CreditCard },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/subscriptions', label: 'Subscriptions', icon: Receipt },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/payments', label: 'Payments', icon: FileText },
  { href: '/coupons', label: 'Coupons', icon: Tag },
  { href: '/dunning', label: 'Dunning', icon: AlertTriangle },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    window.location.href = '/logout';
  };

  return (
    <aside
      style={{ background: 'var(--sidebar-bg)', borderRightColor: 'var(--sidebar-border)' }}
      className="w-64 h-screen border-r flex flex-col fixed left-0 top-0 glass"
    >
      {/* Logo */}
      <div style={{ borderBottomColor: 'var(--sidebar-border)' }} className="p-5 border-b">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center pulse-glow"
            style={{ background: 'var(--accent-gradient)' }}
          >
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text tracking-tight">BillFlow</h1>
            <p style={{ color: 'var(--text-muted)' }} className="text-[10px] font-medium uppercase tracking-widest">Billing Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 mt-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="nav-slide flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200"
              style={{
                background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
                boxShadow: isActive ? '0 4px 20px rgba(79, 70, 229, 0.35)' : 'none',
              }}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ borderTopColor: 'var(--sidebar-border)' }} className="p-3 border-t">
        <button
          onClick={handleLogout}
          className="nav-slide flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 w-full hover:bg-red-500/10 hover:text-red-400"
          style={{ color: 'var(--text-muted)' }}
        >
          <LogOut className="w-[18px] h-[18px]" />
          Logout
        </button>
      </div>
    </aside>
  );
}
