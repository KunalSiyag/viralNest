import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
// For demo purposes, we will just use the category string to filter by tags
// In a real app, we would have a robust taxonomy
export default async function CategoryFeedPage({ params }: { params: { category: string } }) {
  const category = params.category;

  // Try to find content where tags contain the category string (simple search)
  const content = await prisma.content.findMany({
    where: {
      tags: {
        contains: category.toLowerCase(),
      }
    },
    orderBy: { created_at: "desc" },
    take: 20,
  });

  const categoryTitles: Record<string, string> = {
    fitness: "Trending Fitness Reels",
    startup: "Startup Insights & Advice",
    design: "Design Inspiration",
    motivation: "Daily Motivation",
  };

  const title = categoryTitles[category.toLowerCase()] || `${category.charAt(0).toUpperCase() + category.slice(1)} Content`;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-extrabold tracking-tight">{title}</h1>
        <p className="text-xl text-neutral-600 dark:text-neutral-400">Discover top content in {category}.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {content.map((item, index) => {
          const showAd = (index + 1) % 6 === 0;

          return (
            <div key={item.id} className="space-y-4">
              <Link href={`/preview/${item.id}`} className="group block relative rounded-2xl overflow-hidden aspect-[3/4] bg-neutral-200 dark:bg-neutral-800 shadow-md">
                {item.thumbnail_url ? (
                  <img src={item.thumbnail_url} alt={item.caption || "Thumbnail"} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-500">No Image</div>
                )}
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-white text-xs font-bold uppercase">
                  {item.platform}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-4">
                  <p className="text-white text-sm line-clamp-3 font-medium">{item.caption}</p>
                </div>
              </Link>

              {showAd && (
                <div className="col-span-full md:col-span-3 lg:col-span-4 p-8 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center justify-center my-4 shadow-inner">
                  <p className="text-neutral-500 font-medium">Ad Space - Google AdSense</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {content.length === 0 && (
        <div className="text-center py-20 space-y-4">
           <h3 className="text-xl text-neutral-500 font-medium">No content found for &apos;{category}&apos; yet.</h3>
           <p className="text-neutral-400">Try extracting links that contain this keyword!</p>
           <Link href="/" className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white font-bold rounded-full">Go to Extractor</Link>
        </div>
      )}
    </div>
  );
}