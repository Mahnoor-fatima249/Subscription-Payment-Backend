'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ArrowLeft, HelpCircle, Book, MessageSquare, Mail, Phone, Clock, Search, ChevronDown, ChevronRight, ExternalLink, CreditCard, Shield, Settings, Users, Zap as ZapIcon, Bug, Lightbulb } from 'lucide-react';

const faqCategories = [
  {
    title: 'Getting Started',
    icon: <Lightbulb className="w-5 h-5" />,
    color: '#10b981',
    faqs: [
      { q: 'How do I create my first subscription plan?', a: 'Go to Dashboard → Plans → Create Plan. Choose your billing model (flat-rate, per-seat, or usage-based), set pricing, and activate. Your plan is live in under 2 minutes.' },
      { q: 'How do I connect my payment provider?', a: 'Navigate to Settings → Integrations → Stripe. Click "Connect to Stripe" and follow the OAuth flow. Once connected, payments start flowing automatically.' },
      { q: 'Can I import existing customer data?', a: 'Yes! Go to Settings → Import and upload a CSV file. We support imports from Stripe, Chargebee, Recurly, and custom formats. Our team can help with large migrations.' },
      { q: 'What currencies are supported?', a: 'We support 135+ currencies including USD, EUR, GBP, JPY, and more. Currency conversion happens automatically based on your customer\'s location.' },
    ],
  },
  {
    title: 'Billing & Payments',
    icon: <CreditCard className="w-5 h-5" />,
    color: '#3b82f6',
    faqs: [
      { q: 'How does billing work?', a: 'BillFlow handles recurring billing automatically. When a subscription is active, we charge the customer on each billing cycle. Failed payments trigger our smart dunning system.' },
      { q: 'What payment methods do you accept?', a: 'We accept Visa, Mastercard, American Express, Discover, and ACH bank transfers via Stripe. PayPal support is coming Q1 2027.' },
      { q: 'How do refunds work?', a: 'Process refunds directly from the Invoices page. Full and partial refunds are supported. Refunds are processed within 5-10 business days to the customer\'s original payment method.' },
      { q: 'How does smart dunning work?', a: 'When a payment fails, our system automatically retries at optimal intervals (1, 3, 7, 14 days). Customers receive email notifications, and you can see recovery metrics in the Dunning dashboard.' },
    ],
  },
  {
    title: 'Account & Security',
    icon: <Shield className="w-5 h-5" />,
    color: '#8b5cf6',
    faqs: [
      { q: 'Is my data secure?', a: 'Absolutely. We use AES-256 encryption at rest, TLS 1.3 in transit, and are SOC 2 Type II and PCI DSS Level 1 certified. Your data is hosted on AWS with 99.99% uptime SLA.' },
      { q: 'How do I enable two-factor authentication?', a: 'Go to Settings → Security → Enable 2FA. We support authenticator apps (Google Authenticator, Authy) and SMS verification as backup.' },
      { q: 'Can I manage team member permissions?', a: 'Yes! Go to Settings → Team. You can invite members with roles: Admin (full access), Manager (billing & customers), or Viewer (read-only).' },
      { q: 'How do I export my data?', a: 'Go to Settings → Data Export. You can export all customers, subscriptions, invoices, and payment data as CSV or JSON. API export is also available.' },
    ],
  },
  {
    title: 'Integrations',
    icon: <ZapIcon className="w-5 h-5" />,
    color: '#f59e0b',
    faqs: [
      { q: 'What integrations do you support?', a: 'We integrate with Stripe, PayPal, Slack, Zapier, HubSpot, Intercom, Segment, Mixpanel, and 50+ more tools. Check our integrations page for the full list.' },
      { q: 'Do you have an API?', a: 'Yes! Our RESTful API covers all BillFlow features. We provide SDKs for JavaScript, Python, Ruby, and Go. Full API documentation is at docs.billflow.com.' },
      { q: 'Can I set up webhooks?', a: 'Absolutely. Go to Settings → Webhooks to configure endpoints for events like subscription.created, invoice.paid, payment.failed, and 30+ more events.' },
      { q: 'How do I connect Slack notifications?', a: 'Go to Settings → Integrations → Slack. Click "Add to Slack" and choose which events you want to receive as Slack messages (new subscriptions, failed payments, etc.).' },
    ],
  },
  {
    title: 'Troubleshooting',
    icon: <Bug className="w-5 h-5" />,
    color: '#ef4444',
    faqs: [
      { q: 'My customer\'s payment failed. What should I do?', a: 'Check the Dunning dashboard for retry status. If all retries failed, ask the customer to update their card in the Customer Portal. You can also manually retry from the Payments page.' },
      { q: 'The dashboard is showing incorrect data.', a: 'First, try a hard refresh (Ctrl+Shift+R). If the issue persists, check Settings → Sync Status to ensure all data is up to date. Contact support if the problem continues.' },
      { q: 'I can\'t log in to my account.', a: 'Try resetting your password via the login page. If you have 2FA enabled, use your backup codes. For persistent issues, contact support with your registered email address.' },
      { q: 'How do I report a bug?', a: 'Email bugs@billflow.com with a description, screenshots, and steps to reproduce. Our engineering team responds within 4 hours during business hours.' },
    ],
  },
];

