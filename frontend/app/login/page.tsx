'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [formData, setFormData] = React.useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Incorrect email or password');
        return;
      }

      setSuccess('Login successful! Redirecting...');
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      setTimeout(() => router.push('/dashboard'), 1200);
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Background */}
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center pulse-glow" style={{ background: 'var(--accent-gradient)' }}>
            <Zap className="w-5.5 h-5.5 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">BillFlow</span>
        </div>

        {/* Card */}
        <div className="glow-card rounded-3xl p-8">
          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Welcome back</h1>
            <p className="mt-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>Sign in to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-2xl flex items-center gap-2.5 text-sm font-medium"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)' }}
            >
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-2xl flex items-center gap-2.5 text-sm font-medium"
              style={{ backgroundColor: 'rgba(5,150,105,0.1)', color: '#34d399', border: '1px solid rgba(5,150,105,0.15)' }}
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  placeholder="you@gmail.com"
                  value={formData.email}
                  onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setError(''); }}
                  style={{ backgroundColor: 'var(--input-bg)', borderColor: error ? 'rgba(239,68,68,0.4)' : 'var(--input-border)', color: 'var(--text-primary)' }}
                  className="w-full h-12 pl-10 pr-4 rounded-2xl border text-sm placeholder:opacity-40 focus:ring-2 focus:ring-[var(--primary)]/20 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setError(''); }}
                  style={{ backgroundColor: 'var(--input-bg)', borderColor: error ? 'rgba(239,68,68,0.4)' : 'var(--input-border)', color: 'var(--text-primary)' }}
                  className="w-full h-12 pl-10 pr-12 rounded-2xl border text-sm placeholder:opacity-40 focus:ring-2 focus:ring-[var(--primary)]/20 transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 btn-press"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: 'var(--primary)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Remember me</span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold text-white btn-press disabled:opacity-60"
              style={{ background: 'var(--accent-gradient)' }}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              Demo: <span className="font-semibold" style={{ color: 'var(--primary)' }}>admin@billflow.com</span> / <span className="font-semibold" style={{ color: 'var(--primary)' }}>admin123</span>
            </p>
          </div>
        </div>

        {/* Register link */}
        <p className="text-center mt-5 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold transition-colors" style={{ color: 'var(--primary)' }}>
            Sign up free
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
