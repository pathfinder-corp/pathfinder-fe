import { Skeleton } from '@/components/ui/skeleton';

export default function MyApplicationsLoading() {
  return (
    <div className="flex flex-col items-center justify-center pt-12 pb-16">
      <Skeleton className="mb-8 h-16 w-80 bg-neutral-800" />
      <Skeleton className="mb-10 h-8 w-lg bg-neutral-800" />

      <div className="w-232">
        <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50">
          <div className="border-b border-neutral-800 p-7">
            <div className="flex items-start gap-5">
              <Skeleton className="size-20 rounded-xl bg-neutral-800" />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-md bg-neutral-800" />
                    <Skeleton className="h-6 w-52 bg-neutral-800" />
                  </div>
                  <Skeleton className="h-11 w-36 rounded-full bg-neutral-800" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-7 p-7">
            <div className="space-y-3">
              <Skeleton className="h-5 w-20 bg-neutral-800" />
              <Skeleton className="h-6 w-full bg-neutral-800" />
              <Skeleton className="h-6 w-3/4 bg-neutral-800" />
            </div>

            <div className="space-y-3">
              <Skeleton className="h-5 w-28 bg-neutral-800" />
              <Skeleton className="h-6 w-full bg-neutral-800" />
              <Skeleton className="h-6 w-2/3 bg-neutral-800" />
            </div>

            <Skeleton className="h-px w-full bg-neutral-800" />

            <div className="grid grid-cols-2 gap-7 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-24 bg-neutral-800" />
                  <Skeleton className="h-7 w-28 bg-neutral-800" />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <Skeleton className="h-5 w-24 bg-neutral-800" />
              <div className="flex flex-wrap gap-2.5">
                <Skeleton className="h-10 w-32 rounded-full bg-neutral-800" />
                <Skeleton className="h-10 w-36 rounded-full bg-neutral-800" />
                <Skeleton className="h-10 w-28 rounded-full bg-neutral-800" />
              </div>
            </div>

            <div className="space-y-4">
              <Skeleton className="h-5 w-20 bg-neutral-800" />
              <div className="flex flex-wrap gap-2.5">
                <Skeleton className="h-10 w-28 rounded-full bg-neutral-800" />
                <Skeleton className="h-10 w-24 rounded-full bg-neutral-800" />
                <Skeleton className="h-10 w-32 rounded-full bg-neutral-800" />
                <Skeleton className="h-10 w-26 rounded-full bg-neutral-800" />
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-800 bg-neutral-900/30 p-7">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-md bg-neutral-800" />
              <Skeleton className="h-12 w-48 rounded-md bg-neutral-800" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
