import { PreviewSkeleton } from '@/components/ui/Skeleton';

export default function PreviewLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <PreviewSkeleton />
    </div>
  );
}
