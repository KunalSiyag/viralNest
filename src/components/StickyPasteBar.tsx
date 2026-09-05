import React, { useState, useEffect } from 'react';
import { Clipboard, Download, ArrowUp, X } from 'lucide-react';

export default function StickyPasteBar() {
  const [visible, setVisible] = useState(false);
  const [url, setUrl] = useState('');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350 && !dismissed) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dismissed]);

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([15, 30]);
      } catch (e) {
        // Ignore haptic failures
      }
    }
  };

  const handlePaste = async () => {
    triggerHaptic();
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    triggerHaptic();
    // Redirect to main downloader with prefilled url query
    const targetUrl = `/?url=${encodeURIComponent(url.trim())}&auto=true`;
    window.location.href = targetUrl;
  };

  const scrollToTop = () => {
    triggerHaptic();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-3 right-3 z-50 lg:hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 text-white rounded-2xl p-2.5 shadow-2xl shadow-slate-950/50 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          aria-label="Close sticky paste bar"
        >
          <X className="w-4 h-4" />
        </button>

        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-1.5 min-w-0">
          <div className="relative flex-1 min-w-0">
            <label htmlFor="sticky-bar-url-input" className="sr-only">
              Paste Pinterest link
            </label>
            <input
              id="sticky-bar-url-input"
              name="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste Pinterest link…"
              aria-label="Paste Pinterest link"
              className="w-full h-11 pl-3 pr-14 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-[#E11D48]"
              required
            />
            {!url && (
              <button
                type="button"
                onClick={handlePaste}
                className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-red-950/80 text-rose-300 hover:bg-red-900/80 text-[10px] font-bold flex items-center gap-1 border border-red-800/60"
              >
                <Clipboard className="w-3 h-3" />
                Paste
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!url.trim()}
            className="h-11 px-4 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] active:bg-[#9F1239] text-white font-extrabold text-xs flex items-center justify-center gap-1 shrink-0 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Save</span>
          </button>
        </form>

        <button
          type="button"
          onClick={scrollToTop}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors shrink-0"
          title="Scroll to top"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
