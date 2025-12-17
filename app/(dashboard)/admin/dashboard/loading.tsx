import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-11 w-48 mb-3 bg-neutral-800" />
        <Skeleton className="h-6 w-80 bg-neutral-800" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="h-5 w-28 mb-3 bg-neutral-800" />
                <Skeleton className="h-10 w-24 mb-2 bg-neutral-800" />
                <Skeleton className="h-5 w-36 bg-neutral-800" />
              </div>
              <Skeleton className="size-12 rounded-lg bg-neutral-800" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Skeleton className="h-7 w-40 mb-2 bg-neutral-800" />
            <Skeleton className="h-5 w-48 bg-neutral-800" />
          </div>
          <Skeleton className="h-11 w-64 rounded-lg bg-neutral-800" />
        </div>
        <Skeleton className="h-[300px] w-full rounded-lg bg-neutral-800" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
            <Skeleton className="h-6 w-36 mb-4 bg-neutral-800" />
            <div className="space-y-4">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex items-center justify-between">
                  <Skeleton className="h-5 w-24 bg-neutral-800" />
                  <Skeleton className="h-5 w-14 bg-neutral-800" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
            <Skeleton className="h-6 w-52 mb-4 bg-neutral-800" />
            <div className="space-y-4">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5 bg-neutral-800" />
                    <Skeleton className="h-5 w-40 bg-neutral-800" />
                  </div>
                  <Skeleton className="h-5 w-10 bg-neutral-800" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

