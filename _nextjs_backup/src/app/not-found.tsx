import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-7xl">🔍</div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Page Not Found
        </h1>
        <p className="text-[var(--text-secondary)] text-lg">
          The content you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/"
            className="px-6 py-3 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white font-semibold rounded-xl transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/feed"
            className="px-6 py-3 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-semibold rounded-xl border border-[var(--border)] transition-colors"
          >
            Browse Trending
          </Link>
        </div>
      </div>
    </div>
  );
}
