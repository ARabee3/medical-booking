export const SkeletonCard = () => {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-6 space-y-4">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-[var(--color-muted)] animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-1/3 bg-[var(--color-muted)] rounded animate-pulse" />
          <div className="h-3 w-1/4 bg-[var(--color-muted)] rounded animate-pulse" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-[var(--color-muted)] rounded animate-pulse" />
        <div className="h-3 w-5/6 bg-[var(--color-muted)] rounded animate-pulse" />
      </div>
    </div>
  );
};
