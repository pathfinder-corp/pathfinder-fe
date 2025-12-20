import { Skeleton } from '@/components/ui/skeleton';

export default function AssessmentsLoading() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-14 w-56 mb-4 bg-neutral-800" />
        <Skeleton className="h-7 w-96 bg-neutral-800" />
      </div>

      <div className="flex flex-col sm:flex-row gap-5 sm:items-center justify-between">
        <Skeleton className="h-14 flex-1 max-w-xl bg-neutral-800 rounded-lg" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-[180px] bg-neutral-800 rounded-lg" />
          <Skeleton className="h-14 w-[170px] bg-neutral-800 rounded-lg" />
        </div>
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 gap-4 px-6 py-4 border-b border-neutral-800">
          <Skeleton className="h-5 w-16 bg-neutral-800" />
          <Skeleton className="h-5 w-14 bg-neutral-800" />
          <Skeleton className="h-5 w-20 bg-neutral-800" />
          <Skeleton className="h-5 w-20 bg-neutral-800" />
          <Skeleton className="h-5 w-14 bg-neutral-800" />
          <Skeleton className="h-5 w-18 bg-neutral-800" />
          <Skeleton className="h-5 w-16 bg-neutral-800 ml-auto" />
        </div>

        {[...Array(10)].map((_, i) => (
          <div key={i} className="grid grid-cols-7 gap-4 px-6 py-4 border-b border-neutral-800 items-center">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-lg bg-neutral-800 shrink-0" />
              <Skeleton className="h-5 w-36 bg-neutral-800" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="size-8 rounded-full bg-neutral-800" />
              <Skeleton className="h-5 w-24 bg-neutral-800" />
            </div>
            <Skeleton className="h-7 w-20 rounded-full bg-neutral-800" />
            <Skeleton className="h-5 w-8 bg-neutral-800" />
            <Skeleton className="h-7 w-24 rounded-full bg-neutral-800" />
            <Skeleton className="h-5 w-24 bg-neutral-800" />
            <Skeleton className="size-9 rounded-lg bg-neutral-800 ml-auto" />
          </div>
        ))}

        <div className="px-6 py-4 flex items-center justify-between">
          <Skeleton className="h-6 w-60 bg-neutral-800" />
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