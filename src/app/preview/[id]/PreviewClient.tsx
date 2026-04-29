'use client';

import { useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Download, ExternalLink, Eye, Play, Tag, ArrowRight } from 'lucide-react';
import ContentCard from '@/components/ui/ContentCard';

interface ContentData {
  id: string;
  platform: string;
  source_url: string;
  media_url: string | null;
  thumbnail_url: string | null;
  caption: string | null;
  category: string;
  media_type: string;
  view_count: number;
  download_count: number;
  tags: string[];
}

interface SimilarItem {
  id: string;
  platform: string;
  caption: string | null;
  thumbnail_url: string | null;
  media_type: string;
  view_count: number;
  download_count: number;
}

interface PreviewClientProps {
  content: ContentData;
  similar: SimilarItem[];
}

const platformColors: Record<string, string> = {
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
  youtube: 'bg-red-600 text-white',
  pinterest: 'bg-red-700 text-white',
  tiktok: 'bg-black text-white',
  twitter: 'bg-sky-500 text-white',
  unknown: 'bg-neutral-600 text-white',
};

export default function PreviewClient({ content, similar }: PreviewClientProps) {
  const handleDownload = useCallback(async () => {
    if (!content.media_url) {
      window.open(content.source_url, '_blank');
      return;
    }

    // Track download
    fetch(`/api/content/${content.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'download' }),
    }).catch(() => {});

    // Use proxy download
    const filename = `viralNest-${content.platform}-${content.id.slice(0, 8)}`;
    const downloadUrl = `/api/download?url=${encodeURIComponent(content.media_url)}&filename=${filename}`;
    window.open(downloadUrl, '_blank');
  }, [content]);

  const isYouTube = content.platform === 'youtube';
  const youtubeId = isYouTube ? extractYouTubeId(content.source_url) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Main Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col lg:flex-row gap-8 lg:gap-12"
      >
        {/* Media Preview */}
        <div className="flex-1 min-w-0">
          <div className="relative rounded-3xl overflow-hidden bg-black shadow-[var(--shadow-xl)] aspect-video lg:aspect-[3/4] max-h-[600px] flex items-center justify-center">
            {isYouTube && youtubeId ? (
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                className="w-full h-full absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={content.caption || 'Video'}
              />
            ) : content.media_url && content.media_type === 'video' ? (
              <video
                src={content.media_url}
                controls
                className="w-full h-full object-contain"
                poster={content.thumbnail_url || undefined}
                playsInline
              />
            ) : content.thumbnail_url ? (
              <Image
                src={content.thumbnail_url}
                alt={content.caption || 'Content preview'}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain"
                priority
              />
            ) : (
              <div className="text-white/60 text-center p-8 space-y-3">
                <Play className="w-16 h-16 mx-auto opacity-40" />
                <p>Preview unavailable</p>
                <a href={content.source_url} target="_blank" rel="noreferrer" className="text-[var(--brand)] underline text-sm">
                  View on {content.platform}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Content Info */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Platform + Category */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${platformColors[content.platform] || platformColors.unknown}`}>
              {content.platform}
            </span>
            {content.category !== 'uncategorized' && (
              <Link
                href={`/feed/${content.category}`}
                className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--brand-subtle)] text-[var(--brand)] hover:underline capitalize"
              >
                {content.category}
              </Link>
            )}
          </div>

          {/* Caption */}
          <h1 className="text-xl sm:text-2xl font-bold leading-snug">
            {content.caption || 'Extracted Content'}
          </h1>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" /> {content.view_count} views
            </span>
            <span className="flex items-center gap-1.5">
              <Download className="w-4 h-4" /> {content.download_count} downloads
            </span>
          </div>

          {/* Tags */}
          {content.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {content.tags.slice(0, 10).map(tag => (
                <Link
                  key={tag}
                  href={`/feed/${tag}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors border border-[var(--border)]"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <button
              onClick={handleDownload}
              className="w-full py-4 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white font-bold rounded-xl flex items-center justify-center gap-2.5 transition-colors shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]"
              id="download-button"
            >
              <Download className="w-5 h-5" />
              {content.media_url ? 'Download Media' : 'View Original'}
            </button>

            <a
              href={content.source_url}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-semibold rounded-xl flex items-center justify-center gap-2.5 transition-colors border border-[var(--border)]"
              id="view-original-button"
            >
              <ExternalLink className="w-4 h-4" />
              View on {content.platform}
            </a>
          </div>

          {/* Ad Slot */}
          <div className="p-5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl mt-6">
            <p className="text-[var(--text-tertiary)] text-sm text-center font-medium">
              Ad Slot — Google AdSense
            </p>
          </div>
        </div>
      </motion.div>

      {/* Similar Content */}
      {similar.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-16 pt-10 border-t border-[var(--border)]"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Similar Content</h2>
            <Link
              href={`/feed/${content.category}`}
              className="flex items-center gap-1 text-sm font-medium text-[var(--brand)] hover:underline"
            >
              See more <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {similar.map((item, i) => (
              <ContentCard
                key={item.id}
                id={item.id}
                platform={item.platform}
                caption={item.caption}
                thumbnail_url={item.thumbnail_url}
                media_type={item.media_type}
                view_count={item.view_count}
                download_count={item.download_count}
                index={i}
              />
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}
