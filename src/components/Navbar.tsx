import React, { useState } from 'react';
import { Server, Play, BookOpen, MessageSquare, Menu, X, ArrowUpRight } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', path: '/', icon: Server },
    { label: 'Demo', path: '/demo', icon: Play },
    { label: 'Documentation', path: '/documentation', icon: BookOpen },
  ];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#080b11]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <button
          onClick={() => handleNavClick('/')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-[#080b11] rounded-[10px] flex items-center justify-center text-emerald-400">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
              <span>Bilota</span>
              <span className="text-emerald-400 font-extrabold">Server</span>
            </div>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                  isActive
                    ? 'text-white bg-white/10 shadow-inner'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Discord External Link */}
          <a
            href="https://discord.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 px-3.5 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white bg-[#5865F2]/20 hover:bg-[#5865F2]/30 border border-[#5865F2]/40 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <MessageSquare className="w-4 h-4 text-[#5865F2]" />
            <span>Discord</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <a
            href="https://discord.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-zinc-300 bg-[#5865F2]/20 border border-[#5865F2]/30"
            aria-label="Discord"
          >
            <MessageSquare className="w-4 h-4 text-[#5865F2]" />
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#080b11] px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2.5 ${
                  isActive
                    ? 'text-white bg-white/10'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
