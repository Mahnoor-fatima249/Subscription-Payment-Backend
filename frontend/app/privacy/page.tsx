'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, ArrowLeft, Shield, Lock, Eye, Database, Mail, Globe, Users, FileText } from 'lucide-react';

const sections = [
  {
    icon: <Database className="w-5 h-5" />,
    title: 'Information We Collect',
    content: `We collect information you provide directly to us, such as when you create an account, subscribe to our service, or contact us for support.

**Personal Information:**
- Name, email address, and company information
- Payment and billing information (processed securely via Stripe)
- Account credentials and preferences

**Usage Data:**
- How you interact with our platform
- Features you use and actions you take
- Device and browser information
- IP address and location data

**Transaction Data:**
- Subscription and billing history
- Payment methods and transaction records
- Invoice and receipt information`,
  },
  {
    icon: <Eye className="w-5 h-5" />,
    title: 'How We Use Your Information',
    content: `We use the information we collect to:

- Provide, maintain, and improve our services
- Process transactions and send related information
- Send technical notices, updates, and support messages
- Respond to your comments and questions
- Analyze usage patterns to improve user experience
- Detect, prevent, and address technical issues
- Comply with legal obligations

We do not sell your personal information to third parties. We may share your information only in the following circumstances:
- With your explicit consent
- To comply with legal obligations
- To protect our rights and safety
- With service providers who assist in our operations`,
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: 'Data Security',
    content: `We take the security of your data seriously and implement industry-standard measures:

**Encryption:**
- All data is encrypted in transit using TLS 1.3
- Data at rest is encrypted using AES-256
- Payment information is tokenized and never stored on our servers

**Infrastructure:**
- Hosted on SOC 2 certified infrastructure
- Regular security audits and penetration testing
- Automated threat detection and monitoring

**Access Controls:**
- Role-based access control for all systems
- Multi-factor authentication for admin access
- Regular access reviews and audits

**Compliance:**
- PCI DSS Level 1 compliant for payment processing
- GDPR compliant data processing
- CCPA compliant privacy practices`,
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: 'Data Processing Locations',
    content: `Your data is processed and stored in secure data centers located in:

- **United States** (Primary) - AWS us-east-1 (Virginia)
- **European Union** - AWS eu-west-1 (Ireland)
- **Asia Pacific** - AWS ap-southeast-1 (Singapore)

We ensure that data transfers comply with applicable data protection laws, including GDPR. When transferring data outside the EU, we use Standard Contractual Clauses (SCCs) or other appropriate safeguards.

You may request your data to be stored in a specific region by contacting our support team.`,
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: 'Your Rights',
    content: `Depending on your location, you have the following rights:

**For EU/EEA Residents (GDPR):**
- **Right of Access** - Request a copy of your personal data
- **Right to Rectification** - Request correction of inaccurate data
- **Right to Erasure** - Request deletion of your personal data
- **Right to Restrict Processing** - Request limitation of data processing
- **Right to Data Portability** - Receive your data in a portable format
- **Right to Object** - Object to processing of your personal data

**For California Residents (CCPA):**
- Right to know what personal information is collected
- Right to delete personal information
- Right to opt-out of sale of personal information
- Right to non-discrimination for exercising rights

To exercise these rights, please contact us at privacy@billflow.com`,
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: 'Cookies and Tracking',
    content: `We use cookies and similar technologies to:

**Essential Cookies:**
- Required for the service to function
- Handle authentication and security
- Remember your preferences

**Analytics Cookies:**
- Help us understand how you use our service
- Identify popular features and areas for improvement
- We use privacy-focused analytics (no third-party tracking)

**Marketing Cookies:**
- Only used if you opt-in to marketing communications
- Help deliver relevant content
- Can be disabled at any time

You can control cookies through your browser settings. Disabling essential cookies may affect service functionality.`,
  },
  {
    icon: <Mail className="w-5 h-5" />,
    title: 'Contact Us',
    content: `If you have any questions about this Privacy Policy or our data practices, please contact us:

**Email:** privacy@billflow.com

**Mail:**
BillFlow, Inc.
123 Innovation Drive
San Francisco, CA 94105
United States

**Data Protection Officer:**
dpo@billflow.com

**Response Time:**
We aim to respond to all privacy-related inquiries within 5 business days.

For general support questions, please visit our [Support Center](/support).`,
  },
];

export default function PrivacyPage() {
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
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Privacy Policy</h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
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
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Privacy at a Glance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: <Lock className="w-5 h-5" />, title: 'Encrypted', desc: 'All data encrypted in transit and at rest' },
                { icon: <Shield className="w-5 h-5" />, title: 'PCI Compliant', desc: 'Level 1 PCI DSS certified' },
                { icon: <Eye className="w-5 h-5" />, title: 'No Selling', desc: 'We never sell your personal data' },
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
                    if (line.startsWith('- **')) {
                      const parts = line.replace(/^- /, '').split(' - ');
                      return (
                        <div key={i} className="flex items-start gap-2 ml-4 mb-1">
                          <span style={{ color: 'var(--primary)' }}>•</span>
                          <span><strong style={{ color: 'var(--text-primary)' }}>{parts[0]}</strong>{parts[1] ? ` - ${parts[1]}` : ''}</span>
                        </div>
                      );
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
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Questions about privacy?</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Our team is here to help with any privacy-related concerns.</p>
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
            <a href="/privacy" className="text-sm font-medium transition-colors" style={{ color: 'var(--primary)' }}>Privacy</a>
            <a href="/terms" className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>Terms</a>
            <a href="/support" className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
