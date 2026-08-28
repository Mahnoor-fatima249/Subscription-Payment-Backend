'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, ArrowRight, Zap } from 'lucide-react';

export default function LogoutPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('avatar');
    setLoggedOut(true);
  }, []);

  useEffect(() => {
    if (!loggedOut) return;
    if (countdown <= 0) {
      router.push('/login');
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, loggedOut, router]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full"
          style={{ background: 'var(--accent-gradient)', filter: 'blur(80px)' }}
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full"
          style={{ background: 'var(--accent-gradient-2)', filter: 'blur(80px)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 text-center max-w-sm mx-4"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
          className="flex items-center justify-center gap-2.5 mb-10"
        >
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--accent-gradient)' }}
          >
            <Zap className="w-5.5 h-5.5 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">BillFlow</span>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="glow-card rounded-3xl p-8 mb-6"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 12 }}
            className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))' }}
          >
            <LogOut className="w-7 h-7" style={{ color: 'var(--destructive)' }} />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl font-bold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Logged Out
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-sm mb-6"
            style={{ color: 'var(--text-secondary)' }}
          >
            You have been successfully signed out of your account.
          </motion.p>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mb-6"
          >
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              Redirecting to login in {countdown}s
            </p>
            <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--input-bg)' }}>
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: 'linear' }}
                className="h-full rounded-full"
                style={{ background: 'var(--accent-gradient)' }}
              />
            </div>
          </motion.div>

          {/* Login Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            onClick={() => router.push('/login')}
            className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold text-white btn-press"
            style={{ background: 'var(--accent-gradient)' }}
          >
            Sign In Again
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          Thanks for using BillFlow
        </motion.p>
      </motion.div>
    </div>
  );
}
