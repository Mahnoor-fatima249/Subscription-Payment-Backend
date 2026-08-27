'use client';

import React from 'react';
import { Bell, Search, Moon, Sun } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function Header() {
  const [darkMode, setDarkMode] = React.useState(true);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-full px-6">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl hover:bg-slate-800/50 text-slate-400 hover:text-white transition-all"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button className="relative p-2 rounded-xl hover:bg-slate-800/50 text-slate-400 hover:text-white transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
          </button>

          <div className="flex items-center gap-3 pl-3 border-l border-slate-800/50">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-medium text-sm shadow-lg shadow-violet-500/25">
              A
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-white">Admin</p>
              <p className="text-xs text-slate-400">admin@billflow.com</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