const contactOptions = [
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'Live Chat',
    description: 'Chat with our support team in real-time',
    detail: 'Avg. response: 2 minutes',
    action: 'Start Chat',
    gradient: 'from-violet-600/20 to-indigo-600/20',
    available: true,
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: 'Email Support',
    description: 'Send us a detailed message',
    detail: 'support@billflow.com',
    action: 'Send Email',
    gradient: 'from-emerald-600/20 to-teal-600/20',
    available: true,
  },
  {
    icon: <Phone className="w-6 h-6" />,
    title: 'Phone Support',
    description: 'Enterprise customers only',
    detail: '+1 (888) 555-FLOW',
    action: 'Call Now',
    gradient: 'from-sky-600/20 to-blue-600/20',
    available: false,
  },
];

const quickLinks = [
  { icon: <Book className="w-5 h-5" />, title: 'Documentation', desc: 'API reference, guides, and tutorials', href: '#' },
  { icon: <ZapIcon className="w-5 h-5" />, title: 'Status Page', desc: 'Real-time system status and uptime', href: '#' },
  { icon: <Lightbulb className="w-5 h-5" />, title: 'Feature Requests', desc: 'Suggest new features and vote on ideas', href: '#' },
  { icon: <MessageSquare className="w-5 h-5" />, title: 'Community Forum', desc: 'Connect with other BillFlow users', href: '#' },
];

export default function SupportPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  const allFaqs = faqCategories.flatMap((cat) =>
    cat.faqs.map((faq) => ({ ...faq, category: cat.title }))
  );

  const filteredFaqs = searchQuery
    ? allFaqs.filter(
        (faq) =>
          faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

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
              <HelpCircle className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>How can we help?</h1>
            <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: 'var(--text-secondary)' }}>
              Search our knowledge base or contact our support team
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-2xl border text-base focus:ring-2 focus:ring-[var(--primary)]/20 transition-all duration-200"
                style={{ backgroundColor: 'var(--card-bg-from)', borderColor: 'var(--card-border)', color: 'var(--text-primary)' }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => (
              <motion.a
                key={link.title}
                href={link.href}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-2xl glow-card text-center group"
                style={{ backgroundColor: 'var(--card-bg-from)', border: '1px solid var(--card-border)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform" style={{ background: 'var(--accent-gradient)', color: 'white' }}>
                  {link.icon}
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{link.title}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{link.desc}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Contact Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contactOptions.map((option, index) => (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className={`p-5 rounded-2xl glow-card bg-gradient-to-br ${option.gradient} ${!option.available ? 'opacity-60' : ''}`}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  {option.icon}
                </div>
                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{option.title}</h3>
                <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{option.description}</p>
                <p className="text-xs font-medium mb-4" style={{ color: 'var(--primary)' }}>{option.detail}</p>
                <button
                  disabled={!option.available}
                  className="w-full h-10 rounded-xl text-sm font-semibold btn-press disabled:opacity-50"
                  style={{
                    background: option.available ? 'var(--accent-gradient)' : 'transparent',
                    border: option.available ? 'none' : '1px solid var(--border)',
                    color: option.available ? 'white' : 'var(--text-muted)',
                  }}
                >
                  {option.action}
                </button>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: 'var(--input-bg)' }}>
            <Clock className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Support Hours:</span> Monday - Friday, 9 AM - 6 PM PST. Emergency support available 24/7 for Enterprise customers.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Frequently Asked Questions</h2>

          {filteredFaqs ? (
            /* Search Results */
            <div className="space-y-3">
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                Found {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
              </p>
              {filteredFaqs.map((faq, index) => (
                <motion.div
                  key={faq.q}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="rounded-2xl overflow-hidden"
                  style={{ backgroundColor: 'var(--card-bg-from)', border: '1px solid var(--card-border)' }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === faq.q ? null : faq.q)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <div className="flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--primary)' }}>{faq.category}</span>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{faq.q}</span>
                    </div>
                    <motion.div animate={{ rotate: openFaq === faq.q ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openFaq === faq.q && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <p className="px-5 pb-5 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          ) : (
            /* Category View */
            <div className="space-y-4">
              {faqCategories.map((category, catIndex) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: catIndex * 0.05 }}
                  className="rounded-2xl overflow-hidden"
                  style={{ backgroundColor: 'var(--card-bg-from)', border: '1px solid var(--card-border)' }}
                >
                  <button
                    onClick={() => setActiveCategory(activeCategory === catIndex ? null : catIndex)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: category.color }}>
                        {category.icon}
                      </div>
                      <div>
                        <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{category.title}</span>
                        <span className="text-xs block" style={{ color: 'var(--text-muted)' }}>{category.faqs.length} questions</span>
                      </div>
                    </div>
                    <motion.div animate={{ rotate: activeCategory === catIndex ? 90 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronRight className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {activeCategory === catIndex && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <div className="px-5 pb-5 space-y-2">
                          {category.faqs.map((faq) => (
                            <div
                              key={faq.q}
                              className="rounded-xl overflow-hidden cursor-pointer"
                              style={{ backgroundColor: 'var(--input-bg)' }}
                              onClick={() => setOpenFaq(openFaq === faq.q ? null : faq.q)}
                            >
                              <div className="flex items-center justify-between p-4">
                                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{faq.q}</span>
                                <motion.div animate={{ rotate: openFaq === faq.q ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                  <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                                </motion.div>
                              </div>
                              <AnimatePresence>
                                {openFaq === faq.q && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                                    <p className="px-4 pb-4 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{faq.a}</p>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>&copy; 2026 BillFlow. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>Privacy</a>
            <a href="/terms" className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>Terms</a>
            <a href="/support" className="text-sm font-medium transition-colors" style={{ color: 'var(--primary)' }}>Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
