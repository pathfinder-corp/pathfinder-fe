import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-14 w-64 mb-3 bg-neutral-800" />
        <Skeleton className="h-7 w-96 bg-neutral-800" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
            <Skeleton className="h-6 w-20 mb-2 bg-neutral-800" />
            <Skeleton className="h-10 w-16 bg-neutral-800" />
          </div>
        ))}
      </div>

      <div className="flex gap-5">
        <Skeleton className="h-14 flex-1 max-w-xl bg-neutral-800" />
        <Skeleton className="h-14 w-[160px] bg-neutral-800" />
        <Skeleton className="h-14 w-[160px] bg-neutral-800" />
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 mb-4 last:mb-0">
              <Skeleton className="size-10 rounded-full bg-neutral-800" />
              <Skeleton className="h-5 w-36 bg-neutral-800" />
              <Skeleton className="h-5 w-52 bg-neutral-800" />
              <Skeleton className="h-7 w-20 rounded-full bg-neutral-800" />
              <Skeleton className="h-7 w-24 rounded-full bg-neutral-800" />
              <Skeleton className="h-5 w-28 bg-neutral-800" />
              <Skeleton className="size-9 rounded-lg bg-neutral-800 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}