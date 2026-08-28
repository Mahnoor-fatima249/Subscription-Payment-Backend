'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, DollarSign, Users, CreditCard, FileText, Shield, BarChart3, Zap, CheckCircle, Sparkles, TrendingUp, ArrowRight, Clock, Globe, Headphones, Layers, Activity, Target, RefreshCw, AlertTriangle } from 'lucide-react';

const slides = [
  {
    icon: <Zap className="w-10 h-10" />,
    title: 'Welcome to BillFlow',
    subtitle: 'The modern way to manage subscriptions',
    description: 'Built for SaaS businesses that want clarity, not complexity. One dashboard to see everything — revenue, customers, subscriptions, and payments.',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)',
    bgFrom: 'rgba(99,102,241,0.08)',
    bgTo: 'rgba(167,139,250,0.04)',
    features: ['Real-time dashboard', 'Smart automation', 'Beautiful analytics'],
    stat: { value: '3x', label: 'faster billing', icon: <TrendingUp className="w-4 h-4" /> },
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=340&fit=crop&auto=format',
    imageAlt: 'Dashboard Analytics Overview',
  },
  {
    icon: <DollarSign className="w-10 h-10" />,
    title: 'Revenue That Makes Sense',
    subtitle: 'MRR, ARR, and ARPU — finally clear',
    description: 'Stop guessing. See exactly how much your business makes with real-time Monthly Recurring Revenue, Annual Projections, and Average Revenue Per User.',
    gradient: 'linear-gradient(135deg, #10b981, #059669, #34d399)',
    bgFrom: 'rgba(16,185,129,0.08)',
    bgTo: 'rgba(52,211,153,0.04)',
    features: ['MRR tracking', 'Annual projections', 'Revenue per user'],
    stat: { value: '$18K+', label: 'MRR tracked', icon: <DollarSign className="w-4 h-4" /> },
    dashboardData: {
      mrr: '$18,420',
      arr: '$221,040',
      arpu: '$47.50',
      growth: '+12.4%',
      chart: [40, 55, 45, 65, 58, 72, 68, 80, 75, 88, 82, 95],
    },
  },
  {
    icon: <Users className="w-10 h-10" />,
    title: 'Know Your Customers',
    subtitle: 'Every customer, every detail, one place',
    description: 'Browse your entire customer base with instant search. See their plans, payment history, and subscription status. No more digging through databases.',
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb, #60a5fa)',
    bgFrom: 'rgba(59,130,246,0.08)',
    bgTo: 'rgba(96,165,250,0.04)',
    features: ['16 demo customers', 'Instant search', 'Full profiles'],
    stat: { value: '384', label: 'customers', icon: <Users className="w-4 h-4" /> },
    customers: [
      { name: 'Sarah Chen', company: 'TechStart Inc.', plan: 'Pro', avatar: 'https://i.pravatar.cc/80?img=1', revenue: '$2,340', status: 'Active' },
      { name: 'Marcus Johnson', company: 'CloudNine Labs', plan: 'Enterprise', avatar: 'https://i.pravatar.cc/80?img=3', revenue: '$5,120', status: 'Active' },
      { name: 'Emily Rodriguez', company: 'DataFlow AI', plan: 'Pro', avatar: 'https://i.pravatar.cc/80?img=5', revenue: '$1,890', status: 'Active' },
      { name: 'James Wilson', company: 'NovaCraft', plan: 'Starter', avatar: 'https://i.pravatar.cc/80?img=8', revenue: '$580', status: 'Trialing' },
      { name: 'Priya Sharma', company: 'QuantumLeap', plan: 'Enterprise', avatar: 'https://i.pravatar.cc/80?img=9', revenue: '$8,750', status: 'Active' },
    ],
  },
  {
    icon: <CreditCard className="w-10 h-10" />,
    title: 'Subscriptions, Simplified',
    subtitle: 'Every status at a glance',
    description: 'Active, trialing, past due, paused, canceled — see exactly where every customer stands. Spot problems before they become churn.',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706, #fbbf24)',
    bgFrom: 'rgba(245,158,11,0.08)',
    bgTo: 'rgba(251,191,36,0.04)',
    features: ['247 active subscriptions', 'Status tracking', 'Lifecycle mgmt'],
    stat: { value: '247', label: 'active subs', icon: <CreditCard className="w-4 h-4" /> },
    subscriptionStats: [
      { label: 'Active', count: 247, color: '#10b981', percent: 78 },
      { label: 'Trialing', count: 34, color: '#3b82f6', percent: 11 },
      { label: 'Past Due', count: 18, color: '#f59e0b', percent: 6 },
      { label: 'Paused', count: 12, color: '#8b5cf6', percent: 4 },
      { label: 'Canceled', count: 6, color: '#ef4444', percent: 2 },
    ],
  },
  {
    icon: <FileText className="w-10 h-10" />,
    title: 'Invoices That Write Themselves',
    subtitle: 'Automatic, accurate, always',
    description: 'Every subscription generates invoices automatically. See paid, open, and draft invoices with full payment details. Never chase an invoice again.',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626, #f87171)',
    bgFrom: 'rgba(239,68,68,0.08)',
    bgTo: 'rgba(248,113,113,0.04)',
    features: ['Auto-generated', 'Payment tracking', 'Customer linking'],
    stat: { value: '1,247', label: 'invoices sent', icon: <FileText className="w-4 h-4" /> },
    invoices: [
      { id: 'INV-2847', customer: 'Sarah Chen', amount: '$299.00', date: 'Aug 25, 2026', status: 'Paid', avatar: 'https://i.pravatar.cc/40?img=1' },
      { id: 'INV-2846', customer: 'Marcus Johnson', amount: '$499.00', date: 'Aug 24, 2026', status: 'Paid', avatar: 'https://i.pravatar.cc/40?img=3' },
      { id: 'INV-2845', customer: 'Priya Sharma', amount: '$1,299.00', date: 'Aug 23, 2026', status: 'Paid', avatar: 'https://i.pravatar.cc/40?img=9' },
      { id: 'INV-2844', customer: 'Emily Rodriguez', amount: '$199.00', date: 'Aug 22, 2026', status: 'Open', avatar: 'https://i.pravatar.cc/40?img=5' },
      { id: 'INV-2843', customer: 'James Wilson', amount: '$49.00', date: 'Aug 21, 2026', status: 'Draft', avatar: 'https://i.pravatar.cc/40?img=8' },
    ],
  },
  {
    icon: <Shield className="w-10 h-10" />,
    title: 'Smart Dunning',
    subtitle: 'Recover failed payments automatically',
    description: 'When a payment fails, BillFlow tracks retry attempts, notifies customers, and shows recovery metrics. Save revenue that would otherwise walk out the door.',
    gradient: 'linear-gradient(135deg, #ec4899, #db2777, #f472b6)',
    bgFrom: 'rgba(236,72,153,0.08)',
    bgTo: 'rgba(244,114,182,0.04)',
    features: ['Retry tracking', 'Recovery metrics', 'Attempt counting'],
    stat: { value: '$4,280', label: 'recovered', icon: <Shield className="w-4 h-4" /> },
    dunningData: {
      totalFailed: 23,
      recovered: 18,
      recoveryRate: '78%',
      amountRecovered: '$4,280',
      attempts: [
        { customer: 'Alex Kim', amount: '$299', attempts: 2, status: 'Recovered', avatar: 'https://i.pravatar.cc/40?img=11' },
        { customer: 'Lisa Park', amount: '$199', attempts: 3, status: 'Recovered', avatar: 'https://i.pravatar.cc/40?img=16' },
        { customer: 'Tom Brown', amount: '$499', attempts: 1, status: 'Pending', avatar: 'https://i.pravatar.cc/40?img=12' },
      ],
    },
  },
  {
    icon: <BarChart3 className="w-10 h-10" />,
    title: 'Reports That Tell a Story',
    subtitle: 'Data-driven decisions, finally',
    description: 'Revenue by plan, subscription distribution, and business trends. See which plans perform best and where growth is coming from.',
    gradient: 'linear-gradient(135deg, #6366f1, #4f46e5, #818cf8)',
    bgFrom: 'rgba(99,102,241,0.08)',
    bgTo: 'rgba(129,140,248,0.04)',
    features: ['Revenue by plan', 'Subscription charts', 'Business insights'],
    stat: { value: '+24%', label: 'growth', icon: <BarChart3 className="w-4 h-4" /> },
    reportData: {
      plans: [
        { name: 'Starter', revenue: '$4,280', users: 86, growth: '+8%' },
        { name: 'Pro', revenue: '$9,840', users: 164, growth: '+18%' },
        { name: 'Enterprise', revenue: '$4,300', users: 34, growth: '+32%' },
      ],
      totalRevenue: '$18,420',
      topPlan: 'Pro',
      avgGrowth: '+19.3%',
    },
  },
  {
    icon: <Activity className="w-10 h-10" />,
    title: 'Real-Time Monitoring',
    subtitle: 'Never miss a thing',
    description: 'Track every transaction, every retry, every churn event in real-time. Get alerts before problems escalate and stay on top of your business 24/7.',
    gradient: 'linear-gradient(135deg, #14b8a6, #0d9488, #2dd4bf)',
    bgFrom: 'rgba(20,184,166,0.08)',
    bgTo: 'rgba(45,212,191,0.04)',
    features: ['Live transaction feed', 'Smart alerts', 'Health monitoring'],
    stat: { value: '99.9%', label: 'uptime', icon: <Activity className="w-4 h-4" /> },
    liveFeed: [
      { time: '2s ago', event: 'Payment received', amount: '+$299.00', type: 'success' },
      { time: '15s ago', event: 'New subscription', amount: 'Pro Plan', type: 'info' },
      { time: '32s ago', event: 'Invoice paid', amount: '+$499.00', type: 'success' },
      { time: '1m ago', event: 'Card retry', amount: '$199.00', type: 'warning' },
      { time: '2m ago', event: 'Plan upgrade', amount: 'Enterprise', type: 'info' },
    ],
  },
  {
    icon: <Sparkles className="w-10 h-10" />,
    title: 'Ready to Get Started?',
    subtitle: 'Free to start, scales with you',
    description: 'Join thousands of SaaS businesses that trust BillFlow to manage their subscriptions. Set up in minutes, not months. No credit card required.',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)',
    bgFrom: 'rgba(99,102,241,0.08)',
    bgTo: 'rgba(167,139,250,0.04)',
    features: ['Free to start', 'No credit card', 'Cancel anytime'],
    stat: { value: 'Free', label: 'to start', icon: <Sparkles className="w-4 h-4" /> },
    trustedCompanies: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/200px-Microsoft_logo_%282012%29.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/200px-Amazon_logo.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/200px-Google_2015_logo.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Stripe_Logo%2C_revised_2016.svg/200px-Stripe_Logo%2C_revised_2016.svg.png',
    ],
  },
];

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 120;
  const height = 40;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(' ');
  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${color.replace('#', '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProgressRing({ percent, color, size = 48 }: { percent: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--input-border)" strokeWidth="4" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  );
}

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [progress, setProgress] = useState(0);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
    setProgress(0);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
  }, []);

  const goTo = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
    setProgress(0);
  };

  useEffect(() => {
    if (!isOpen) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { next(); return 0; }
        return prev + 1.5;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isOpen, current, next]);

  const slide = slides[current];

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 400 : -400, opacity: 0, scale: 0.92, rotateY: dir > 0 ? 8 : -8 }),
    center: { x: 0, opacity: 1, scale: 1, rotateY: 0 },
    exit: (dir: number) => ({ x: dir > 0 ? -400 : 400, opacity: 0, scale: 0.92, rotateY: dir > 0 ? -8 : 8 }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
          onClick={onClose}
        >
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  background: slide.gradient,
                  left: `${5 + i * 8}%`,
                  top: `${10 + (i % 5) * 18}%`,
                  opacity: 0.25,
                }}
                animate={{
                  y: [0, -50, 0],
                  opacity: [0.15, 0.45, 0.15],
                  scale: [1, 2, 1],
                }}
                transition={{
                  duration: 4 + i * 0.6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-3xl rounded-[2rem] overflow-hidden"
            style={{
              backgroundColor: 'var(--card-bg-from)',
              border: '1px solid var(--card-border)',
              boxShadow: `0 25px 80px rgba(0,0,0,0.5), 0 0 60px ${slide.bgFrom}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 z-20 w-9 h-9 rounded-xl btn-press flex items-center justify-center"
              style={{ color: 'var(--text-muted)', backgroundColor: 'var(--input-bg)' }}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Progress bar */}
            <div className="relative h-1.5 overflow-hidden" style={{ backgroundColor: 'var(--input-bg)' }}>
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: slide.gradient }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            {/* Content */}
            <div className="relative min-h-[520px] overflow-hidden">
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: `radial-gradient(ellipse at 50% 0%, ${slide.bgFrom} 0%, ${slide.bgTo} 50%, transparent 70%)`,
                }}
                transition={{ duration: 0.8 }}
              />

              {/* Grid pattern */}
              <div className="absolute inset-0 opacity-[0.015]" style={{
                backgroundImage: `linear-gradient(${slide.bgFrom} 1px, transparent 1px), linear-gradient(90deg, ${slide.bgFrom} 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
              }} />

              <div className="relative p-10 pb-6">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={current}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {/* Icon */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 12 }}
                      className="relative w-20 h-20 rounded-3xl flex items-center justify-center text-white mx-auto mb-6"
                    >
                      <div className="absolute inset-0 rounded-3xl blur-2xl opacity-30" style={{ background: slide.gradient }} />
                      <div className="relative w-full h-full rounded-3xl flex items-center justify-center" style={{ background: slide.gradient }}>
                        {slide.icon}
                      </div>
                    </motion.div>

                    {/* Title */}
                    <motion.h2
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-3xl font-bold text-center mb-2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {slide.title}
                    </motion.h2>

                    {/* Subtitle */}
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="text-sm font-semibold text-center mb-5 tracking-wide"
                      style={{ color: 'var(--primary)' }}
                    >
                      {slide.subtitle}
                    </motion.p>

                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-[15px] text-center leading-relaxed mb-7 max-w-lg mx-auto"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {slide.description}
                    </motion.p>

                    {/* Dynamic Content based on slide */}
                    {slide.dashboardData && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="max-w-lg mx-auto mb-6"
                      >
                        <div className="grid grid-cols-4 gap-3 mb-4">
                          {[
                            { label: 'MRR', value: slide.dashboardData.mrr, color: '#10b981' },
                            { label: 'ARR', value: slide.dashboardData.arr, color: '#3b82f6' },
                            { label: 'ARPU', value: slide.dashboardData.arpu, color: '#8b5cf6' },
                            { label: 'Growth', value: slide.dashboardData.growth, color: '#f59e0b' },
                          ].map((item) => (
                            <div key={item.label} className="p-3 rounded-xl" style={{ backgroundColor: 'var(--input-bg)' }}>
                              <p className="text-[10px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                              <p className="text-sm font-bold" style={{ color: item.color }}>{item.value}</p>
                            </div>
                          ))}
                        </div>
                        <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--input-bg)' }}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Revenue Trend (12 months)</span>
                            <span className="text-xs font-bold" style={{ color: '#10b981' }}>+12.4%</span>
                          </div>
                          <MiniChart data={slide.dashboardData.chart} color="#10b981" />
                        </div>
                      </motion.div>
                    )}

                    {slide.customers && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="max-w-lg mx-auto mb-6 space-y-2"
                      >
                        {slide.customers.map((customer, i) => (
                          <motion.div
                            key={customer.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + i * 0.06 }}
                            className="flex items-center gap-3 p-3 rounded-xl"
                            style={{ backgroundColor: 'var(--input-bg)' }}
                          >
                            <img src={customer.avatar} alt={customer.name} className="w-9 h-9 rounded-full object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{customer.name}</p>
                              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{customer.company}</p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{
                              backgroundColor: customer.plan === 'Enterprise' ? 'rgba(139,92,246,0.15)' : customer.plan === 'Pro' ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.15)',
                              color: customer.plan === 'Enterprise' ? '#8b5cf6' : customer.plan === 'Pro' ? '#3b82f6' : '#10b981',
                            }}>{customer.plan}</span>
                            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{customer.revenue}</span>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}

                    {slide.subscriptionStats && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="max-w-lg mx-auto mb-6"
                      >
                        <div className="space-y-3">
                          {slide.subscriptionStats.map((stat, i) => (
                            <motion.div
                              key={stat.label}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + i * 0.06 }}
                              className="flex items-center gap-3"
                            >
                              <div className="w-20 text-right">
                                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
                              </div>
                              <div className="flex-1 h-6 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--input-bg)' }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${stat.percent}%` }}
                                  transition={{ delay: 0.5 + i * 0.1, duration: 0.6, ease: 'easeOut' }}
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: stat.color }}
                                />
                              </div>
                              <div className="w-24 flex items-center gap-2">
                                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{stat.count}</span>
                                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{stat.percent}%</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {slide.invoices && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="max-w-lg mx-auto mb-6 space-y-2"
                      >
                        {slide.invoices.map((inv, i) => (
                          <motion.div
                            key={inv.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + i * 0.06 }}
                            className="flex items-center gap-3 p-3 rounded-xl"
                            style={{ backgroundColor: 'var(--input-bg)' }}
                          >
                            <img src={inv.avatar} alt={inv.customer} className="w-8 h-8 rounded-full object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{inv.id}</p>
                              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{inv.customer}</p>
                            </div>
                            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{inv.amount}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{
                              backgroundColor: inv.status === 'Paid' ? 'rgba(16,185,129,0.15)' : inv.status === 'Open' ? 'rgba(245,158,11,0.15)' : 'rgba(107,114,128,0.15)',
                              color: inv.status === 'Paid' ? '#10b981' : inv.status === 'Open' ? '#f59e0b' : '#6b7280',
                            }}>{inv.status}</span>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}

                    {slide.dunningData && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="max-w-lg mx-auto mb-6"
                      >
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          {[
                            { label: 'Failed', value: slide.dunningData.totalFailed, color: '#ef4444' },
                            { label: 'Recovered', value: slide.dunningData.recovered, color: '#10b981' },
                            { label: 'Rate', value: slide.dunningData.recoveryRate, color: '#3b82f6' },
                          ].map((item) => (
                            <div key={item.label} className="p-3 rounded-xl text-center" style={{ backgroundColor: 'var(--input-bg)' }}>
                              <p className="text-[10px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                              <p className="text-lg font-bold" style={{ color: item.color }}>{item.value}</p>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-2">
                          {slide.dunningData.attempts.map((a, i) => (
                            <motion.div
                              key={a.customer}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.45 + i * 0.06 }}
                              className="flex items-center gap-3 p-3 rounded-xl"
                              style={{ backgroundColor: 'var(--input-bg)' }}
                            >
                              <img src={a.avatar} alt={a.customer} className="w-8 h-8 rounded-full object-cover" />
                              <div className="flex-1">
                                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{a.customer}</p>
                                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{a.attempts} attempt{a.attempts > 1 ? 's' : ''}</p>
                              </div>
                              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{a.amount}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{
                                backgroundColor: a.status === 'Recovered' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                                color: a.status === 'Recovered' ? '#10b981' : '#f59e0b',
                              }}>{a.status}</span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {slide.reportData && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="max-w-lg mx-auto mb-6"
                      >
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          {slide.reportData.plans.map((plan) => (
                            <div key={plan.name} className="p-3 rounded-xl" style={{ backgroundColor: 'var(--input-bg)' }}>
                              <p className="text-[10px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{plan.name}</p>
                              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{plan.revenue}</p>
                              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{plan.users} users</p>
                              <p className="text-[10px] font-bold mt-1" style={{ color: '#10b981' }}>{plan.growth}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--input-bg)' }}>
                          <div>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Total Revenue</p>
                            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{slide.reportData.totalRevenue}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Top Plan</p>
                            <p className="text-sm font-bold" style={{ color: 'var(--primary)' }}>{slide.reportData.topPlan}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Avg Growth</p>
                            <p className="text-sm font-bold" style={{ color: '#10b981' }}>{slide.reportData.avgGrowth}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {slide.liveFeed && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="max-w-lg mx-auto mb-6 space-y-2"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#10b981' }} />
                          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>LIVE FEED</span>
                        </div>
                        {slide.liveFeed.map((item, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + i * 0.08 }}
                            className="flex items-center gap-3 p-3 rounded-xl"
                            style={{ backgroundColor: 'var(--input-bg)' }}
                          >
                            <div className="w-2 h-2 rounded-full" style={{
                              backgroundColor: item.type === 'success' ? '#10b981' : item.type === 'warning' ? '#f59e0b' : '#3b82f6',
                            }} />
                            <div className="flex-1">
                              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.event}</p>
                            </div>
                            <span className="text-sm font-bold" style={{
                              color: item.amount.startsWith('+') ? '#10b981' : 'var(--text-primary)',
                            }}>{item.amount}</span>
                            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{item.time}</span>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}

                    {slide.trustedCompanies && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="max-w-lg mx-auto mb-6"
                      >
                        <p className="text-xs font-semibold text-center mb-4" style={{ color: 'var(--text-muted)' }}>TRUSTED BY INDUSTRY LEADERS</p>
                        <div className="flex items-center justify-center gap-8 opacity-60">
                          {slide.trustedCompanies.map((logo, i) => (
                            <motion.img
                              key={i}
                              src={logo}
                              alt="Company logo"
                              className="h-8 object-contain"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.6 }}
                              transition={{ delay: 0.5 + i * 0.1 }}
                              style={{ filter: 'grayscale(1) brightness(2)' }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Features + Stat */}
                    <div className="flex items-start gap-5 max-w-lg mx-auto">
                      <div className="flex-1 space-y-3">
                        {slide.features.map((f, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -25 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35 + i * 0.08, type: 'spring', stiffness: 200 }}
                            className="flex items-center gap-3 text-sm"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: slide.gradient }}>
                              <CheckCircle className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="font-medium">{f}</span>
                          </motion.div>
                        ))}
                      </div>

                      <motion.div
                        initial={{ opacity: 0, scale: 0.7, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                        className="w-32 h-32 rounded-2xl flex flex-col items-center justify-center text-white flex-shrink-0 relative overflow-hidden"
                        style={{ background: slide.gradient }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                        <div className="relative flex flex-col items-center">
                          <div className="mb-1 opacity-80">{slide.stat.icon}</div>
                          <span className="text-3xl font-bold leading-none">{slide.stat.value}</span>
                          <span className="text-[10px] font-medium opacity-75 mt-1">{slide.stat.label}</span>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom nav */}
            <div className="px-10 pb-7">
              <div className="flex items-center justify-center gap-2 mb-5">
                {slides.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className="relative rounded-full transition-all duration-400 overflow-hidden"
                    style={{
                      height: i === current ? '8px' : '6px',
                      width: i === current ? '32px' : '6px',
                      backgroundColor: i === current ? 'var(--primary)' : 'var(--input-border)',
                    }}
                  >
                    {i === current && (
                      <motion.div className="absolute inset-0 rounded-full" style={{ background: slide.gradient }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.3 }} />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <button onClick={onClose} className="text-sm font-medium px-5 py-2.5 rounded-xl btn-press" style={{ color: 'var(--text-muted)' }}>
                  Skip
                </button>
                <div className="flex items-center gap-3">
                  <button onClick={prev} className="w-10 h-10 rounded-xl btn-press flex items-center justify-center" style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-secondary)' }}>
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {current === slides.length - 1 ? (
                    <button onClick={onClose} className="h-10 px-7 rounded-xl text-sm font-bold text-white btn-press flex items-center gap-2 shadow-lg" style={{ background: slide.gradient }}>
                      Get Started <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={next} className="h-10 px-7 rounded-xl text-sm font-bold text-white btn-press flex items-center gap-2 shadow-lg" style={{ background: slide.gradient }}>
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="text-center mt-3">
                <span className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                  {current + 1} / {slides.length}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
