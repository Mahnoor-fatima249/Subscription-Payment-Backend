'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Shield, CreditCard, Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

function SuccessToast({ message, onClose }: { message: string; onClose: () => void }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 shadow-lg shadow-emerald-500/10 backdrop-blur-xl"
    >
      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
        <Check className="w-3.5 h-3.5 text-white" />
      </div>
      <span className="text-sm font-medium text-emerald-400">{message}</span>
    </motion.div>
  );
}

function useSuccessToast() {
  const [toast, setToast] = React.useState<string | null>(null);
  const show = React.useCallback((msg: string) => setToast(msg), []);
  const hide = React.useCallback(() => setToast(null), []);
  return { toast, show, hide };
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState('profile');
  const { toast, show: showToast, hide: hideToast } = useSuccessToast();

  const [user, setUser] = React.useState<UserData | null>(null);
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [company, setCompany] = React.useState('');
  const [notifications, setNotifications] = React.useState({
    emailNotifications: true,
    marketingEmails: false,
    securityAlerts: true,
    billingAlerts: true,
  });

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const data: UserData = JSON.parse(raw);
        setUser(data);
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setEmail(data.email || '');
      }
    } catch {
      // fallback: leave defaults
    }
  }, []);

  const handleSaveProfile = () => {
    if (!user) return;
    const updated = { ...user, firstName, lastName, email };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
    showToast('Profile updated successfully');
  };

  const handleSaveNotifications = () => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
    showToast('Notification settings saved');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard className="w-4 h-4" /> },
  ];

  const initials = (firstName?.[0] || '').toUpperCase() + (lastName?.[0] || '').toUpperCase() || '?';

  const notificationItems = [
    { key: 'emailNotifications' as const, label: 'Email notifications', description: 'Receive email about your account activity.' },
    { key: 'marketingEmails' as const, label: 'Marketing emails', description: 'Receive emails about new features and promotions.' },
    { key: 'securityAlerts' as const, label: 'Security alerts', description: 'Get notified about security issues.' },
    { key: 'billingAlerts' as const, label: 'Billing alerts', description: 'Get notified about payment failures and invoices.' },
  ];

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast && <SuccessToast message={toast} onClose={hideToast} />}
      </AnimatePresence>

      <div>
        <h1 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold">Settings</h1>
        <p style={{ color: 'var(--text-muted)' }} className="mt-1">Manage your account settings</p>
      </div>

      <div className="flex gap-6">
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ borderColor: 'var(--card-border)', background: 'linear-gradient(to bottom right, var(--card-bg-from), var(--card-bg-to))' }}
            className="rounded-2xl border backdrop-blur-xl p-6"
          >
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-semibold">Profile Settings</h3>

                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-violet-500/25">
                    {initials}
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Change Avatar</Button>
                    <p style={{ color: 'var(--text-muted)' }} className="text-xs mt-2">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>First name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
                      className="w-full h-11 px-4 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Last name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
                      className="w-full h-11 px-4 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
                    className="w-full h-11 px-4 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
                    className="w-full h-11 px-4 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile}>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-semibold">Notification Settings</h3>

                <div className="space-y-4">
                  {notificationItems.map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--input-bg)' }}>
                      <div>
                        <p style={{ color: 'var(--text-primary)' }} className="text-sm font-medium">{item.label}</p>
                        <p style={{ color: 'var(--text-muted)' }} className="text-xs">{item.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                        }
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        style={{ backgroundColor: notifications[item.key] ? '#7c3aed' : '#475569' }}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            notifications[item.key] ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications}>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-semibold">Security Settings</h3>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--input-bg)' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p style={{ color: 'var(--text-primary)' }} className="text-sm font-medium">Change Password</p>
                        <p style={{ color: 'var(--text-muted)' }} className="text-xs">Update your password regularly to keep your account secure.</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => showToast('Password update requested')}>Update</Button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--input-bg)' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p style={{ color: 'var(--text-primary)' }} className="text-sm font-medium">Two-Factor Authentication</p>
                        <p style={{ color: 'var(--text-muted)' }} className="text-xs">Add an extra layer of security to your account.</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => showToast('Two-factor authentication enabled')}>Enable</Button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--input-bg)' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p style={{ color: 'var(--text-primary)' }} className="text-sm font-medium">Active Sessions</p>
                        <p style={{ color: 'var(--text-muted)' }} className="text-xs">Manage your active sessions across devices.</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => showToast('Sessions loaded')}>View All</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-6">
                <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-semibold">Billing Settings</h3>

                <div className="p-6 rounded-xl bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border border-violet-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p style={{ color: 'var(--text-primary)' }} className="text-lg font-semibold">Pro Plan</p>
                      <p style={{ color: 'var(--text-muted)' }} className="text-sm">$99/month · Renews on March 15, 2024</p>
                    </div>
                    <Button variant="outline" onClick={() => showToast('Redirecting to subscription manager')}>Manage Subscription</Button>
                  </div>
                </div>

                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--input-bg)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p style={{ color: 'var(--text-primary)' }} className="text-sm font-medium">Payment Method</p>
                      <p style={{ color: 'var(--text-muted)' }} className="text-xs">Visa ending in 4242 · Expires 12/2025</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => showToast('Payment method update requested')}>Update</Button>
                  </div>
                </div>

                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--input-bg)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p style={{ color: 'var(--text-primary)' }} className="text-sm font-medium">Billing History</p>
                      <p style={{ color: 'var(--text-muted)' }} className="text-xs">View and download your past invoices.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => showToast('Loading billing history...')}>View All</Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
