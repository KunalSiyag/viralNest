/**
 * Seed script — populates the database with demo content.
 * Run with: npm run db:seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seedContent = [
  {
    platform: 'instagram',
    source_url: 'https://www.instagram.com/reel/demo-fitness-1',
    media_url: null,
    thumbnail_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=800&fit=crop',
    caption: '5 Exercises for a Stronger Core 💪 #fitness #gym #workout #motivation',
    tags: JSON.stringify(['fitness', 'gym', 'workout', 'motivation', 'core', 'exercises']),
    category: 'fitness',
    media_type: 'video',
    popularity_score: 150,
    download_count: 42,
    view_count: 320,
  },
  {
    platform: 'youtube',
    source_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    media_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=800&fit=crop',
    caption: 'How I Built a $10M SaaS in 2 Years — Startup Journey',
    tags: JSON.stringify(['startup', 'saas', 'founder', 'business', 'entrepreneur', 'growth']),
    category: 'startup',
    media_type: 'video',
    popularity_score: 230,
    download_count: 85,
    view_count: 560,
  },
  {
    platform: 'pinterest',
    source_url: 'https://www.pinterest.com/pin/demo-design-1',
    media_url: null,
    thumbnail_url: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=800&fit=crop',
    caption: 'Minimalist UI Design Inspiration — Clean Dashboard Concepts',
    tags: JSON.stringify(['design', 'ui', 'ux', 'minimalist', 'dashboard', 'creative']),
    category: 'design',
    media_type: 'image',
    popularity_score: 120,
    download_count: 35,
    view_count: 280,
  },
  {
    platform: 'tiktok',
    source_url: 'https://www.tiktok.com/@user/video/demo-motivation-1',
    media_url: null,
    thumbnail_url: 'https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=600&h=800&fit=crop',
    caption: 'Your future self is watching. Make them proud. 🔥 #motivation #mindset #success',
    tags: JSON.stringify(['motivation', 'mindset', 'success', 'goals', 'discipline', 'inspire']),
    category: 'motivation',
    media_type: 'video',
    popularity_score: 340,
    download_count: 125,
    view_count: 890,
  },
  {
    platform: 'instagram',
    source_url: 'https://www.instagram.com/reel/demo-food-1',
    media_url: null,
    thumbnail_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=800&fit=crop',
    caption: 'Easy 15-Minute Pasta Recipe 🍝 #food #recipe #cooking #pasta',
    tags: JSON.stringify(['food', 'recipe', 'cooking', 'pasta', 'easy', 'meal']),
    category: 'food',
    media_type: 'video',
    popularity_score: 180,
    download_count: 65,
    view_count: 410,
  },
  {
    platform: 'youtube',
    source_url: 'https://www.youtube.com/watch?v=demo-tech-1',
    media_url: null,
    thumbnail_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=800&fit=crop',
    caption: 'AI in 2026 — What Every Developer Should Know',
    tags: JSON.stringify(['technology', 'ai', 'developer', 'programming', 'coding', 'tech']),
    category: 'technology',
    media_type: 'video',
    popularity_score: 200,
    download_count: 78,
    view_count: 520,
  },
  {
    platform: 'tiktok',
    source_url: 'https://www.tiktok.com/@user/video/demo-fitness-2',
    media_url: null,
    thumbnail_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=800&fit=crop',
    caption: 'Full Body HIIT Workout — No Equipment Needed 🏋️ #fitness #hiit #workout',
    tags: JSON.stringify(['fitness', 'hiit', 'workout', 'bodyweight', 'cardio', 'health']),
    category: 'fitness',
    media_type: 'video',
    popularity_score: 275,
    download_count: 95,
    view_count: 670,
  },
  {
    platform: 'pinterest',
    source_url: 'https://www.pinterest.com/pin/demo-travel-1',
    media_url: null,
    thumbnail_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=800&fit=crop',
    caption: 'Top 10 Hidden Beaches You Need to Visit 🏖️ #travel #beach #wanderlust',
    tags: JSON.stringify(['travel', 'beach', 'wanderlust', 'vacation', 'explore', 'destination']),
    category: 'travel',
    media_type: 'image',
    popularity_score: 160,
    download_count: 55,
    view_count: 380,
  },
  {
    platform: 'instagram',
    source_url: 'https://www.instagram.com/reel/demo-fashion-1',
    media_url: null,
    thumbnail_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=800&fit=crop',
    caption: 'Summer Outfit Ideas 2026 ☀️ #fashion #style #outfit #summer',
    tags: JSON.stringify(['fashion', 'style', 'outfit', 'summer', 'trend', 'clothing']),
    category: 'fashion',
    media_type: 'video',
    popularity_score: 140,
    download_count: 48,
    view_count: 350,
  },
  {
    platform: 'youtube',
    source_url: 'https://www.youtube.com/watch?v=demo-education-1',
    media_url: null,
    thumbnail_url: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&h=800&fit=crop',
    caption: 'Learn JavaScript in 30 Minutes — Complete Beginner Guide',
    tags: JSON.stringify(['education', 'learn', 'tutorial', 'javascript', 'coding', 'programming']),
    category: 'education',
    media_type: 'video',
    popularity_score: 190,
    download_count: 72,
    view_count: 490,
  },
  {
    platform: 'tiktok',
    source_url: 'https://www.tiktok.com/@user/video/demo-entertainment-1',
    media_url: null,
    thumbnail_url: 'https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?w=600&h=800&fit=crop',
    caption: 'Wait for it... 😂 The ending will surprise you! #funny #viral #comedy',
    tags: JSON.stringify(['funny', 'viral', 'comedy', 'entertainment', 'humor', 'trending']),
    category: 'entertainment',
    media_type: 'video',
    popularity_score: 450,
    download_count: 180,
    view_count: 1200,
  },
  {
    platform: 'instagram',
    source_url: 'https://www.instagram.com/reel/demo-startup-2',
    media_url: null,
    thumbnail_url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=800&fit=crop',
    caption: 'The #1 Mistake First-Time Founders Make 🚀 #startup #founder #advice',
    tags: JSON.stringify(['startup', 'founder', 'advice', 'business', 'entrepreneur', 'mistakes']),
    category: 'startup',
    media_type: 'video',
    popularity_score: 210,
    download_count: 88,
    view_count: 540,
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.content.deleteMany({});
  console.log('  Cleared existing content');

  // Insert seed data
  for (const item of seedContent) {
    await prisma.content.create({ data: item });
  }

  console.log(`  Created ${seedContent.length} content items`);
  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
