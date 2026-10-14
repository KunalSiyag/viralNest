import React, { useState, useEffect } from 'react';
import { Clipboard, Download, ArrowUp, X } from 'lucide-react';
import { classifyPinterestInput } from '../lib/pinterest-route';

export default function StickyPasteBar() {
  const [visible, setVisible] = useState(false);
  const [url, setUrl] = useState('');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // The bar stands in for the ticket only while the ticket and its receipts
    // are off screen; it never covers the real paste box or a result.
    const downloaderOnScreen = () => {
      const root = document.querySelector('[data-downloader]');
      if (!root) return false;
      const vh = window.innerHeight;
      return Array.from(root.children).some((el) => {
        const r = el.getBoundingClientRect();
        return r.height > 0 && r.top < vh && r.bottom > 0;
      });
    };
    const handleScroll = () => {
      setVisible(window.scrollY > 350 && !dismissed && !downloaderOnScreen());
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
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
    const cleanUrl = url.trim();
    if (!cleanUrl) return;
    triggerHaptic();
    const classification = classifyPinterestInput(cleanUrl);
    const targetPath = classification?.type === 'board'
      ? '/pinterest-board-downloader'
      : classification?.type === 'profile'
        ? '/pinterest-profile-downloader'
        : '/';
    window.location.href = `${targetPath}?url=${encodeURIComponent(cleanUrl)}&auto=true`;
  };

  const scrollToTop = () => {
    triggerHaptic();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <div
      className="fixed left-3 right-3 z-50 lg:hidden"
      style={{ bottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 0.5rem))' }}
    >
      <div className="bg-[#17191E] border border-[#393D45] text-white rounded-md p-2.5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="w-11 h-11 -m-1 flex items-center justify-center rounded-md text-[#C2C5CB] hover:text-white hover:bg-[#24272D] transition-colors shrink-0 touch-manipulation"
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
              placeholder="Link…"
              aria-label="Paste Pinterest link"
              className={`w-full h-11 pl-3 ${url ? 'pr-3' : 'pr-[6.25rem]'} rounded-md bg-[#1D2026] border border-[#393D45] text-base text-white caret-[#F4C531] placeholder:text-[#A3A8B0] focus:outline-none focus-visible:border-[#F4C531] focus-visible:ring-2 focus-visible:ring-[#F4C531]/40`}
              required
            />
            {!url && (
              <button
                type="button"
                onClick={handlePaste}
                // 36px to sit inside the 44px input; ::after extends the hit area to 44px.
                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 px-3 rounded bg-white after:absolute after:inset-x-0 after:-inset-y-1 after:content-[''] text-[#17191E] hover:bg-[#F4C531] text-sm font-bold flex items-center gap-1.5 transition-colors touch-manipulation"
              >
                <Clipboard className="w-3.5 h-3.5" aria-hidden="true" />
                Paste
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!url.trim()}
            className="h-11 px-4 rounded-md bg-[#C8281A] hover:bg-[#A51F13] active:bg-[#831A11] text-white font-extrabold text-sm flex items-center justify-center gap-1 shrink-0 disabled:bg-[#24272D] disabled:text-[#A3A8B0] transition-colors touch-manipulation"
          >
            <Download className="w-4 h-4" />
            <span>Save</span>
          </button>
        </form>

        <button
          type="button"
          onClick={scrollToTop}
          className="w-11 h-11 flex items-center justify-center rounded-md bg-[#1D2026] hover:bg-[#24272D] text-[#C2C5CB] hover:text-white transition-colors shrink-0 touch-manipulation"
          title="Scroll to top"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
