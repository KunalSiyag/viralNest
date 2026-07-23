import type { APIRoute } from 'astro';

export const prerender = false;

// Smart AI Caption Engine with platform-specific formatting and viral hooks
function generateSmartCaption(
  title: string,
  description: string,
  tags: string[],
  platform: 'reels' | 'tiktok' | 'shorts' | 'pinterest',
  tone: 'viral' | 'aesthetic' | 'story' | 'promo' = 'viral'
): string {
  const cleanTitle = title.replace(/pinterest|pin/gi, '').trim() || 'Aesthetic Content';
  const hashtagStr = (tags && tags.length > 0 ? tags : ['aesthetic', 'inspo', 'viral', 'trending'])
    .map(t => `#${t.replace(/[^a-z0-9]/gi, '')}`)
    .join(' ');

  const creditLine = `📌 Reposted via @viralNest`;

  if (platform === 'reels') {
    if (tone === 'aesthetic') {
      return `🌿 ${cleanTitle}\n\n"Beauty in the subtle details." ✨\n\nSave this for your moodboard 📌\n\n${creditLine}\n\n${hashtagStr} #reels #aesthetic #moodboard #reelsinstagram`;
    } else if (tone === 'story') {
      return `📖 Story behind: ${cleanTitle}\n\nEver wondered how to create this vibe? Here's your inspiration for today.\n\nComment "INFO" for links! 💬\n\n${creditLine}\n\n${hashtagStr} #reels #storytelling #creators`;
    } else {
      return `🔥 ${cleanTitle}\n\nTag someone who needs to see this! 👇\n\nDouble tap if you love this aesthetic ❤️\n\n${creditLine}\n\n${hashtagStr} #reels #viral #explorepage #trendingreels`;
    }
  }

  if (platform === 'tiktok') {
    if (tone === 'aesthetic') {
      return `POV: You found the most peaceful vibe 🌸✨\n\n${cleanTitle}\n\nFollow for daily aesthetic pins!\n\n${creditLine}\n\n${hashtagStr} #fyp #aesthetic #viral #foryou`;
    } else {
      return `Wait till the end... 🔥\n\n${cleanTitle}\n\nWhich one is your favorite? Comment below! 👇\n\n${creditLine}\n\n${hashtagStr} #fyp #viral #trending #tiktok`;
    }
  }

  if (platform === 'shorts') {
    return `🔥 ${cleanTitle} | Pinterest Aesthetic\n\nSubscribe to the channel for daily creative inspiration!\n\n${creditLine}\n\n${hashtagStr} #shorts #viral #pinterest #shortsfeed`;
  }

  // Pinterest Repost Caption
  return `📌 ${cleanTitle}\n\n${description ? description.slice(0, 150) + '...' : 'Aesthetic inspiration saved for your boards.'}\n\nSaved with @viralNest\n\n${hashtagStr}`;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const { title = '', description = '', tags = [], platform = 'reels', tone = 'viral' } = body;

    const generatedCaption = generateSmartCaption(title, description, tags, platform, tone);

    return new Response(JSON.stringify({
      success: true,
      caption: generatedCaption,
      platform,
      tone,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Failed to generate AI caption.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
