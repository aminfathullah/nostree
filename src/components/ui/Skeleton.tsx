import { cn } from "../../lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-card-hover/80",
        className
      )}
    />
  );
}

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

export function PreviewSkeleton() {
  return (
    <div className="w-[340px] h-[670px] bg-[#121215] rounded-[2.75rem] p-3 shadow-2xl ring-1 ring-white/10 mx-auto">
      <div className="w-full h-full rounded-[2.25rem] bg-card/60 p-6 flex flex-col items-center justify-start animate-pulse">
        <div className="w-18 h-18 rounded-full bg-card-hover mb-4 mt-6" />
        <div className="h-6 w-32 rounded-lg bg-card-hover mb-2" />
        <div className="h-4 w-44 rounded-md bg-card-hover/70 mb-8" />
        <div className="w-full space-y-3">
          <div className="h-12 w-full rounded-xl bg-card-hover" />
          <div className="h-12 w-full rounded-xl bg-card-hover" />
          <div className="h-12 w-full rounded-xl bg-card-hover" />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
