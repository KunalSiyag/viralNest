'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Eye, Download, Play, ShieldAlert } from 'lucide-react';
import React from 'react';

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
  instagram: 'bg-pink-600 text-white',
  youtube: 'bg-red-600 text-white',
  pinterest: 'bg-red-700 text-white',
  tiktok: 'bg-black text-white',
  twitter: 'bg-sky-500 text-white',
  unknown: 'bg-neutral-600 text-white',
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
  // Simple 3D Tilt calculation could be added here, but for reliable mobile performance,
  // we'll use framer-motion's whileHover for scale and slight y-axis lift, plus some inner border glow.
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="relative block"
    >
      <Link
        href={`/preview/${id}`}
        id={`content-card-${id}`}
        className="group block relative poster-frame aspect-[3/4] w-full flex flex-col justify-end overflow-hidden"
      >
        {/* Glow behind card on hover */}
        <div className="absolute inset-0 bg-[var(--brand)] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 pointer-events-none" />

        {/* Thumbnail Layer */}
        <div className="absolute inset-0 z-0">
          {thumbnail_url ? (
            <motion.div 
              className="w-full h-full relative"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Image
                src={thumbnail_url}
                alt={caption || 'Content thumbnail'}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700"
              />
            </motion.div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border-[6px] border-[var(--bg-secondary)]">
              <ShieldAlert className="w-12 h-12 mb-2 opacity-50 group-hover:text-[var(--brand)] group-hover:opacity-100 transition-colors" />
              <p className="font-heading font-bold tracking-widest text-lg uppercase opacity-70 group-hover:text-[var(--brand)] transition-colors">Asset Missing</p>
              <p className="font-mono text-xs opacity-50">REF_{id.slice(0, 6)}</p>
            </div>
          )}
        </div>

        {/* Top-corner Classification Badge */}
        <motion.div 
          className="absolute top-0 right-0 z-20"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + Math.min(index * 0.05, 0.3) }}
        >
          <div className={`stamp-label border-0 border-l border-b border-[var(--border)] rounded-none rounded-bl-[var(--radius-sm)] ${platformColors[platform] || platformColors.unknown}`}>
            {platform}
          </div>
        </motion.div>

        {/* Video indicator stamp */}
        {media_type === 'video' && thumbnail_url && (
          <div className="absolute top-3 left-3 z-20 w-8 h-8 rounded-sm bg-[var(--brand)] text-[var(--text-inverted)] flex items-center justify-center border border-black/20 shadow-sm group-hover:scale-110 transition-transform">
            <Play className="w-4 h-4 fill-current" />
          </div>
        )}

        {/* Bottom Poster Metadata Frame */}
        <div className="relative z-10 w-full p-4 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)] to-transparent pt-12 group-hover:from-[var(--bg-secondary)] transition-colors translate-y-2 group-hover:translate-y-0 duration-300">
          <div className="border-t-2 border-[var(--border)] group-hover:border-[var(--brand)] pt-3 transition-colors duration-300">
            {caption ? (
              <h3 className="font-heading text-lg leading-tight uppercase line-clamp-2 text-[var(--text-primary)] mb-2 group-hover:text-[var(--brand)] transition-colors">
                {caption}
              </h3>
            ) : (
              <h3 className="font-heading text-lg leading-tight uppercase text-[var(--text-secondary)] mb-2">
                UNTITLED_MEDIA
              </h3>
            )}
            
            <div className="flex items-center justify-between font-mono text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">
              <span className="flex items-center gap-1 group-hover:text-[var(--text-secondary)] transition-colors">
                <Eye className="w-3 h-3" /> {view_count}
              </span>
              <span className="flex items-center gap-1 group-hover:text-[var(--text-secondary)] transition-colors">
                <Download className="w-3 h-3" /> {download_count}
              </span>
              <span>ID_{id.slice(0, 4)}</span>
            </div>
          </div>
        </div>
        
        {/* Hover inner border overlay */}
        <div className="absolute inset-0 z-30 border-4 border-transparent group-hover:border-[var(--brand)] pointer-events-none transition-colors duration-300"></div>
      </Link>
    </motion.div>
  );
}
