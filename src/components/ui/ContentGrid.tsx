'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import ContentCard from './ContentCard';
import { Loader2 } from 'lucide-react';
import { AD_INTERVAL } from '@/lib/constants';

interface ContentItem {
  id: string;
  platform: string;
  caption: string | null;
  thumbnail_url: string | null;
  media_type: string;
  view_count: number;
  download_count: number;
}

interface ContentGridProps {
  /** Initial content (from server-side render) */
  initialContent: ContentItem[];
  /** API query params for fetching more */
  fetchParams?: Record<string, string>;
  /** Whether to enable infinite scroll */
  infiniteScroll?: boolean;
}

export default function ContentGrid({
  initialContent,
  fetchParams = {},
  infiniteScroll = true,
}: ContentGridProps) {
  const [content, setContent] = useState<ContentItem[]>(initialContent);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);

  const fetchMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        ...fetchParams,
      });

      const res = await fetch(`/api/content?${params}`);
      const data = await res.json();

      if (data.data && data.data.length > 0) {
        setContent(prev => [...prev, ...data.data]);
        setPage(p => p + 1);
        setHasMore(data.pagination?.hasMore ?? false);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error('Failed to fetch more content:', e);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, fetchParams]);

  // Infinite scroll via Intersection Observer
  useEffect(() => {
    if (!infiniteScroll || !observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [infiniteScroll, hasMore, loading, fetchMore]);

  if (content.length === 0) {
    return (
      <div className="text-center py-20 space-y-3">
        <div className="text-5xl">🔍</div>
        <h3 className="text-xl font-semibold text-[var(--text-primary)]">No content found</h3>
        <p className="text-[var(--text-secondary)]">Try extracting some links to populate the feed!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {content.map((item, index) => (
          <ContentCardWithAd
            key={item.id}
            item={item}
            index={index}
          />
        ))}
      </div>

      {/* Infinite scroll trigger */}
      {infiniteScroll && hasMore && (
        <div ref={observerRef} className="flex justify-center py-12">
          {loading && (
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading more...</span>
            </div>
          )}
        </div>
      )}

      {!hasMore && content.length > 0 && (
        <div className="text-center py-10 text-[var(--text-tertiary)] text-sm">
          You&apos;ve reached the end ✨
        </div>
      )}
    </div>
  );
}

function ContentCardWithAd({
  item,
  index,
}: {
  item: ContentItem;
  index: number;
}) {
  const showAd = (index + 1) % AD_INTERVAL === 0;

  return (
    <>
      <ContentCard
        id={item.id}
        platform={item.platform}
        caption={item.caption}
        thumbnail_url={item.thumbnail_url}
        media_type={item.media_type}
        view_count={item.view_count}
        download_count={item.download_count}
        index={index}
      />
      {showAd && (
        <div className="col-span-2 sm:col-span-3 lg:col-span-4 py-4">
          <div className="p-6 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl flex items-center justify-center min-h-[100px]">
            <p className="text-[var(--text-tertiary)] text-sm font-medium">
              Ad Slot — Google AdSense
            </p>
          </div>
        </div>
      )}
    </>
  );
}
