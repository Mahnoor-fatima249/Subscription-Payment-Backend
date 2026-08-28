'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Search, Sun, Moon, X, Check, Bell } from 'lucide-react';

export function Header() {
  const [darkMode, setDarkMode] = useState(true);
  const [userName, setUserName] = useState('A');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      setDarkMode(true);
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const first = user.firstName?.[0] || '';
        const last = user.lastName?.[0] || '';
        setUserName((first + last).toUpperCase() || 'A');
      }
    } catch {}
    const savedAvatar = localStorage.getItem('avatar');
    if (savedAvatar) setAvatar(savedAvatar);
  }, []);

  const toggleTheme = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    if (newDark) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { alert('Max 500KB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatar(dataUrl);
      localStorage.setItem('avatar', dataUrl);
      setShowPreview(true);
      setTimeout(() => setShowPreview(false), 2500);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeAvatar = () => {
    setAvatar(null);
    localStorage.removeItem('avatar');
    setShowPreview(false);
  };

  return (
    <header
      style={{ backgroundColor: 'var(--header-bg)', borderBottomColor: 'var(--header-border)' }}
      className="h-16 border-b flex items-center justify-between px-6 glass sticky top-0 z-40"
    >
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search anything..."
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
            className="w-full h-10 pl-10 pr-4 rounded-2xl border text-sm placeholder:opacity-40 focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]/30 transition-all duration-300"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          style={{ color: 'var(--text-secondary)' }}
          className="theme-spin p-2.5 rounded-2xl btn-press hover:bg-[var(--sidebar-hover)]"
          title={darkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {darkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>

        <button
          className="relative p-2.5 rounded-2xl btn-press hover:bg-[var(--sidebar-hover)] transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: 'var(--accent-gradient-3)' }} />
        </button>

        <div className="w-px h-8 mx-1" style={{ backgroundColor: 'var(--border)' }} />

        <div className="relative">
          <button
            onClick={handleAvatarClick}
            className="avatar-ring w-9 h-9 rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer"
            style={{ background: 'var(--accent-gradient)' }}
            title="Change photo"
          >
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-white">{userName}</span>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
            className="hidden"
            onChange={handleImageUpload}
          />

          {showPreview && (
            <div
              style={{ backgroundColor: 'var(--card-bg-from)', borderColor: 'var(--card-border)', boxShadow: 'var(--card-shadow-hover)' }}
              className="absolute right-0 top-14 w-52 rounded-2xl border z-50 p-3 page-enter"
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-gradient)' }}>
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span style={{ color: 'var(--text-primary)' }} className="text-xs font-semibold">Updated!</span>
                </div>
                <button onClick={() => setShowPreview(false)} style={{ color: 'var(--text-muted)' }} className="hover:opacity-70 btn-press">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="w-full h-28 rounded-xl overflow-hidden mb-2.5 ring-2 ring-[var(--primary)]/20">
                <img src={avatar!} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <button
                onClick={removeAvatar}
                className="w-full text-xs py-2 rounded-xl font-medium text-red-400 hover:bg-red-500/10 transition-colors btn-press"
              >
                Remove Photo
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
