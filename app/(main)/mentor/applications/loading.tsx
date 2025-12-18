import { Skeleton } from '@/components/ui/skeleton';

export default function MyApplicationsLoading() {
  return (
    <div className="pt-10 pb-12 flex flex-col items-center justify-center">
      <Skeleton className="h-14 w-72 mb-6 bg-neutral-800" />
      <Skeleton className="h-7 w-[28rem] mb-8 bg-neutral-800" />

      <div className="w-[58rem]">
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-neutral-800">
            <div className="flex items-start gap-4">
              <Skeleton className="size-16 rounded-xl bg-neutral-800" />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-80 bg-neutral-800" />
                    <Skeleton className="h-5 w-48 bg-neutral-800" />
                  </div>
                  <Skeleton className="h-10 w-32 bg-neutral-800 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16 bg-neutral-800" />
              <Skeleton className="h-5 w-full bg-neutral-800" />
              <Skeleton className="h-5 w-3/4 bg-neutral-800" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-24 bg-neutral-800" />
              <Skeleton className="h-5 w-full bg-neutral-800" />
              <Skeleton className="h-5 w-2/3 bg-neutral-800" />
            </div>

            <Skeleton className="h-px w-full bg-neutral-800" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20 bg-neutral-800" />
                  <Skeleton className="h-6 w-24 bg-neutral-800" />
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <Skeleton className="h-4 w-20 bg-neutral-800" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-28 bg-neutral-800 rounded-full" />
                <Skeleton className="h-8 w-32 bg-neutral-800 rounded-full" />
                <Skeleton className="h-8 w-24 bg-neutral-800 rounded-full" />
              </div>
            </div>

            <div className="space-y-3">
              <Skeleton className="h-4 w-16 bg-neutral-800" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-24 bg-neutral-800 rounded-full" />
                <Skeleton className="h-8 w-20 bg-neutral-800 rounded-full" />
                <Skeleton className="h-8 w-28 bg-neutral-800 rounded-full" />
                <Skeleton className="h-8 w-22 bg-neutral-800 rounded-full" />
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-neutral-800 bg-neutral-900/30">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-80 bg-neutral-800" />
              <Skeleton className="h-11 w-44 bg-neutral-800 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}