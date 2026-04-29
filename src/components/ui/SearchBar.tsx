'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Loader2, Instagram, Youtube, Pin, Music, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  onExtract: (url: string) => Promise<void>;
}

const platformIcons: Record<string, React.ReactNode> = {
  instagram: <Instagram className="w-5 h-5 text-pink-500" />,
  youtube: <Youtube className="w-5 h-5 text-red-500" />,
  pinterest: <Pin className="w-5 h-5 text-red-600" />,
  tiktok: <Music className="w-5 h-5" />,
  unknown: <Globe className="w-5 h-5 text-[var(--text-tertiary)]" />,
};

function detectPlatformFromUrl(url: string): string {
  if (!url) return '';
  if (url.includes('instagram.com') || url.includes('instagr.am')) return 'instagram';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('pinterest.com') || url.includes('pin.it')) return 'pinterest';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.startsWith('http')) return 'unknown';
  return '';
}

export default function SearchBar({ onExtract }: SearchBarProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [platform, setPlatform] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPlatform(detectPlatformFromUrl(url));
  }, [url]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      await onExtract(url.trim());
      setUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract content');
    } finally {
      setLoading(false);
    }
  }, [url, loading, onExtract]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className="relative flex items-center rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-[var(--shadow-lg)] transition-all duration-300 focus-within:shadow-[var(--shadow-glow)] focus-within:border-[var(--brand)]"
          style={{ overflow: 'hidden' }}
        >
          {/* Platform indicator */}
          <div className="absolute left-4 flex items-center">
            <AnimatePresence mode="wait">
              {platform ? (
                <motion.div
                  key={platform}
                  initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  {platformIcons[platform] || platformIcons.unknown}
                </motion.div>
              ) : (
                <motion.div
                  key="search"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Search className="w-5 h-5 text-[var(--text-tertiary)]" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <input
            ref={inputRef}
            type="url"
            required
            placeholder="Paste a link from Instagram, YouTube, Pinterest..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            className="w-full py-4 pl-12 pr-28 text-base bg-transparent outline-none placeholder:text-[var(--text-tertiary)] disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="absolute right-2 py-2.5 px-5 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4" />
                Extract
              </>
            )}
          </button>
        </div>
      </form>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-red-500 text-sm mt-3 text-center"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
