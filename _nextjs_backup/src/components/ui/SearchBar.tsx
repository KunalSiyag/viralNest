'use client';

import { useState, useRef, useCallback } from 'react';
import { Search, Loader2, Camera, PlayCircle, Pin, Music, Globe, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  onExtract: (url: string) => Promise<void>;
}

const platformIcons: Record<string, React.ReactNode> = {
  instagram: <Camera className="w-4 h-4 text-white" />,
  pinterest: <Pin className="w-4 h-4 text-white" />,
  tiktok: <Music className="w-4 h-4 text-white" />,
  unknown: <Globe className="w-4 h-4 text-white" />,
};

function detectPlatformFromUrl(url: string): string {
  if (!url) return '';
  if (url.includes('instagram.com') || url.includes('instagr.am')) return 'instagram';
  if (url.includes('pinterest.com') || url.includes('pin.it')) return 'pinterest';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.startsWith('http')) return 'unknown';
  return '';
}

export default function SearchBar({ onExtract }: SearchBarProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const platform = detectPlatformFromUrl(url);

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
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex flex-col sm:flex-row gap-3">
          <div
            className="flex-1 relative flex items-center bg-[var(--bg-tertiary)] border-2 border-[var(--border)] focus-within:border-[var(--brand)] transition-colors duration-200"
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            {/* Terminal / Platform marker */}
            <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-12 border-r-2 border-[var(--border)] bg-[var(--bg-secondary)]">
              <AnimatePresence mode="wait">
                {platform ? (
                  <motion.div
                    key={platform}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center justify-center w-full h-full"
                    title={platform}
                  >
                    {platformIcons[platform] || platformIcons.unknown}
                  </motion.div>
                ) : (
                  <motion.div
                    key="terminal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Terminal className="w-4 h-4 text-[var(--text-tertiary)]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <input
              ref={inputRef}
              type="url"
              required
              placeholder="PASTE MEDIA URL HERE..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              className="w-full py-4 pl-16 pr-4 text-sm font-mono bg-transparent outline-none placeholder:text-[var(--text-tertiary)] disabled:opacity-50 uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="sm:w-auto w-full py-4 px-8 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-[var(--text-inverted)] font-heading font-bold tracking-widest text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase border-2 border-[var(--brand)] hover:border-[var(--brand-dark)]"
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Search className="w-5 h-5" />
                Extract
              </>
            )}
          </button>
        </div>
      </form>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-3 bg-red-950/40 border border-red-500/50 text-red-400 text-sm font-mono flex items-start gap-2" style={{ borderRadius: 'var(--radius-sm)' }}>
              <span className="text-red-500 font-bold">ERR:</span>
              <p>{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
