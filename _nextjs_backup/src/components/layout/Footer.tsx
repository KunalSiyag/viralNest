import Link from 'next/link';
import { CATEGORIES } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="border-t-[8px] border-[var(--border)] bg-[var(--bg-secondary)] mt-32 font-mono uppercase text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        
        <div className="mb-12 border-b border-[var(--border)] pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <Link href="/" className="inline-block">
            <span className="text-4xl font-heading font-bold tracking-widest leading-none text-[var(--text-primary)]">
              VIRAL_NEST
            </span>
            <span className="block mt-1 tracking-[0.2em] text-[var(--brand)]">
              {'// ARCHIVE_ENGINE_V2'}
            </span>
          </Link>
          <div className="text-[var(--text-tertiary)] max-w-sm">
            <p>ASSET_COLLECTION_SYSTEM</p>
            <p>AUTHORIZATION: PUBLIC_ACCESS</p>
            <p>LOCATION: GLOBAL_NETWORK</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
          <div>
            <h4 className="font-bold text-[var(--text-primary)] mb-6 tracking-widest">DIR: CATEGORIES</h4>
            <ul className="space-y-3">
              {CATEGORIES.slice(0, 6).map(cat => (
                <li key={cat.slug} className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors">
                  <span className="text-[var(--border-hover)]">├─</span>
                  <Link href={`/feed/${cat.slug}`}>
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[var(--text-primary)] mb-6 tracking-widest">DIR: INDEX</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors">
                <span className="text-[var(--border-hover)]">├─</span><Link href="/feed">ALL_TRENDING</Link>
              </li>
              <li className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors">
                <span className="text-[var(--border-hover)]">├─</span><Link href="/download-instagram-reels">IG_REELS</Link>
              </li>
              <li className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors">
                <span className="text-[var(--border-hover)]">├─</span><Link href="/pinterest-video-download">PIN_VIDEOS</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[var(--text-primary)] mb-6 tracking-widest">SYS: PROTOCOLS</h4>
            <ul className="space-y-3 text-[var(--text-tertiary)]">
              <li className="flex items-center gap-2">
                <span className="text-[var(--border-hover)]">├─</span>TERMS_OF_SERVICE
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[var(--border-hover)]">├─</span>PRIVACY_POLICY
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[var(--border-hover)]">├─</span>DMCA_COMPLIANCE
              </li>
            </ul>
          </div>
          <div className="flex flex-col justify-end text-[var(--text-tertiary)]">
            <div className="p-4 border border-[var(--border)] bg-[var(--bg-tertiary)]">
              <p className="font-bold text-[var(--brand)] mb-2">WARNING</p>
              <p className="leading-relaxed">CONTENT IS PROVIDED FOR PERSONAL REFERENCE ONLY. VERIFY COPYRIGHT BEFORE REUSE.</p>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-4 text-[var(--text-tertiary)]">
          <p>&copy; {new Date().getFullYear()} VIRAL_NEST</p>
          <p>SYS_TIME: {new Date().toISOString()}</p>
        </div>
      </div>
    </footer>
  );
}
