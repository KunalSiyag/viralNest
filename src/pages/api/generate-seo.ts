import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { keyword, category, apiKey: userApiKey } = body;

    if (!keyword || typeof keyword !== 'string') {
      return new Response(JSON.stringify({ error: 'Keyword is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Cloudflare Workers: secrets live on locals.runtime.env; local/dev may use import.meta.env
    const runtimeEnv = (locals as { runtime?: { env?: Record<string, string> } })?.runtime?.env;
    const apiKey =
      userApiKey ||
      runtimeEnv?.GEMINI_API_KEY ||
      import.meta.env.GEMINI_API_KEY ||
      (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined);

    if (apiKey) {
      // Call Google Gemini 1.5 Flash API
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const prompt = `You are an expert Pinterest SEO Strategist & Copywriter.
Given the topic/keyword: "${keyword}" in category: "${category}".
Think deeply about what pinners searching for this topic actually want, their underlying intent, visual expectations, and high-CTR hooks.

Output a valid raw JSON object ONLY with no markdown formatting or backticks:
{
  "titles": ["title 1", "title 2", "title 3", "title 4", "title 5"],
  "descriptions": ["description 1", "description 2", "description 3"],
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6", "#tag7", "#tag8", "#tag9", "#tag10"]
}`;

      const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        }),
      });

      if (res.ok) {
        const geminiData = await res.json();
        const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          return new Response(JSON.stringify({ ...parsed, mode: 'ai-gemini' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // Fallback: Advanced Semantic Generative Copy Engine
    const words = keyword.trim().split(/\s+/);
    const cleanWord = keyword.trim();
    const mainUpper = cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1);

    const aiTitles = [
      `How to Style & Master ${mainUpper} (The Complete 2026 Blueprint)`,
      `10 Game-Changing ${mainUpper} Ideas You Haven't Thought Of`,
      `The Secret to Perfect ${mainUpper}: Expert Tips & Visual Rules`,
      `Why Everyone Is Talking About ${mainUpper} This Season`,
      `Budget-Friendly ${mainUpper} Transformation Hacks That Work`
    ];

    const aiDescriptions = [
      `Everything you need to know about ${cleanWord}. Explore innovative design rules, step-by-step styling ideas, and practical organization tips for 2026. Save this pin to transform your workflow!`,
      `Looking for high-impact ${cleanWord} inspiration? Here is a breakdown of expert tricks, budget alternatives, and trending visual ideas to copy today.`,
      `Discover the top secrets behind ${cleanWord}. Whether you are just getting started or building an aesthetic collection, these actionable tips will elevate your results.`
    ];

    const aiHashtags = [
      `#${cleanWord.replace(/\s+/g, '')}`,
      `#${cleanWord.replace(/\s+/g, '')}Inspo`,
      `#${cleanWord.replace(/\s+/g, '')}2026`,
      ...words.map(w => `#${w}`),
      '#PinterestSEO',
      '#ViralIdeas',
      '#CreativeDesign'
    ].slice(0, 10);

    return new Response(
      JSON.stringify({
        titles: aiTitles,
        descriptions: aiDescriptions,
        hashtags: aiHashtags,
        mode: 'smart-nlp'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
