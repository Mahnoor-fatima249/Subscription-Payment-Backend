'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ArrowRight, CreditCard, Shield, BarChart3, Globe, Play, CheckCircle, ChevronDown, Star, Users, TrendingUp, Clock, Headphones, Layers, Quote, RefreshCw, Code, Lock, Sparkles, Target, Activity, DollarSign } from 'lucide-react';
import { DemoModal } from '@/components/ui/demo-modal';

const features = [
  { icon: <CreditCard className="w-6 h-6" />, title: 'Flexible Billing', description: 'Flat-rate, per-seat, usage-based, tiered, and hybrid billing models. Choose what works for your business.', gradient: 'from-violet-600/20 to-indigo-600/20' },
  { icon: <Shield className="w-6 h-6" />, title: 'Secure Payments', description: 'PCI-compliant payment processing. Your customers\' data is always protected with enterprise-grade security.', gradient: 'from-emerald-600/20 to-teal-600/20' },
  { icon: <BarChart3 className="w-6 h-6" />, title: 'Advanced Analytics', description: 'Real-time revenue metrics, churn analysis, and customer lifetime value tracking. Data that drives decisions.', gradient: 'from-sky-600/20 to-blue-600/20' },
  { icon: <Globe className="w-6 h-6" />, title: 'Global Scale', description: 'Multi-currency support, tax compliance, and worldwide payment methods. Grow without boundaries.', gradient: 'from-amber-600/20 to-orange-600/20' },
  { icon: <Zap className="w-6 h-6" />, title: 'Developer First', description: 'RESTful API, webhooks, and SDKs. Build on top of BillFlow or integrate with your existing stack.', gradient: 'from-rose-600/20 to-pink-600/20' },
  { icon: <TrendingUp className="w-6 h-6" />, title: 'Smart Dunning', description: 'Automated retry logic to recover failed payments. Save up to 30% of revenue that would otherwise be lost.', gradient: 'from-indigo-600/20 to-violet-600/20' },
];

const steps = [
  { step: '01', title: 'Create Your Plans', description: 'Set up your pricing plans in minutes. Flat-rate, per-seat, or usage-based — whatever fits your business.', icon: <Layers className="w-6 h-6" /> },
  { step: '02', title: 'Connect Your Payments', description: 'Link your payment provider and start accepting subscriptions. Stripe, PayPal, and more coming soon.', icon: <CreditCard className="w-6 h-6" /> },
  { step: '03', title: 'Track Everything', description: 'Watch your revenue grow in real-time. MRR, churn, LTV — all the metrics that matter, in one place.', icon: <BarChart3 className="w-6 h-6" /> },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'CEO, TechStart', content: 'BillFlow replaced 3 different tools we were using. The dashboard alone saved us hours every week. Our revenue tracking is finally accurate.', rating: 5, avatar: 'https://i.pravatar.cc/80?img=1', company: 'TechStart Inc.', revenue: '$2.4M ARR' },
  { name: 'Marcus Johnson', role: 'Founder, CloudNine', content: 'The dunning feature alone paid for the entire platform. We recovered $47K in failed payments last quarter. Absolutely incredible tool.', rating: 5, avatar: 'https://i.pravatar.cc/80?img=3', company: 'CloudNine Labs', revenue: '$8.1M ARR' },
  { name: 'Emily Rodriguez', role: 'CTO, DataFlow', content: 'Clean API, beautiful UI, and the analytics are actually useful. Not just vanity metrics. Our churn dropped 23% in 3 months.', rating: 5, avatar: 'https://i.pravatar.cc/80?img=5', company: 'DataFlow AI', revenue: '$1.8M ARR' },
  { name: 'James Wilson', role: 'VP Finance, NovaCraft', content: 'Finally, a billing platform that finance teams actually love. The reporting is crystal clear and reconciliation takes minutes.', rating: 5, avatar: 'https://i.pravatar.cc/80?img=8', company: 'NovaCraft', revenue: '$5.2M ARR' },
  { name: 'Priya Sharma', role: 'Head of Growth, QuantumLeap', content: 'Switching to BillFlow increased our subscription conversion by 34%. The checkout experience is seamless for our customers.', rating: 5, avatar: 'https://i.pravatar.cc/80?img=9', company: 'QuantumLeap', revenue: '$12M ARR' },
  { name: 'Alex Kim', role: 'Engineering Lead, BrightPath', content: 'The API documentation is superb. We integrated BillFlow in under a week. The webhook system is rock solid.', rating: 5, avatar: 'https://i.pravatar.cc/80?img=11', company: 'BrightPath', revenue: '$3.6M ARR' },
];

