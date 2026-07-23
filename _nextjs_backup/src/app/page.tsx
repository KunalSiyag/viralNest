'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Terminal } from 'lucide-react';
import SearchBar from '@/components/ui/SearchBar';
import { CATEGORIES } from '@/lib/constants';

export default function Home() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Parallax transforms
  const yText = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const yPanels = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacityFade = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

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
    <div ref={containerRef} className="hero-gradient min-h-[calc(100vh-80px)] flex flex-col relative overflow-hidden">
      {/* Background ambient noise/grid can go here */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--brand-dark)_0%,transparent_40%)] opacity-20 z-0 pointer-events-none" />

      <div className="relative z-10 flex-1 max-w-7xl mx-auto px-4 sm:px-6 w-full flex flex-col pt-12 pb-24 lg:pt-24">
        
        {/* Collector Narrative Stats / Top Bar */}
        <motion.div 
          style={{ opacity: opacityFade }}
          className="hidden sm:flex items-center gap-8 mb-12 text-xs font-mono tracking-widest text-[var(--text-tertiary)] uppercase border-b border-[var(--border)] pb-4"
        >
          <span className="flex items-center gap-2">
            <motion.span 
              animate={{ opacity: [1, 0.5, 1] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-2 h-2 rounded-full bg-[var(--brand)] inline-block"
            />
            STATUS: ONLINE
          </span>
          <span>SYSTEM: NEST_ENGINE_V2</span>
          <span className="ml-auto text-[var(--accent)]">PHASE: EXTRACTION</span>
        </motion.div>

        {/* Split Composition */}
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-8 flex-1">
          
          {/* Left Column - Main Action */}
          <motion.div 
            style={{ y: yText }}
            className="flex-1 flex flex-col justify-center space-y-10 lg:pr-12"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="stamp-label bg-transparent border-l-4 border-[var(--brand)] pl-3 text-[var(--text-secondary)] text-sm font-mono tracking-widest"
              >
                CONTENT_DISCOVERY_LAYER
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-6xl sm:text-7xl lg:text-8xl font-heading font-bold uppercase leading-[0.9] tracking-tight"
              >
                Extract <br />
                <span className="text-gradient relative inline-block">
                  Archive
                  <motion.span 
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-[var(--brand)]" 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                    style={{ transformOrigin: "left" }}
                  />
                </span> <br />
                Screen
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-lg text-[var(--text-secondary)] max-w-md font-medium"
              >
                Download and catalog media from Instagram, Pinterest, TikTok, and more. Direct source where available.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <SearchBar onExtract={handleExtract} />
            </motion.div>

            {/* Quick narrative links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap gap-4 text-xs font-heading tracking-widest uppercase"
            >
              <Link href="/feed" className="flex items-center gap-1.5 text-[var(--text-primary)] hover:text-[var(--brand)] transition-colors group">
                <Terminal className="w-3.5 h-3.5 group-hover:text-[var(--brand)]" /> 
                <span className="border-b border-transparent group-hover:border-[var(--brand)] pb-0.5 transition-colors">Launch Feed</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Column - Genre Panels */}
          <motion.div 
            style={{ y: yPanels }}
            className="flex-1 lg:max-w-md xl:max-w-lg flex flex-col justify-center relative"
          >
            {/* Ambient glow behind panels */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[var(--brand)]/10 blur-[100px] rounded-full pointer-events-none" />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, rotateY: 10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="poster-frame p-6 sm:p-8 bg-[var(--bg-elevated)] border-2 border-[var(--border)] relative z-10 backdrop-blur-sm"
              style={{ perspective: 1000 }}
            >
              <div className="flex items-end justify-between mb-8 border-b-2 border-[var(--border)] pb-4">
                <h2 className="text-2xl font-heading tracking-wider uppercase">Active Arc<br/>Categories</h2>
                <span className="text-[var(--text-tertiary)] font-mono text-xs">SEL_C_01</span>
              </div>

              <div className="flex flex-col gap-3">
                {CATEGORIES.slice(0, 5).map((cat, i) => (
                  <motion.div
                    key={cat.slug}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1, duration: 0.5, ease: "easeOut" }}
                  >
                    <Link
                      href={`/feed/${cat.slug}`}
                      className="group relative flex items-center justify-between p-4 bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-[var(--brand)] transition-colors overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-[var(--brand)] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out z-0 opacity-10"></div>
                      
                      <div className="relative z-10 flex items-center gap-4">
                        <span className="font-mono text-[var(--text-tertiary)] text-xs font-bold">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <h3 className="font-heading text-lg uppercase tracking-wider group-hover:text-[var(--brand)] transition-colors">
                          {cat.name}
                        </h3>
                      </div>
                      <ArrowRight className="relative z-10 w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--brand)] group-hover:translate-x-1 transition-all" />
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 pt-4 border-t-2 border-[var(--border)] text-right">
                <Link
                  href="/feed"
                  className="inline-flex items-center gap-2 text-sm font-heading tracking-widest text-[var(--accent)] hover:text-[var(--brand)] transition-colors uppercase group"
                >
                  <span className="border-b border-transparent group-hover:border-[var(--brand)] pb-0.5 transition-colors">View full index</span> 
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
