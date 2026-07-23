// -- Platform Definitions --

export const PLATFORMS = {
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    icon: 'instagram',
    color: '#E1306C',
    domains: ['instagram.com', 'instagr.am'],
  },
  pinterest: {
    id: 'pinterest',
    name: 'Pinterest',
    icon: 'pin',
    color: '#E60023',
    domains: ['pinterest.com', 'pin.it'],
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    icon: 'music',
    color: '#000000',
    domains: ['tiktok.com'],
  },
  twitter: {
    id: 'twitter',
    name: 'X / Twitter',
    icon: 'twitter',
    color: '#1DA1F2',
    domains: ['twitter.com', 'x.com'],
  },
} as const;

export type PlatformId = keyof typeof PLATFORMS;

// -- Category Taxonomy --

export interface CategoryDef {
  slug: string;
  name: string;
  description: string;
  keywords: string[];
  icon: string;
  gradient: string; // CSS gradient for card backgrounds
}

export const CATEGORIES: CategoryDef[] = [
  {
    slug: 'fitness',
    name: 'Health & Fitness',
    description: 'Workout routines, nutrition tips, and gym motivation',
    keywords: ['fitness', 'gym', 'workout', 'exercise', 'health', 'nutrition', 'bodybuilding', 'yoga', 'crossfit', 'running', 'fit', 'gains', 'muscle', 'cardio', 'diet', 'wellness'],
    icon: 'dumbbell',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    slug: 'startup',
    name: 'Startup & Business',
    description: 'Founder insights, SaaS tips, and entrepreneurial advice',
    keywords: ['startup', 'founder', 'saas', 'business', 'entrepreneur', 'hustle', 'growth', 'marketing', 'sales', 'revenue', 'funding', 'vc', 'tech', 'product', 'ceo'],
    icon: 'rocket',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    slug: 'design',
    name: 'Design & Creative',
    description: 'UI/UX inspiration, graphic design, and creative processes',
    keywords: ['design', 'ui', 'ux', 'creative', 'art', 'illustration', 'typography', 'branding', 'logo', 'figma', 'dribbble', 'aesthetic', 'visual', 'graphic'],
    icon: 'palette',
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    slug: 'motivation',
    name: 'Motivation',
    description: 'Inspirational content, mindset tips, and personal growth',
    keywords: ['motivation', 'inspire', 'mindset', 'success', 'goals', 'discipline', 'grind', 'ambition', 'dream', 'believe', 'positive', 'growth', 'selfimprovement'],
    icon: 'flame',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    slug: 'entertainment',
    name: 'Entertainment',
    description: 'Funny clips, viral moments, and trending memes',
    keywords: ['funny', 'meme', 'comedy', 'viral', 'trending', 'lol', 'humor', 'entertainment', 'prank', 'challenge'],
    icon: 'sparkles',
    gradient: 'from-sky-500 to-blue-600',
  },
  {
    slug: 'education',
    name: 'Education',
    description: 'Tutorials, how-tos, and educational content',
    keywords: ['education', 'learn', 'tutorial', 'howto', 'tips', 'course', 'study', 'knowledge', 'science', 'history', 'facts'],
    icon: 'book-open',
    gradient: 'from-indigo-500 to-blue-700',
  },
  {
    slug: 'food',
    name: 'Food & Recipes',
    description: 'Cooking recipes, food reviews, and culinary inspiration',
    keywords: ['food', 'recipe', 'cooking', 'chef', 'meal', 'restaurant', 'baking', 'kitchen', 'healthy', 'vegan', 'foodie'],
    icon: 'chef-hat',
    gradient: 'from-red-500 to-orange-500',
  },
  {
    slug: 'travel',
    name: 'Travel',
    description: 'Travel vlogs, destination guides, and wanderlust content',
    keywords: ['travel', 'trip', 'vacation', 'destination', 'explore', 'adventure', 'wanderlust', 'tourism', 'flight', 'hotel', 'beach'],
    icon: 'plane',
    gradient: 'from-cyan-500 to-teal-500',
  },
  {
    slug: 'technology',
    name: 'Technology',
    description: 'Tech reviews, coding tutorials, and gadget showcases',
    keywords: ['tech', 'technology', 'coding', 'programming', 'ai', 'gadget', 'review', 'software', 'hardware', 'phone', 'laptop', 'developer'],
    icon: 'cpu',
    gradient: 'from-slate-600 to-zinc-700',
  },
  {
    slug: 'fashion',
    name: 'Fashion & Beauty',
    description: 'Style guides, beauty tips, and fashion trends',
    keywords: ['fashion', 'beauty', 'style', 'outfit', 'makeup', 'skincare', 'trend', 'clothing', 'model', 'accessories', 'hair'],
    icon: 'shirt',
    gradient: 'from-fuchsia-500 to-pink-600',
  },
];

// -- SEO Templates --

export const SEO_PAGES = [
  {
    slug: 'download-instagram-reels',
    title: 'Download Instagram Reels — Free HD Reel Downloader',
    description: 'Download Instagram Reels in HD quality for free. Save viral Instagram videos, reels, and stories to your device instantly.',
    platform: 'instagram',
    category: null,
  },
  {
    slug: 'pinterest-video-download',
    title: 'Download Pinterest Videos — Save Pins & Idea Pins',
    description: 'Download Pinterest videos and Idea Pins in full quality. Save creative pins, recipes, and DIY videos for offline viewing.',
    platform: 'pinterest',
    category: null,
  },
  {
    slug: 'fitness-reels-download',
    title: 'Fitness Reels — Workout & Gym Motivation Videos',
    description: 'Browse and download trending fitness reels. Get gym motivation, workout routines, and health tips from top creators.',
    platform: null,
    category: 'fitness',
  },
  {
    slug: 'startup-reels-ideas',
    title: 'Startup Reels — Founder Tips & Business Insights',
    description: 'Discover trending startup and business reels. Get founder advice, SaaS tips, and entrepreneurial motivation.',
    platform: null,
    category: 'startup',
  },
] as const;

// -- App Constants --

export const APP_NAME = 'viralNest';
export const APP_TAGLINE = 'Discover, save, and reuse viral content from across the internet.';
export const ITEMS_PER_PAGE = 20;
export const AD_INTERVAL = 6; // Show ad every N items
export const SIMILAR_CONTENT_COUNT = 6;
export const MAX_TAGS_DISPLAY = 8;