const pricing = [
  { name: 'Starter', price: 29, period: 'month', description: 'Perfect for small teams getting started', features: ['5 projects', '10GB storage', '3 team members', 'Basic analytics', 'Email support'], gradient: 'from-violet-600/10 to-indigo-600/10', popular: false },
  { name: 'Pro', price: 99, period: 'month', description: 'For growing businesses that need more', features: ['Unlimited projects', '100GB storage', '10 team members', 'Advanced analytics', 'Priority support', 'API access', 'Custom integrations'], gradient: 'from-violet-600/20 to-indigo-600/20', popular: true },
  { name: 'Enterprise', price: 299, period: 'month', description: 'For large organizations with custom needs', features: ['Unlimited everything', '1TB storage', 'Unlimited members', 'Custom analytics', 'Dedicated manager', 'SLA 99.9%', 'White-label option', 'Custom integrations'], gradient: 'from-violet-600/10 to-indigo-600/10', popular: false },
];

const faqs = [
  { question: 'How does the free trial work?', answer: 'You get 14 days of full access to all features. No credit card required. If you love it, pick a plan. If not, no hard feelings.' },
  { question: 'Can I change plans later?', answer: 'Absolutely. Upgrade or downgrade anytime. Changes take effect immediately, and we prorate the difference.' },
  { question: 'What payment methods do you support?', answer: 'We support all major credit cards, debit cards, and bank transfers via Stripe. PayPal coming soon.' },
  { question: 'Is my data secure?', answer: 'Yes. We use bank-level encryption, PCI compliance, and SOC 2 certified infrastructure. Your data is safe with us.' },
  { question: 'Do you offer refunds?', answer: 'We offer a 30-day money-back guarantee. If you\'re not happy, we\'ll refund you — no questions asked.' },
  { question: 'Can I cancel anytime?', answer: 'Yes, cancel anytime from your dashboard. No long-term contracts, no cancellation fees.' },
];

const integrations = [
  { name: 'Stripe', icon: '💳', color: '#635bff' },
  { name: 'PayPal', icon: '🅿️', color: '#003087' },
  { name: 'Slack', icon: '💬', color: '#4a154b' },
  { name: 'Zapier', icon: '⚡', color: '#ff4a00' },
  { name: 'HubSpot', icon: '🟠', color: '#ff7a59' },
  { name: 'Intercom', icon: '🔵', color: '#286efa' },
  { name: 'Segment', icon: '📊', color: '#52bd95' },
  { name: 'Mixpanel', icon: '📈', color: '#7856ff' },
];

const dashboardMetrics = [
  { label: 'Monthly Revenue', value: '$184,200', change: '+12.4%', icon: <DollarSign className="w-5 h-5" />, color: '#10b981' },
  { label: 'Active Subscribers', value: '12,847', change: '+8.2%', icon: <Users className="w-5 h-5" />, color: '#3b82f6' },
  { label: 'Churn Rate', value: '2.1%', change: '-0.4%', icon: <TrendingUp className="w-5 h-5" />, color: '#8b5cf6' },
  { label: 'Avg. Revenue/User', value: '$47.50', change: '+5.8%', icon: <Target className="w-5 h-5" />, color: '#f59e0b' },
];

