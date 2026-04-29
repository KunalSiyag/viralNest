export default function Skeleton({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`skeleton rounded-2xl ${className}`}
      {...props}
    />
  );
}

export function ContentCardSkeleton() {
  return (
    <div className="space-y-3">
      <div className="skeleton rounded-2xl aspect-[3/4]" />
    </div>
  );
}

export function ContentGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ContentCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PreviewSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 skeleton rounded-3xl aspect-video min-h-[400px]" />
        <div className="flex-1 space-y-4">
          <div className="skeleton h-8 w-24 rounded-full" />
          <div className="skeleton h-8 w-full rounded-lg" />
          <div className="skeleton h-6 w-3/4 rounded-lg" />
          <div className="flex gap-2 mt-4">
            <div className="skeleton h-6 w-16 rounded-md" />
            <div className="skeleton h-6 w-20 rounded-md" />
            <div className="skeleton h-6 w-14 rounded-md" />
          </div>
          <div className="skeleton h-14 w-full rounded-xl mt-8" />
          <div className="skeleton h-14 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
