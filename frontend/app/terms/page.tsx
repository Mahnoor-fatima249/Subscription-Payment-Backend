'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, ArrowLeft, FileText, Scale, CreditCard, AlertTriangle, Shield, Users, Gavel, RefreshCw } from 'lucide-react';

const sections = [
  {
    icon: <FileText className="w-5 h-5" />,
    title: 'Acceptance of Terms',
    content: `By accessing or using BillFlow ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.

These Terms constitute a legally binding agreement between you ("User," "you," or "your") and BillFlow, Inc. ("BillFlow," "we," "us," or "our").

We may modify these Terms at any time. Material changes will be communicated via email or in-app notification at least 30 days before taking effect. Continued use after changes constitutes acceptance of the modified Terms.`,
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: 'Account Registration',
    content: `To use our Service, you must:

- Be at least 18 years old (or the age of majority in your jurisdiction)
- Provide accurate and complete registration information
- Maintain the security of your account credentials
- Notify us immediately of any unauthorized use

You are responsible for all activity that occurs under your account. You may not:
- Share your account credentials with others
- Create multiple accounts for the same organization
- Use the Service for any unlawful purpose
- Interfere with or disrupt the Service`,
  },
  {
    icon: <CreditCard className="w-5 h-5" />,
    title: 'Subscription and Payment',
    content: `**Free Trial:**
- New users receive a 14-day free trial
- No credit card required for trial
- Full access to all features during trial

**Paid Subscriptions:**
- Billing begins when your trial expires and you select a plan
- Payments are processed securely via Stripe
- You authorize us to charge your selected payment method

**Pricing:**
- All prices are in USD unless otherwise specified
- Prices exclude applicable taxes
- We reserve the right to modify pricing with 30 days notice

**Refunds:**
- 30-day money-back guarantee for new subscriptions
- Pro-rated refunds for annual plans cancelled within 30 days
- No refunds for partial months on monthly plans`,
  },
  {
    icon: <RefreshCw className="w-5 h-5" />,
    title: 'Cancellation and Termination',
    content: `**Your Rights:**
- Cancel your subscription at any time from your dashboard
- Cancellation takes effect at the end of your current billing period
- You retain access to the Service until the end of your paid period

**Our Rights:**
- We may suspend or terminate your account for violation of these Terms
- We may discontinue the Service with 90 days notice
- We will provide a pro-rated refund for any prepaid, unused period

**Data After Cancellation:**
- Your data remains available for export for 30 days after cancellation
- After 30 days, your data may be permanently deleted
- We may retain certain data as required by law or for legitimate business purposes`,
  },
  {
    icon: <Scale className="w-5 h-5" />,
    title: 'Acceptable Use',
    content: `You agree not to use the Service to:

- Violate any applicable laws or regulations
- Infringe on intellectual property rights
- Transmit harmful, abusive, or offensive content
- Attempt to gain unauthorized access to any part of the Service
- Interfere with or disrupt the Service or servers
- Use automated systems (bots) without our written permission
- Resell or redistribute the Service without authorization
- Process payments for illegal goods or services

We reserve the right to investigate and take appropriate action against anyone who violates these restrictions, including suspension or termination of access.`,
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Intellectual Property',
    content: `**Our Property:**
- The Service, including all software, text, graphics, and logos
- Our brand names, trademarks, and service marks
- All intellectual property rights in the Service

**Your Property:**
- You retain all rights to your data and content
- You grant us a limited license to process your data as necessary to provide the Service
- You are responsible for ensuring your content does not violate third-party rights

**Feedback:**
If you provide feedback or suggestions about the Service, you grant us a perpetual, irrevocable license to use that feedback without obligation to you.`,
  },
  {
    icon: <AlertTriangle className="w-5 h-5" />,
    title: 'Disclaimer of Warranties',
    content: `THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:

- MERCHANTABILITY
- FITNESS FOR A PARTICULAR PURPOSE
- NON-INFRINGEMENT
- ACCURACY OR COMPLETENESS

We do not warrant that:
- The Service will be uninterrupted or error-free
- Defects will be corrected
- The Service is free of viruses or harmful components
- Your use of the Service will meet your specific requirements

Some jurisdictions do not allow the exclusion of certain warranties, so some of the above exclusions may not apply to you.`,
  },
  {
    icon: <Gavel className="w-5 h-5" />,
    title: 'Limitation of Liability',
    content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW:

- BillFlow shall not be liable for any indirect, incidental, special, consequential, or punitive damages
- Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim
- We are not liable for loss of profits, data, business, or goodwill

These limitations apply regardless of the legal theory (contract, tort, strict liability, or otherwise) and even if we have been advised of the possibility of such damages.

Some jurisdictions do not allow limitation of liability for certain damages, so some of the above limitations may not apply to you.`,
  },
  {
    icon: <Gavel className="w-5 h-5" />,
    title: 'Governing Law',
    content: `These Terms are governed by and construed in accordance with the laws of the State of California, United States, without regard to conflict of law principles.

**Dispute Resolution:**
- Any disputes shall first be addressed through good-faith negotiation
- If unresolved within 30 days, disputes shall be submitted to binding arbitration
- Arbitration shall be conducted in San Francisco, California
- The arbitration shall be conducted in English

**Class Action Waiver:**
You agree that any dispute resolution proceedings will be conducted on an individual basis and not as a class, consolidated, or representative action.`,
  },
];

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b glass" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="flex items-center gap-2 btn-press">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center pulse-glow" style={{ background: 'var(--accent-gradient)' }}>
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">BillFlow</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/login')} className="text-sm font-medium transition-colors" style={{ color: 'var(--text-secondary)' }}>Sign in</button>
            <button onClick={() => router.push('/register')} className="h-10 px-5 rounded-2xl text-sm font-semibold text-white btn-press" style={{ background: 'var(--accent-gradient)' }}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full" style={{ background: 'var(--accent-gradient)', filter: 'blur(100px)' }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <button onClick={() => router.push('/')} className="inline-flex items-center gap-2 text-sm font-medium mb-6 btn-press" style={{ color: 'var(--text-secondary)' }}>
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-white mx-auto mb-6" style={{ background: 'var(--accent-gradient)' }}>
              <Scale className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Terms of Service</h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Please read these terms carefully before using our service.
            </p>
            <p className="text-sm mt-4" style={{ color: 'var(--text-muted)' }}>Last updated: August 28, 2026</p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          {/* Quick Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl mb-12 glow-card"
            style={{ backgroundColor: 'var(--card-bg-from)', border: '1px solid var(--card-border)' }}
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Terms at a Glance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: <RefreshCw className="w-5 h-5" />, title: 'Easy Cancel', desc: 'Cancel anytime, no questions asked' },
                { icon: <Shield className="w-5 h-5" />, title: 'Fair Pricing', desc: '30-day money-back guarantee' },
                { icon: <Scale className="w-5 h-5" />, title: 'Your Data', desc: 'You own your data, always' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--input-bg)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent-gradient)', color: 'white' }}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.05 }}
                className="p-6 rounded-2xl glow-card"
                style={{ backgroundColor: 'var(--card-bg-from)', border: '1px solid var(--card-border)' }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-gradient)', color: 'white' }}>
                    {section.icon}
                  </div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{section.title}</h2>
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                  {section.content.split('\n').map((line, i) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <p key={i} className="font-semibold mt-4 mb-2" style={{ color: 'var(--text-primary)' }}>{line.replace(/\*\*/g, '')}</p>;
                    }
                    if (line.startsWith('- ')) {
                      return (
                        <div key={i} className="flex items-start gap-2 ml-4 mb-1">
                          <span style={{ color: 'var(--primary)' }}>•</span>
                          <span>{line.replace(/^- /, '')}</span>
                        </div>
                      );
                    }
                    if (line.startsWith('**')) {
                      return <p key={i} className="font-semibold mt-4 mb-2" style={{ color: 'var(--text-primary)' }}>{line.replace(/\*\*/g, '')}</p>;
                    }
                    return <p key={i} className="mb-2">{line}</p>;
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 p-8 rounded-2xl text-center glow-card"
            style={{ backgroundColor: 'var(--card-bg-from)', border: '1px solid var(--card-border)' }}
          >
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Questions about our terms?</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Contact our legal team for any clarification.</p>
            <button onClick={() => router.push('/support')} className="h-10 px-6 rounded-xl text-sm font-semibold text-white btn-press" style={{ background: 'var(--accent-gradient)' }}>
              Contact Support
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>&copy; 2026 BillFlow. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>Privacy</a>
            <a href="/terms" className="text-sm font-medium transition-colors" style={{ color: 'var(--primary)' }}>Terms</a>
            <a href="/support" className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
