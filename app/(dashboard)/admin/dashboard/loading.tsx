import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-14 w-56 mb-4 bg-neutral-800" />
        <Skeleton className="h-7 w-96 bg-neutral-800" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-7">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="h-6 w-32 mb-4 bg-neutral-800" />
                <Skeleton className="h-12 w-28 mb-3 bg-neutral-800" />
                <Skeleton className="h-6 w-40 bg-neutral-800" />
              </div>
              <Skeleton className="size-14 rounded-lg bg-neutral-800" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Skeleton className="h-8 w-48 mb-3 bg-neutral-800" />
            <Skeleton className="h-6 w-56 bg-neutral-800" />
          </div>
          <Skeleton className="h-12 w-72 rounded-lg bg-neutral-800" />
        </div>
        <Skeleton className="h-[350px] w-full rounded-lg bg-neutral-800" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-7">
            <Skeleton className="h-7 w-40 mb-5 bg-neutral-800" />
            <div className="space-y-5">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex items-center justify-between">
                  <Skeleton className="h-6 w-28 bg-neutral-800" />
                  <Skeleton className="h-6 w-16 bg-neutral-800" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-7">
            <Skeleton className="h-7 w-60 mb-5 bg-neutral-800" />
            <div className="space-y-5">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-6 w-6 bg-neutral-800" />
                    <Skeleton className="h-6 w-48 bg-neutral-800" />
                  </div>
                  <Skeleton className="h-6 w-12 bg-neutral-800" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}