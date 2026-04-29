import Link from 'next/link';
import { CATEGORIES } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-secondary)] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block">
              <span className="text-xl font-bold tracking-tight">
                viral<span className="text-gradient">Nest</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed">
              Discover, save, and reuse viral content from across the internet.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Categories</h4>
            <ul className="space-y-2">
              {CATEGORIES.slice(0, 6).map(cat => (
                <li key={cat.slug}>
                  <Link href={`/feed/${cat.slug}`} className="text-sm text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/feed" className="text-sm text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors">Trending</Link></li>
              <li><Link href="/download-instagram-reels" className="text-sm text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors">Instagram Reels</Link></li>
              <li><Link href="/pinterest-video-download" className="text-sm text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors">Pinterest Videos</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-[var(--text-tertiary)]">Terms of Service</span></li>
              <li><span className="text-sm text-[var(--text-tertiary)]">Privacy Policy</span></li>
              <li><span className="text-sm text-[var(--text-tertiary)]">DMCA</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[var(--text-tertiary)]">&copy; {new Date().getFullYear()} viralNest. All rights reserved.</p>
          <p className="text-xs text-[var(--text-tertiary)]">Content is provided for personal use only.</p>
        </div>
      </div>
    </footer>
  );
}
