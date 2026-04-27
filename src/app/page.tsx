"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to extract content");
      }

      // Redirect to preview page
      router.push(`/preview/${data.data.id}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-3xl mx-auto space-y-10">
      <div className="space-y-4">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-neutral-900 dark:text-white">
          The ultimate <span className="text-blue-600">content engine</span>.
        </h1>
        <p className="text-xl text-neutral-600 dark:text-neutral-400">
          Discover, save, and reuse viral content from Instagram, Pinterest, and more.
        </p>
      </div>

      <form onSubmit={handleExtract} className="w-full relative shadow-xl rounded-full">
        <div className="relative flex items-center">
          <Search className="absolute left-6 h-6 w-6 text-neutral-400" />
          <input
            type="url"
            required
            placeholder="Paste a link from Instagram, Pinterest, or YouTube..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full py-5 pl-16 pr-32 text-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition disabled:opacity-50 flex items-center"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Extract"}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </form>

      <div className="pt-10 w-full text-left">
        <h2 className="text-2xl font-bold mb-6">Trending Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Health & Fitness", slug: "fitness" },
            { name: "Startup Insights", slug: "startup" },
            { name: "Design Inspo", slug: "design" },
            { name: "Motivation", slug: "motivation" },
          ].map((cat) => (
            <Link
              key={cat.slug}
              href={`/feed/${cat.slug}`}
              className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl hover:border-blue-500 hover:shadow-md transition text-center font-medium"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
