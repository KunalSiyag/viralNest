import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import { findSimilarContent } from '@/services/recommendation';
import PreviewClient from './PreviewClient';
import type { Metadata } from 'next';

export default async function PreviewPage({ params }: { params: { id: string } }) {
  let content = null;

  if (params.id.startsWith("stateless-")) {
    // If running in Vercel with SQLite, database writes fail, so the ID is mocked.
    // We can't fetch it from the DB, so we display a generic stateless preview.
    content = {
      id: params.id,
      platform: "extracted",
      source_url: "#",
      media_url: null,
      thumbnail_url: null,
      caption: "Content extracted (Stateless Mode)",
      tags: "[]",
      category: "uncategorized",
      created_at: new Date(),
      popularity_score: 0,
    };
  } else {
    content = await prisma.content.findUnique({
      where: { id: params.id },
    });
  }

  if (!content) {
    notFound();
  }

  // Find similar content based on tags (simple heuristic: same platform or any shared tag)
  const tagsList = JSON.parse(content.tags || "[]");

  const similarContent = await prisma.content.findMany({
    where: {
      id: { not: content.id },
      OR: [
        { platform: content.platform },
      ]
    },
    take: 6,
    orderBy: { created_at: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Main Preview Area */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center min-h-[400px] md:min-h-[600px] relative">
           {content.media_url ? (
             <video
               src={content.media_url}
               controls
               className="w-full h-full max-h-[800px] object-contain"
               poster={content.thumbnail_url || undefined}
             />
           ) : (
             <div className="text-white text-center p-8">
                {content.thumbnail_url && <img src={content.thumbnail_url} alt="Thumbnail" className="max-w-full rounded-xl mb-4" />}
                <p>Media preview unavailable. Check original source.</p>
             </div>
           )}
        </div>

        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-sm font-semibold capitalize">
              {content.platform}
            </div>
            <h1 className="text-2xl font-bold line-clamp-3">{content.caption || "Extracted Content"}</h1>
          </div>

          {tagsList.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tagsList.slice(0, 8).map((tag: string) => (
                <span key={tag} className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-md text-neutral-600 dark:text-neutral-400">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="pt-6 space-y-4">
            {content.media_url && (
              <a
                href={content.media_url}
                download
                target="_blank"
                rel="noreferrer"
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Download className="w-5 h-5" />
                Download Media
              </a>
            )}
            <a
              href={content.source_url}
              target="_blank"
              rel="noreferrer"
              className="w-full py-4 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition"
            >
              <ExternalLink className="w-5 h-5" />
              View Original Post
            </a>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900 rounded-xl mt-8">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
              Ad Space: Insert ad script here
            </p>
          </div>
        </div>
      </div>

      {/* Similar Content Loop */}
      <div className="pt-12 border-t border-neutral-200 dark:border-neutral-800">
        <h2 className="text-2xl font-bold mb-6">Similar Content</h2>
        {similarContent.length > 0 ? (
           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {similarContent.map(item => (
              <Link key={item.id} href={`/preview/${item.id}`} className="group block relative rounded-xl overflow-hidden aspect-[3/4] bg-neutral-200 dark:bg-neutral-800">
                 {item.thumbnail_url ? (
                   <img src={item.thumbnail_url} alt={item.caption || "Thumbnail"} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-neutral-500">No Image</div>
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-4">
                    <p className="text-white text-sm line-clamp-2 font-medium">{item.caption}</p>
                 </div>
              </Link>
            ))}
           </div>
        ) : (
          <p className="text-neutral-500 text-center py-10">No similar content found yet. Keep exploring!</p>
        )}
      </div>
    </div>
  );
}