export default function HomePage() {
  const router = useRouter();
  const [showDemo, setShowDemo] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b glass" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center pulse-glow" style={{ background: 'var(--accent-gradient)' }}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">BillFlow</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm font-medium transition-colors hidden md:block" style={{ color: 'var(--text-secondary)' }}>Features</a>
            <a href="#how-it-works" className="text-sm font-medium transition-colors hidden md:block" style={{ color: 'var(--text-secondary)' }}>How It Works</a>
            <a href="#integrations" className="text-sm font-medium transition-colors hidden md:block" style={{ color: 'var(--text-secondary)' }}>Integrations</a>
            <a href="#pricing" className="text-sm font-medium transition-colors hidden md:block" style={{ color: 'var(--text-secondary)' }}>Pricing</a>
            <button onClick={() => router.push('/login')} className="text-sm font-medium transition-colors" style={{ color: 'var(--text-secondary)' }}>Sign in</button>
            <button onClick={() => router.push('/register')} className="h-10 px-5 rounded-2xl text-sm font-semibold text-white btn-press" style={{ background: 'var(--accent-gradient)' }}>
              Get Started <ArrowRight className="w-4 h-4 inline ml-1" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full" style={{ background: 'var(--accent-gradient)', filter: 'blur(100px)' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ backgroundColor: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--primary)' }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--primary)' }} />
              Now in Public Beta
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight" style={{ color: 'var(--text-primary)' }}>
              Subscription Billing<br /><span className="gradient-text">Made Simple</span>
            </h1>
            <p className="text-xl max-w-2xl mx-auto mb-10" style={{ color: 'var(--text-secondary)' }}>
              The modern billing platform for SaaS businesses. Manage subscriptions, process payments, and track revenue — all in one beautiful dashboard.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => router.push('/register')} className="h-14 px-8 rounded-2xl text-base font-semibold text-white btn-press flex items-center gap-2" style={{ background: 'var(--accent-gradient)' }}>
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={() => setShowDemo(true)} className="h-14 px-8 rounded-2xl text-base font-semibold btn-press flex items-center gap-2" style={{ border: '2px solid var(--border)', color: 'var(--text-primary)', backgroundColor: 'var(--card-bg-from)' }}>
                <Play className="w-5 h-5" fill="currentColor" /> Watch Demo
              </button>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-16 relative max-w-5xl mx-auto"
          >
            <div className="relative rounded-2xl overflow-hidden glow-card" style={{ border: '1px solid var(--card-border)' }}>
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=680&fit=crop&auto=format"
                alt="BillFlow Dashboard"
                className="w-full h-auto rounded-2xl"
                style={{ filter: 'brightness(0.9) contrast(1.05)' }}
              />
              <div className="absolute inset-0 rounded-2xl" style={{
                background: 'linear-gradient(180deg, transparent 50%, var(--background) 100%)',
              }} />
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-2xl glass" style={{ border: '1px solid var(--card-border)' }}>
              <div className="flex -space-x-2">
                {['https://i.pravatar.cc/32?img=1', 'https://i.pravatar.cc/32?img=3', 'https://i.pravatar.cc/32?img=5', 'https://i.pravatar.cc/32?img=8'].map((avatar, i) => (
                  <img key={i} src={avatar} alt="" className="w-7 h-7 rounded-full border-2" style={{ borderColor: 'var(--card-bg-from)' }} />
                ))}
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>2,847</span> teams already billing smarter
              </span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '$2B+', label: 'Transactions processed' },
              { value: '10,000+', label: 'Businesses trust us' },
              { value: '99.9%', label: 'Uptime guaranteed' },
              { value: '150+', label: 'Countries supported' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</p>
                <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trusted Companies */}
      <section className="py-12 border-t border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--input-bg)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-semibold tracking-wider uppercase mb-8" style={{ color: 'var(--text-muted)' }}>
            Trusted by 10,000+ businesses worldwide
          </p>
          <div className="flex items-center justify-center flex-wrap gap-8 md:gap-14">
            {[
              { name: 'Microsoft', logo: '/logos/microsoft.svg' },
              { name: 'Amazon', logo: '/logos/amazon.svg' },
              { name: 'Google', logo: '/logos/google.svg' },
              { name: 'Stripe', logo: '/logos/stripe.svg' },
              { name: 'Shopify', logo: '/logos/shopify.svg' },
              { name: 'Slack', logo: '/logos/slack.svg' },
            ].map((company) => (
              <img
                key={company.name}
                src={company.logo}
                alt={company.name}
                className="h-7 md:h-8 object-contain opacity-40 hover:opacity-60 transition-opacity"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Live Dashboard Metrics */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold tracking-wider uppercase mb-3 block" style={{ color: 'var(--primary)' }}>Live Metrics</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Your business at a glance</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>Real-time metrics that help you make informed decisions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardMetrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl glow-card stat-glow"
                style={{ backgroundColor: 'var(--card-bg-from)', border: '1px solid var(--card-border)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${metric.color}15`, color: metric.color }}>
                    {metric.icon}
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full" style={{
                    backgroundColor: metric.change.startsWith('+') ? 'rgba(16,185,129,0.1)' : metric.change.startsWith('-') ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
                    color: metric.change.startsWith('+') ? '#10b981' : metric.change.startsWith('-') ? '#ef4444' : '#3b82f6',
                  }}>
                    {metric.change}
                  </span>
                </div>
                <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{metric.value}</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{metric.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20" style={{ backgroundColor: 'var(--input-bg)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold tracking-wider uppercase mb-3 block" style={{ color: 'var(--primary)' }}>Features</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Everything you need</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>Powerful features to manage your entire subscription lifecycle</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                className={`glow-card p-6 rounded-2xl border bg-gradient-to-br ${feature.gradient}`}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold tracking-wider uppercase mb-3 block" style={{ color: 'var(--primary)' }}>How It Works</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Up and running in 3 steps</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>No complicated setup. No technical expertise required.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.15 }}
                className="relative p-8 rounded-2xl glow-card" style={{ backgroundColor: 'var(--card-bg-from)', border: '1px solid var(--card-border)' }}>
                <div className="text-6xl font-bold mb-4 gradient-text opacity-20">{step.step}</div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4" style={{ background: 'var(--accent-gradient)' }}>{step.icon}</div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="py-20" style={{ backgroundColor: 'var(--input-bg)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold tracking-wider uppercase mb-3 block" style={{ color: 'var(--primary)' }}>Integrations</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Connects with your favorite tools</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>Seamlessly integrates with the tools you already use and love</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {integrations.map((integration, index) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 rounded-2xl glow-card text-center group cursor-pointer"
                style={{ backgroundColor: 'var(--card-bg-from)', border: '1px solid var(--card-border)' }}
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{integration.icon}</div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{integration.name}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              <span className="font-semibold" style={{ color: 'var(--primary)' }}>+50 more</span> integrations available
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold tracking-wider uppercase mb-3 block" style={{ color: 'var(--primary)' }}>Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Loved by businesses worldwide</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>Don&apos;t just take our word for it — hear from our customers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, index) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl glow-card" style={{ backgroundColor: 'var(--card-bg-from)', border: '1px solid var(--card-border)' }}>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>&ldquo;{t.content}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold" style={{ color: 'var(--primary)' }}>{t.revenue}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20" style={{ backgroundColor: 'var(--input-bg)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold tracking-wider uppercase mb-3 block" style={{ color: 'var(--primary)' }}>Pricing</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Simple, transparent pricing</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>No hidden fees. No surprises. Pick a plan that fits your business.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricing.map((plan, index) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                className={`relative p-8 rounded-2xl glow-card ${plan.popular ? 'ring-2' : ''}`} style={{
                  backgroundColor: 'var(--card-bg-from)',
                  border: '1px solid var(--card-border)',
                  ['--tw-ring-color' as string]: plan.popular ? 'var(--primary)' : undefined,
                }}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white" style={{ background: 'var(--accent-gradient)' }}>Most Popular</div>
                )}
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{plan.name}</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{plan.description}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>${plan.price}</span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/{plan.period}</span>
                </div>
                <button onClick={() => router.push('/register')} className={`w-full h-12 rounded-xl text-sm font-semibold btn-press mb-6 ${plan.popular ? 'text-white' : ''}`} style={{
                  background: plan.popular ? 'var(--accent-gradient)' : 'transparent',
                  border: plan.popular ? 'none' : '1px solid var(--border)',
                  color: plan.popular ? 'white' : 'var(--text-primary)',
                }}>Get Started</button>
                <div className="space-y-3">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--primary)' }} />{f}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Wall of Love - Social Proof */}
      <section className="py-20" style={{ backgroundColor: 'var(--input-bg)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold tracking-wider uppercase mb-3 block" style={{ color: 'var(--primary)' }}>Wall of Love</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>What people are saying</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>Real tweets and messages from happy customers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: '@sarahbuilds', handle: 'Sarah K.', text: 'Just migrated from Chargebee to @BillFlow and wow... the dashboard is STUNNING. MRR tracking that actually makes sense. 🤯', time: '2h ago', likes: 247, avatar: 'https://i.pravatar.cc/80?img=25', verified: true },
              { name: '@devfounder', handle: 'Alex M.', text: 'The dunning feature recovered $8.2K in failed payments last month. That alone pays for BillFlow 10x over. Absolute no-brainer.', time: '5h ago', likes: 892, avatar: 'https://i.pravatar.cc/80?img=33', verified: true },
              { name: '@techstartupceo', handle: 'Priya R.', text: 'We switched to BillFlow and our subscription churn dropped 27% in the first quarter. The customer portal is beautiful.', time: '8h ago', likes: 534, avatar: 'https://i.pravatar.cc/80?img=41', verified: false },
              { name: '@saasfounder', handle: 'Marcus T.', text: 'Finally a billing platform where the API docs are actually good. Integrated BillFlow in 2 days. The webhooks are rock solid.', time: '12h ago', likes: 371, avatar: 'https://i.pravatar.cc/80?img=53', verified: true },
              { name: '@growthlead', handle: 'Emily W.', text: 'Our finance team literally applauded when we showed them the BillFlow reports. No more Excel sheets. Revenue by plan, churn analysis, everything.', time: '1d ago', likes: 623, avatar: 'https://i.pravatar.cc/80?img=44', verified: true },
              { name: '@bootstraphq', handle: 'Jordan L.', text: 'Started with the Starter plan, now on Pro. BillFlow scales perfectly. Went from 50 to 2,000 subscribers without a hitch.', time: '1d ago', likes: 415, avatar: 'https://i.pravatar.cc/80?img=60', verified: false },
            ].map((tweet, index) => (
              <motion.div
                key={tweet.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="p-5 rounded-2xl glow-card"
                style={{ backgroundColor: 'var(--card-bg-from)', border: '1px solid var(--card-border)' }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <img src={tweet.avatar} alt={tweet.handle} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{tweet.handle}</span>
                      {tweet.verified && (
                        <svg className="w-4 h-4" viewBox="0 0 22 22" fill="none">
                          <circle cx="11" cy="11" r="11" fill="var(--primary)" />
                          <path d="M7 11l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{tweet.name}</span>
                  </div>
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="#1DA1F2">
                    <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" />
                  </svg>
                </div>
                <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{tweet.text}</p>
                <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>{tweet.time}</span>
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                    <span>{tweet.likes}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Before vs After */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold tracking-wider uppercase mb-3 block" style={{ color: 'var(--primary)' }}>The Difference</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Before BillFlow vs After BillFlow</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>See how businesses transform their billing operations</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-2xl"
              style={{ backgroundColor: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,0.15)' }}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </div>
                <h3 className="text-xl font-bold" style={{ color: '#ef4444' }}>Before</h3>
              </div>
              <div className="space-y-4">
                {[
                  'Manually sending invoices every month',
                  'Losing 30%+ revenue to failed payments',
                  'No visibility into MRR or churn',
                  'Spending 8+ hours on billing tasks',
                  'Customers complaining about billing issues',
                  'Using 4 different tools for billing',
                  'Tax compliance is a nightmare',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'rgba(239,68,68,0.15)' }}>
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </div>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* After */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-2xl"
              style={{ backgroundColor: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)' }}
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <h3 className="text-xl font-bold" style={{ color: '#10b981' }}>After BillFlow</h3>
              </div>
              <div className="space-y-4">
                {[
                  'Fully automated recurring billing',
                  'Smart dunning recovers 78% of failed payments',
                  'Real-time MRR, ARR, and churn analytics',
                  'Billing takes 30 minutes per month',
                  'Self-service customer portal',
                  'One platform for everything',
                  'Automatic tax compliance worldwide',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}>
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-16 border-t border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--input-bg)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Enterprise-Grade Security</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Your data is protected by industry-leading security measures</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Shield className="w-8 h-8" />, label: 'PCI DSS Level 1', desc: 'Certified compliant' },
              { icon: <Lock className="w-8 h-8" />, label: 'SOC 2 Type II', desc: 'Audited annually' },
              { icon: <Shield className="w-8 h-8" />, label: 'AES-256', desc: 'Encryption at rest' },
              { icon: <Globe className="w-8 h-8" />, label: 'GDPR', desc: 'Fully compliant' },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-5 rounded-2xl"
                style={{ backgroundColor: 'var(--card-bg-from)', border: '1px solid var(--card-border)' }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--accent-gradient)', color: 'white' }}>
                  {item.icon}
                </div>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-3xl text-center"
            style={{ background: 'var(--accent-gradient)' }}
          >
            <Sparkles className="w-8 h-8 text-white mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Stay in the loop</h2>
            <p className="text-sm text-white/80 mb-6 max-w-md mx-auto">
              Get weekly tips on subscription growth, billing best practices, and product updates. Join 4,200+ founders.
            </p>
            <div className="flex items-center gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="you@company.com"
                className="flex-1 h-12 px-4 rounded-xl border-0 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-white/30"
                style={{ backgroundColor: 'rgba(255,255,255,0.95)', color: '#0a0e1a' }}
              />
              <button className="h-12 px-6 rounded-xl text-sm font-bold btn-press" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                Subscribe
              </button>
            </div>
            <p className="text-xs text-white/50 mt-3">No spam. Unsubscribe anytime.</p>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold tracking-wider uppercase mb-3 block" style={{ color: 'var(--primary)' }}>FAQ</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Frequently asked questions</h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Everything you need to know about BillFlow</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--card-bg-from)', border: '1px solid var(--card-border)' }}>
                <button onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left">
                  <span className="text-sm font-semibold pr-4" style={{ color: 'var(--text-primary)' }}>{faq.question}</span>
                  <motion.div animate={{ rotate: openFaq === index ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}>
                      <p className="px-5 pb-5 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="relative p-12 rounded-3xl text-center overflow-hidden glow-card" style={{ backgroundColor: 'var(--card-bg-from)', border: '1px solid var(--card-border)' }}>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full" style={{ background: 'var(--accent-gradient)', filter: 'blur(80px)', opacity: 0.1 }} />
            </div>
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Ready to get started?</h2>
              <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Join thousands of businesses using BillFlow to manage their subscriptions. Start your free trial today.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button onClick={() => router.push('/register')} className="h-14 px-8 rounded-2xl text-base font-semibold text-white btn-press flex items-center gap-2" style={{ background: 'var(--accent-gradient)' }}>
                  Start Free Trial <ArrowRight className="w-5 h-5" />
                </button>
                <button onClick={() => setShowDemo(true)} className="h-14 px-8 rounded-2xl text-base font-semibold btn-press flex items-center gap-2" style={{ border: '2px solid var(--border)', color: 'var(--text-primary)', backgroundColor: 'transparent' }}>
                  <Play className="w-5 h-5" fill="currentColor" /> Watch Demo
                </button>
              </div>
              <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
                No credit card required &bull; 14-day free trial &bull; Cancel anytime
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-gradient)' }}><Zap className="w-4 h-4 text-white" /></div>
                <span className="font-bold gradient-text">BillFlow</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>The modern billing platform for SaaS businesses.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Product</h4>
              <div className="space-y-2">
                <a href="#features" className="block text-sm" style={{ color: 'var(--text-muted)' }}>Features</a>
                <a href="#pricing" className="block text-sm" style={{ color: 'var(--text-muted)' }}>Pricing</a>
                <a href="#integrations" className="block text-sm" style={{ color: 'var(--text-muted)' }}>Integrations</a>
                <a href="#" className="block text-sm" style={{ color: 'var(--text-muted)' }}>API Docs</a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Company</h4>
              <div className="space-y-2">
                <a href="#" className="block text-sm" style={{ color: 'var(--text-muted)' }}>About</a>
                <a href="#" className="block text-sm" style={{ color: 'var(--text-muted)' }}>Blog</a>
                <a href="#" className="block text-sm" style={{ color: 'var(--text-muted)' }}>Careers</a>
                <a href="#" className="block text-sm" style={{ color: 'var(--text-muted)' }}>Press</a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Resources</h4>
              <div className="space-y-2">
                <a href="/support" className="block text-sm" style={{ color: 'var(--text-muted)' }}>Help Center</a>
                <a href="#" className="block text-sm" style={{ color: 'var(--text-muted)' }}>Changelog</a>
                <a href="#" className="block text-sm" style={{ color: 'var(--text-muted)' }}>Status</a>
                <a href="#" className="block text-sm" style={{ color: 'var(--text-muted)' }}>Community</a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Legal</h4>
              <div className="space-y-2">
                <a href="/privacy" className="block text-sm" style={{ color: 'var(--text-muted)' }}>Privacy</a>
                <a href="/terms" className="block text-sm" style={{ color: 'var(--text-muted)' }}>Terms</a>
                <a href="/privacy" className="block text-sm" style={{ color: 'var(--text-muted)' }}>Security</a>
                <a href="/privacy" className="block text-sm" style={{ color: 'var(--text-muted)' }}>GDPR</a>
              </div>
            </div>
          </div>
          <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>&copy; 2026 BillFlow. All rights reserved.</p>
            <div className="flex items-center gap-4">
              {['Twitter', 'GitHub', 'LinkedIn', 'Discord'].map((social) => (
                <a key={social} href="#" className="text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>{social}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <DemoModal isOpen={showDemo} onClose={() => setShowDemo(false)} />
    </div>
  );
}
