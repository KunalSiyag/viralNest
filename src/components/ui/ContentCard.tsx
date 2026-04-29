'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Eye, Download, Play } from 'lucide-react';

interface ContentCardProps {
  id: string;
  platform: string;
  caption?: string | null;
  thumbnail_url?: string | null;
  media_type?: string;
  view_count?: number;
  download_count?: number;
  index?: number;
}

const platformColors: Record<string, string> = {
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
  youtube: 'bg-red-600',
  pinterest: 'bg-red-700',
  tiktok: 'bg-black',
  twitter: 'bg-sky-500',
  unknown: 'bg-neutral-600',
};

export default function ContentCard({
  id,
  platform,
  caption,
  thumbnail_url,
  media_type,
  view_count = 0,
  download_count = 0,
  index = 0,
}: ContentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/preview/${id}`}
        id={`content-card-${id}`}
        className="group block relative rounded-2xl overflow-hidden aspect-[3/4] bg-[var(--bg-tertiary)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] transition-all duration-500"
      >
        {/* Thumbnail */}
        {thumbnail_url ? (
          <Image
            src={thumbnail_url}
            alt={caption || 'Content thumbnail'}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)]">
            <div className="text-center space-y-2">
              <Play className="w-10 h-10 mx-auto opacity-40" />
              <p className="text-xs">No preview</p>
            </div>
          </div>
        )}

        {/* Platform badge */}
        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-white text-[10px] font-bold uppercase tracking-wider ${platformColors[platform] || platformColors.unknown} shadow-md`}>
          {platform}
        </div>

        {/* Video indicator */}
        {media_type === 'video' && thumbnail_url && (
          <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-3.5 h-3.5 text-white fill-white" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          {caption && (
            <p className="text-white text-sm line-clamp-3 font-medium mb-2">
              {caption}
            </p>
          )}
          <div className="flex items-center gap-3 text-white/70 text-xs">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {view_count}
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" /> {download_count}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
