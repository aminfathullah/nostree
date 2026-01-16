import { cn } from "../../lib/utils";

interface SkeletonProps {
  className?: string;
}

/**
 * Skeleton loading component with shimmer animation
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-gradient-to-r from-card via-card-hover to-card bg-[length:200%_100%]",
        className
      )}
      style={{
        animation: "shimmer 1.5s ease-in-out infinite",
      }}
    />
  );
}

/**
 * Skeleton for link list items
 */
export function LinkSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-card-hover" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-card-hover" />
          <div className="h-3 w-1/2 rounded bg-card-hover" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for the link editor panel
 */
export function LinkEditorSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-6 w-24 rounded bg-card-hover animate-pulse" />
      </div>
      <div className="space-y-2">
        <LinkSkeleton />
        <LinkSkeleton />
        <LinkSkeleton />
      </div>
      <div className="h-12 w-full rounded-xl bg-card-hover animate-pulse" />
    </div>
  );
}

/**
 * Skeleton for the mobile preview
 */
export function PreviewSkeleton() {
  return (
    <div className="w-[375px] h-[700px] border-8 border-zinc-800 rounded-[3rem] shadow-2xl overflow-hidden mx-auto bg-card animate-pulse">
      <div className="h-full px-6 py-10">
        {/* Header skeleton */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-card-hover mb-4" />
          <div className="h-6 w-32 rounded bg-card-hover mb-2" />
          <div className="h-4 w-48 rounded bg-card-hover" />
        </div>
        {/* Links skeleton */}
        <div className="space-y-3">
          <div className="h-14 rounded-xl bg-card-hover" />
          <div className="h-14 rounded-xl bg-card-hover" />
          <div className="h-14 rounded-xl bg-card-hover" />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
