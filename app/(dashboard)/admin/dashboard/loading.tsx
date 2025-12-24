import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="mb-4 h-14 w-56 bg-neutral-800" />
        <Skeleton className="h-7 w-96 bg-neutral-800" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-7"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="mb-4 h-6 w-32 bg-neutral-800" />
                <Skeleton className="mb-3 h-12 w-28 bg-neutral-800" />
                <Skeleton className="h-6 w-40 bg-neutral-800" />
              </div>
              <Skeleton className="size-14 rounded-lg bg-neutral-800" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-7">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Skeleton className="mb-3 h-8 w-48 bg-neutral-800" />
            <Skeleton className="h-6 w-56 bg-neutral-800" />
          </div>
          <Skeleton className="h-12 w-72 rounded-lg bg-neutral-800" />
        </div>
        <Skeleton className="h-[350px] w-full rounded-lg bg-neutral-800" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-7"
          >
            <Skeleton className="mb-5 h-7 w-40 bg-neutral-800" />
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-7"
          >
            <Skeleton className="mb-5 h-7 w-60 bg-neutral-800" />
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
