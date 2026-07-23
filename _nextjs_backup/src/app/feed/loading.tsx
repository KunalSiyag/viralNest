import { ContentGridSkeleton } from '@/components/ui/Skeleton';

export default function FeedLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="text-center space-y-3 mb-10">
        <div className="skeleton h-10 w-64 mx-auto rounded-lg" />
        <div className="skeleton h-6 w-96 mx-auto rounded-lg" />
      </div>
      <ContentGridSkeleton count={8} />
    </div>
  );
}
