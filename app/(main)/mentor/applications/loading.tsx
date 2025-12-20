import { Skeleton } from '@/components/ui/skeleton';

export default function MyApplicationsLoading() {
  return (
    <div className="pt-12 pb-16 flex flex-col items-center justify-center">
      <Skeleton className="h-16 w-80 mb-8 bg-neutral-800" />
      <Skeleton className="h-8 w-lg mb-10 bg-neutral-800" />

      <div className="w-232">
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="p-7 border-b border-neutral-800">
            <div className="flex items-start gap-5">
              <Skeleton className="size-20 rounded-xl bg-neutral-800" />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-md bg-neutral-800" />
                    <Skeleton className="h-6 w-52 bg-neutral-800" />
                  </div>
                  <Skeleton className="h-11 w-36 bg-neutral-800 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-7 space-y-7">
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

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-7">
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
                <Skeleton className="h-10 w-32 bg-neutral-800 rounded-full" />
                <Skeleton className="h-10 w-36 bg-neutral-800 rounded-full" />
                <Skeleton className="h-10 w-28 bg-neutral-800 rounded-full" />
              </div>
            </div>

            <div className="space-y-4">
              <Skeleton className="h-5 w-20 bg-neutral-800" />
              <div className="flex flex-wrap gap-2.5">
                <Skeleton className="h-10 w-28 bg-neutral-800 rounded-full" />
                <Skeleton className="h-10 w-24 bg-neutral-800 rounded-full" />
                <Skeleton className="h-10 w-32 bg-neutral-800 rounded-full" />
                <Skeleton className="h-10 w-26 bg-neutral-800 rounded-full" />
              </div>
            </div>
          </div>

          <div className="p-7 border-t border-neutral-800 bg-neutral-900/30">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-md bg-neutral-800" />
              <Skeleton className="h-12 w-48 bg-neutral-800 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}