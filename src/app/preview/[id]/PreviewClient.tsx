'use client';

import { useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Download, ExternalLink, Play, ArrowRight } from 'lucide-react';
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
  instagram: 'text-pink-500',
  youtube: 'text-red-500',
  pinterest: 'text-red-600',
  tiktok: 'text-white',
  twitter: 'text-sky-400',
  unknown: 'text-neutral-400',
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
  const isInstagram = content.platform === 'instagram';
  const igShortcode = isInstagram ? extractInstagramShortcode(content.source_url) : null;
  const isTikTok = content.platform === 'tiktok';
  const tiktokVideoId = isTikTok ? extractTikTokId(content.source_url) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 overflow-hidden">
      {/* Main Poster Preview */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        
        {/* Centerpiece Media Frame */}
        <motion.div 
          className="flex-[1.5] min-w-0"
          initial={{ opacity: 0, x: -50, rotateY: -10 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ perspective: 1200 }}
        >
          <div className="relative poster-frame p-2 sm:p-4 bg-[var(--bg-secondary)] flex items-center justify-center border-4"
            style={{ minHeight: '500px', borderColor: 'var(--border)' }}
          >
            {/* Top corner label on the frame */}
            <div className="absolute top-0 left-0 bg-[var(--bg-tertiary)] border-r border-b border-[var(--border)] px-3 py-1 text-xs font-mono tracking-widest text-[var(--text-tertiary)] z-20 shadow-sm">
              MEDIA_FRAME
            </div>

            {/* Embeds/Video */}
            <div className="w-full relative z-10 rounded-sm overflow-hidden bg-black flex items-center justify-center h-full">
              {isYouTube && youtubeId ? (
                <div className="w-full aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={content.caption || 'Video'}
                  />
                </div>
              ) : isInstagram && igShortcode ? (
                <div className="w-full flex justify-center bg-black py-4">
                  <iframe
                    src={`https://www.instagram.com/p/${igShortcode}/embed/`}
                    className="border-0"
                    width="400"
                    height="500"
                    allowFullScreen
                    scrolling="no"
                    title={content.caption || 'Instagram Post'}
                    style={{ maxWidth: '100%' }}
                  />
                </div>
              ) : isTikTok && tiktokVideoId ? (
                <div className="w-full flex justify-center bg-black py-4">
                  <iframe
                    src={`https://www.tiktok.com/embed/v2/${tiktokVideoId}`}
                    className="border-0"
                    width="340"
                    height="600"
                    allowFullScreen
                    scrolling="no"
                    title={content.caption || 'TikTok Video'}
                    style={{ maxWidth: '100%' }}
                  />
                </div>
              ) : content.media_url && content.media_type === 'video' && !content.media_url.includes('/embed') ? (
                <div className="w-full aspect-video bg-black">
                  <video
                    src={content.media_url}
                    controls
                    className="w-full h-full object-contain"
                    poster={content.thumbnail_url || undefined}
                    playsInline
                  />
                </div>
              ) : content.thumbnail_url ? (
                <div className="relative w-full aspect-[3/4] max-h-[800px] bg-black">
                  <Image
                    src={content.thumbnail_url}
                    alt={content.caption || 'Content preview'}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-contain"
                    priority
                  />
                </div>
              ) : (
                <div className="text-[var(--text-tertiary)] text-center p-8 space-y-3 font-mono border-2 border-dashed border-[var(--border)] m-4 flex-1">
                  <Play className="w-16 h-16 mx-auto opacity-20" />
                  <p className="tracking-widest">PREVIEW_UNAVAILABLE</p>
                  <a href={content.source_url} target="_blank" rel="noreferrer" className="text-[var(--brand)] hover:underline text-xs">
                    [VIEW_SOURCE]
                  </a>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Side Metadata / Credits */}
        <motion.div 
          className="flex-1 min-w-0 flex flex-col space-y-10 py-4 lg:py-8"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          
          {/* Header Metadata */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="stamp-label text-sm">
                <span className={platformColors[content.platform] || platformColors.unknown}>●</span> {content.platform}
              </span>
              {content.category !== 'uncategorized' && (
                <Link
                  href={`/feed/${content.category}`}
                  className="stamp-label bg-transparent border border-[var(--brand)] text-[var(--brand)] text-sm hover:bg-[var(--brand)] hover:text-[var(--text-inverted)] transition-colors"
                >
                  {content.category}
                </Link>
              )}
            </div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold uppercase leading-[0.95] tracking-tight"
            >
              {content.caption || 'UNTITLED_MEDIA_ASSET'}
            </motion.h1>
          </div>

          {/* Credits Table / Issue Details */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="font-mono text-sm uppercase grid grid-cols-2 gap-x-4 gap-y-6 border-y-2 border-[var(--border)] py-6 bg-[var(--bg-secondary)] px-4 relative overflow-hidden"
          >
            {/* Ambient scanline effect */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />
            
            <div className="relative z-10">
              <p className="text-[var(--text-tertiary)] mb-1 text-xs">REF_ID</p>
              <p className="font-bold text-[var(--text-primary)]">{content.id.slice(0, 8)}</p>
            </div>
            <div className="relative z-10">
              <p className="text-[var(--text-tertiary)] mb-1 text-xs">FORMAT</p>
              <p className="font-bold text-[var(--text-primary)]">{content.media_type || 'UNKNOWN'}</p>
            </div>
            <div className="relative z-10">
              <p className="text-[var(--text-tertiary)] mb-1 text-xs">ENGAGEMENT_V</p>
              <p className="font-bold text-[var(--text-primary)]">{content.view_count.toLocaleString()}</p>
            </div>
            <div className="relative z-10">
              <p className="text-[var(--text-tertiary)] mb-1 text-xs">ENGAGEMENT_D</p>
              <p className="font-bold text-[var(--text-primary)]">{content.download_count.toLocaleString()}</p>
            </div>
          </motion.div>

          {/* Collector Annotations / Tags */}
          {content.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h3 className="font-heading tracking-widest text-[var(--text-tertiary)] mb-3 text-sm">ANNOTATIONS:</h3>
              <div className="flex flex-wrap gap-2">
                {content.tags.slice(0, 10).map((tag, i) => (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + i * 0.05 }}
                  >
                    <Link
                      href={`/feed/${tag}`}
                      className="font-mono text-[10px] px-2 py-1 bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors uppercase block"
                    >
                      #{tag}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Action Terminal */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="space-y-4 pt-4 mt-auto"
          >
            {!content.media_url && (
              <div className="p-3 bg-amber-950/20 border border-amber-500/30 text-amber-500/80 text-xs font-mono uppercase mb-4 rounded-sm animate-pulse">
                * Note: Direct download proxy unavailable for this asset. Redirecting to source.
              </div>
            )}
            
            <button
              onClick={handleDownload}
              className="group w-full py-4 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-[var(--text-inverted)] font-heading text-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all border-2 border-[var(--brand)] rounded-sm relative overflow-hidden"
              id="download-button"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <Download className="w-5 h-5 relative z-10 group-hover:-translate-y-1 transition-transform" />
              <span className="relative z-10">{content.media_url ? 'EXTRACT MEDIA' : 'OPEN SOURCE'}</span>
            </button>

            <a
              href={content.source_url}
              target="_blank"
              rel="noreferrer"
              className="group w-full py-3 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-heading text-lg tracking-widest uppercase flex items-center justify-center gap-3 transition-colors border-2 border-[var(--border)] rounded-sm"
              id="view-original-button"
            >
              <ExternalLink className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              INSPECT ORIGIN
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Related Posters / Arc Content */}
      {similar.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mt-24 pt-12 border-t-[4px] border-[var(--border)] relative"
        >
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-4xl sm:text-5xl font-heading font-bold uppercase leading-none">More From<br/>This Arc</h2>
              <p className="font-mono text-[var(--text-tertiary)] text-xs mt-2 uppercase tracking-widest">SIMILAR_ASSETS // {content.category}</p>
            </div>
            <Link
              href={`/feed/${content.category}`}
              className="flex items-center gap-2 text-sm font-heading tracking-widest text-[var(--brand)] hover:text-[var(--brand-light)] transition-colors uppercase border-b-2 border-transparent hover:border-[var(--brand)] pb-1 group"
            >
              ACCESS ARCHIVE <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
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

function extractInstagramShortcode(url: string): string | null {
  const match = url.match(/\/(?:p|reel|tv|reels)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

function extractTikTokId(url: string): string | null {
  const match = url.match(/\/video\/(\d+)/);
  return match ? match[1] : null;
}

