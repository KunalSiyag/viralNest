'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp, Zap } from 'lucide-react';
import SearchBar from '@/components/ui/SearchBar';
import { CATEGORIES } from '@/lib/constants';

const iconMap: Record<string, React.ReactNode> = {
  dumbbell: <span className="text-2xl">💪</span>,
  rocket: <span className="text-2xl">🚀</span>,
  palette: <span className="text-2xl">🎨</span>,
  flame: <span className="text-2xl">🔥</span>,
  sparkles: <span className="text-2xl">✨</span>,
  'book-open': <span className="text-2xl">📚</span>,
  'chef-hat': <span className="text-2xl">🍳</span>,
  plane: <span className="text-2xl">✈️</span>,
  cpu: <span className="text-2xl">💻</span>,
  shirt: <span className="text-2xl">👗</span>,
};

export default function Home() {
  const router = useRouter();

  const handleExtract = async (url: string) => {
    const res = await fetch('/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to extract content');
    }

    router.push(`/preview/${data.data.id}`);
  };

  return (
    <div className="hero-gradient">
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] text-sm font-medium border border-[var(--brand)]/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            The Content Discovery Engine
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]"
          >
            Discover & save{' '}
            <span className="text-gradient">viral content</span>{' '}
            from anywhere
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-xl"
          >
            Extract, explore, and download content from Instagram, YouTube, Pinterest, TikTok and more.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full"
          >
            <SearchBar onExtract={handleExtract} />
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-6 text-sm text-[var(--text-tertiary)]"
          >
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500" /> Instant extraction</span>
            <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Trending feeds</span>
            <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-violet-500" /> Smart categorization</span>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">Explore Categories</h2>
            <p className="text-[var(--text-secondary)] mt-1">Browse trending content by topic</p>
          </div>
          <Link
            href="/feed"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-[var(--brand)] hover:underline"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 stagger-children">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/feed/${cat.slug}`}
              className="group relative p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--brand)]/30 hover:shadow-[var(--shadow-md)] transition-all duration-300 overflow-hidden"
            >
              {/* Gradient hover effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-300`} />
              <div className="relative space-y-3">
                <div>{iconMap[cat.icon] || <span className="text-2xl">📁</span>}</div>
                <div>
                  <h3 className="font-semibold text-sm">{cat.name}</h3>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5 line-clamp-1">{cat.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
