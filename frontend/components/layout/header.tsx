'use client';

import React, { useEffect, useState } from 'react';
import { Search, Bell, Sun, Moon } from 'lucide-react';
import { useApi } from '@/hooks/useApi';

export function Header() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  return (
    <header className="h-16 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Search plans, customers, invoices..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-slate-700/50 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
          <span className="text-sm font-bold text-white">A</span>
        </div>
      </div>
    </header>
  );
}
