'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Terminal, Dumbbell, Rocket, Palette, Flame } from 'lucide-react';

const navLinks = [
  { href: '/feed', label: 'Trending', icon: Terminal },
  { href: '/feed/fitness', label: 'Fitness', icon: Dumbbell },
  { href: '/feed/startup', label: 'Startups', icon: Rocket },
  { href: '/feed/design', label: 'Design', icon: Palette },
  { href: '/feed/motivation', label: 'Motivation', icon: Flame },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-primary)] border-b-4 border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex flex-col group" id="logo-link">
            <span className="text-3xl font-heading font-bold uppercase tracking-widest leading-none text-[var(--text-primary)] group-hover:text-[var(--brand)] transition-colors">
              VIRAL_NEST
            </span>
            <span className="font-mono text-[10px] tracking-[0.2em] text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors uppercase">
              Content_Archive_System
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6" id="desktop-nav">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href || (href !== '/feed' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative py-2 text-sm font-heading font-bold uppercase tracking-widest transition-all duration-200 hover:text-[var(--brand)] ${
                    isActive
                      ? 'text-[var(--brand)]'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--brand)]"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-sm text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--bg-secondary)] transition-colors"
              id="mobile-menu-toggle"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t-2 border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden"
          >
            <nav className="p-4 space-y-2" id="mobile-nav">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || (href !== '/feed' && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3 text-sm font-heading tracking-widest uppercase border-l-4 transition-colors ${
                      isActive
                        ? 'border-[var(--brand)] bg-[var(--bg-tertiary)] text-[var(--brand)]'
                        : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
