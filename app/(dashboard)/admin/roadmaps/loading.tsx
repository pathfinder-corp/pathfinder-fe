import { Skeleton } from '@/components/ui/skeleton';

export default function RoadmapsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-11 w-40 mb-3 bg-neutral-800" />
        <Skeleton className="h-7 w-72 bg-neutral-800" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <Skeleton className="h-12 flex-1 max-w-xl bg-neutral-800 rounded-lg" />
        <Skeleton className="h-12 w-[140px] bg-neutral-800 rounded-lg" />
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 gap-4 px-6 py-4 border-b border-neutral-800">
          <Skeleton className="h-5 w-14 bg-neutral-800" />
          <Skeleton className="h-5 w-14 bg-neutral-800" />
          <Skeleton className="h-5 w-12 bg-neutral-800" />
          <Skeleton className="h-5 w-20 bg-neutral-800" />
          <Skeleton className="h-5 w-14 bg-neutral-800" />
          <Skeleton className="h-5 w-18 bg-neutral-800" />
          <Skeleton className="h-5 w-16 bg-neutral-800 ml-auto" />
        </div>

        {[...Array(10)].map((_, i) => (
          <div key={i} className="grid grid-cols-7 gap-4 px-6 py-4 border-b border-neutral-800 items-center">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-lg bg-neutral-800 flex-shrink-0" />
              <Skeleton className="h-5 w-40 bg-neutral-800" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="size-8 rounded-full bg-neutral-800" />
              <Skeleton className="h-5 w-28 bg-neutral-800" />
            </div>
            <Skeleton className="h-7 w-24 rounded-full bg-neutral-800" />
            <Skeleton className="h-5 w-20 bg-neutral-800" />
            <Skeleton className="h-7 w-18 rounded-full bg-neutral-800" />
            <Skeleton className="h-5 w-28 bg-neutral-800" />
            <Skeleton className="size-9 rounded-lg bg-neutral-800 ml-auto" />
          </div>
        ))}

        <div className="px-6 py-4 flex items-center justify-between">
          <Skeleton className="h-6 w-56 bg-neutral-800" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24 bg-neutral-800 rounded-lg" />
            <Skeleton className="size-10 bg-neutral-800 rounded-lg" />
            <Skeleton className="size-10 bg-neutral-800 rounded-lg" />
            <Skeleton className="size-10 bg-neutral-800 rounded-lg" />
            <Skeleton className="h-10 w-20 bg-neutral-800 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

