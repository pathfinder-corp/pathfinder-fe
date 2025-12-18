import { Skeleton } from '@/components/ui/skeleton';

export default function NotificationsLoading() {
  return (
    <div className="pt-10 pb-12 flex flex-col items-center justify-center">
      <div className="flex items-center gap-5 mb-8">
        <Skeleton className="size-20 rounded-full bg-neutral-800" />
        <div className="space-y-3">
          <Skeleton className="h-12 w-64 bg-neutral-800" />
          <Skeleton className="h-7 w-48 bg-neutral-800" />
        </div>
      </div>

      <div className="w-[58rem] flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Skeleton className="h-12 w-20 bg-neutral-800" />
          <Skeleton className="h-12 w-24 bg-neutral-800" />
          <Skeleton className="h-12 w-20 bg-neutral-800" />
        </div>
        <Skeleton className="h-12 w-40 bg-neutral-800" />
      </div>

      <div className="w-[58rem] space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
            <div className="flex items-start gap-5">
              <Skeleton className="size-14 rounded-full bg-neutral-800" />
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-7 w-52 bg-neutral-800" />
                  <Skeleton className="h-7 w-28 bg-neutral-800 rounded-full" />
                </div>
                <Skeleton className="h-6 w-full bg-neutral-800" />
                <Skeleton className="h-5 w-32 bg-neutral-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

