'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, CreditCard, Shield, BarChart3, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              BillFlow
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/login')}>
              Sign in
            </Button>
            <Button onClick={() => router.push('/register')}>
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-gradient-to-r from-violet-600/20 to-indigo-600/20 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              Now in Public Beta
            </span>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Subscription Billing
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-sky-400 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>

            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              The modern billing platform for SaaS businesses. Manage subscriptions, 
              process payments, and track revenue — all in one place.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Button size="lg" onClick={() => router.push('/register')}>
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: '$2B+', label: 'Transactions processed' },
              { value: '10,000+', label: 'Businesses trust us' },
              { value: '99.9%', label: 'Uptime guaranteed' },
              { value: '150+', label: 'Countries supported' },
            ].map((stat, index) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-400 mt-2">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Powerful features to manage your entire subscription lifecycle
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <CreditCard className="w-6 h-6" />,
                title: 'Flexible Billing',
                description: 'Support for flat-rate, per-seat, usage-based, tiered, and hybrid billing models.',
                color: 'from-violet-600/20 to-indigo-600/20 border-violet-500/20',
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: 'Secure Payments',
                description: 'PCI-compliant payment processing with Stripe. Your customers\' data is always safe.',
                color: 'from-emerald-600/20 to-teal-600/20 border-emerald-500/20',
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: 'Advanced Analytics',
                description: 'Real-time revenue metrics, churn analysis, and customer lifetime value tracking.',
                color: 'from-sky-600/20 to-blue-600/20 border-sky-500/20',
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: 'Global Scale',
                description: 'Multi-currency support, tax compliance, and worldwide payment methods.',
                color: 'from-amber-600/20 to-orange-600/20 border-amber-500/20',
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: 'Developer First',
                description: 'RESTful API, webhooks, and SDKs for seamless integration with your stack.',
                color: 'from-rose-600/20 to-pink-600/20 border-rose-500/20',
              },
              {
                icon: <ArrowRight className="w-6 h-6" />,
                title: 'Smart Dunning',
                description: 'Automated retry logic to recover failed payments and reduce churn.',
                color: 'from-indigo-600/20 to-violet-600/20 border-indigo-500/20',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl border bg-gradient-to-br ${feature.color} hover:scale-105 transition-transform duration-300`}
              >
                <div className="w-12 h-12 rounded-xl bg-slate-900/50 flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative p-12 rounded-3xl border border-slate-800/50 bg-gradient-to-br from-violet-600/10 to-indigo-600/10 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-indigo-600/5" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to get started?
              </h2>
              <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto">
                Join thousands of businesses using BillFlow to manage their subscriptions.
              </p>
              <Button size="xl" onClick={() => router.push('/register')}>
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            &copy; 2024 BillFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
