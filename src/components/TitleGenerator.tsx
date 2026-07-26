import React, { useState } from 'react';
import { Copy, Check, Sparkles, FileText, Hash, RefreshCw, Key, Cpu } from 'lucide-react';

interface GeneratedResult {
  titles: string[];
  descriptions: string[];
  hashtags: string[];
  mode?: string;
}

export default function TitleGenerator() {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('General');
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categories = [
    'General',
    'Fashion & Style',
    'Home & DIY',
    'Food & Recipes',
    'Business & Marketing',
    'Travel & Lifestyle',
    'Tech & Digital'
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, category, apiKey }),
      });

      if (!res.ok) {
        throw new Error(`API returned status ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error('Error generating AI titles:', err);
      setErrorMsg('Failed to connect to AI server. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      {/* Generator Form */}
      <form
        onSubmit={handleGenerate}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden"
      >
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-100 dark:bg-red-950/60 text-[#E11D48]">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                AI-Powered Pinterest SEO Generator
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Generates original, non-templated titles, descriptions, and hashtags using AI LLM reasoning.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#E11D48] text-slate-600 dark:text-slate-400 hover:text-[#E11D48] transition-all"
            title="Custom Gemini API Key"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{showKeyInput ? 'Hide Key' : 'Gemini Key (Optional)'}</span>
          </button>
        </div>

        {/* Optional Custom API Key Input */}
        {showKeyInput && (
          <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 animate-fadeIn">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Google Gemini API Key (Optional)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your free Google AI Studio key here (or leave blank to use default AI)"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E11D48] text-sm"
              spellCheck={false}
              autoComplete="off"
              aria-label="Google Gemini API Key"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Provide your own key for unlimited direct 100% LLM inference generation.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Topic or Keyword
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. Cyberpunk Jacket, High Protein Smoothies, Vintage Desk Setup"
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E11D48] text-base"
              required
              spellCheck={false}
              aria-label="Topic or Keyword"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Niche Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E11D48] text-base"
              aria-label="Niche Category"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#E11D48] to-rose-600 hover:from-rose-600 hover:to-red-700 text-white font-extrabold text-base sm:text-lg shadow-lg hover:shadow-red-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 touch-manipulation focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E11D48]"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" aria-hidden="true" />
              <span>AI Engine Thinking &amp; Writing…</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              <span>Generate AI Titles &amp; Descriptions</span>
            </>
          )}
        </button>

        {errorMsg && (
          <p className="text-red-500 text-sm mt-3 text-center font-semibold">{errorMsg}</p>
        )}
      </form>

      {/* Generated Results */}
      {result && (
        <div className="mt-8 space-y-8 animate-fadeIn">
          {/* Action Bar */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full font-bold uppercase bg-red-100 dark:bg-red-950 text-[#E11D48]">
                {result.mode === 'ai-gemini' ? 'Direct LLM Mode' : 'AI Reasoning Mode'}
              </span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Topic: <strong className="text-slate-900 dark:text-white">"{keyword}"</strong>
              </span>
            </div>
            <button
              onClick={handleGenerate}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#E11D48] hover:underline"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate Creative Ideas</span>
            </button>
          </div>

          {/* Titles Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-lg">
            <div className="flex items-center gap-2 mb-4 text-[#E11D48] font-bold">
              <FileText className="w-5 h-5" />
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                AI Generated Pin Titles
              </h3>
            </div>
            <div className="space-y-3">
              {result.titles.map((title, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm sm:text-base">
                    {title}
                  </span>
                  <button
                    onClick={() => copyToClipboard(title, `title-${i}`)}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-[#E11D48] hover:border-[#E11D48] transition-all shrink-0"
                    title="Copy Title"
                  >
                    {copiedIndex === `title-${i}` ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Descriptions Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-lg">
            <div className="flex items-center gap-2 mb-4 text-[#E11D48] font-bold">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                AI Copywritten Pin Descriptions
              </h3>
            </div>
            <div className="space-y-4">
              {result.descriptions.map((desc, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                >
                  <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-3">
                    {desc}
                  </p>
                  <button
                    onClick={() => copyToClipboard(desc, `desc-${i}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-[#E11D48] hover:border-[#E11D48] transition-all"
                  >
                    {copiedIndex === `desc-${i}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedIndex === `desc-${i}` ? 'Copied!' : 'Copy Description'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Hashtags Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-lg">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2 text-[#E11D48] font-bold">
                <Hash className="w-5 h-5" />
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Targeted Hashtags
                </h3>
              </div>
              <button
                onClick={() => copyToClipboard(result.hashtags.join(' '), 'all-tags')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E11D48] text-white text-xs font-bold hover:bg-rose-600 transition-all shadow-xs"
              >
                {copiedIndex === 'all-tags' ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedIndex === 'all-tags' ? 'Copied All!' : 'Copy All Hashtags'}</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {result.hashtags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold border border-slate-200 dark:border-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
