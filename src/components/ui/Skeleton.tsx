export default function Skeleton({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`skeleton rounded-[var(--radius-sm)] ${className}`}
      {...props}
    />
  );
}

export function ContentCardSkeleton() {
  return (
    <div className="space-y-3 poster-frame p-2 h-full flex flex-col">
      <div className="skeleton rounded-sm aspect-[3/4] flex-1 w-full" />
      <div className="space-y-2 mt-auto pb-2">
        <div className="skeleton h-6 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
      </div>
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
        <div className="flex-1 skeleton rounded-[var(--radius-sm)] aspect-[3/4] max-h-[600px] border-2 border-[var(--border)]" />
        <div className="flex-1 space-y-4">
          <div className="skeleton h-8 w-24 rounded-sm" />
          <div className="skeleton h-12 w-full rounded-sm" />
          <div className="skeleton h-6 w-3/4 rounded-sm" />
          <div className="flex gap-2 mt-4">
            <div className="skeleton h-6 w-16 rounded-sm" />
            <div className="skeleton h-6 w-20 rounded-sm" />
            <div className="skeleton h-6 w-14 rounded-sm" />
          </div>
          <div className="skeleton h-14 w-full rounded-sm mt-8 border border-[var(--border)]" />
          <div className="skeleton h-14 w-full rounded-sm border border-[var(--border)]" />
        </div>
      </div>
    </div>
  );
}
