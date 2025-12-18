import { Skeleton } from '@/components/ui/skeleton';

export default function NotificationsLoading() {
  return (
    <div className="pt-10 pb-12 flex flex-col items-center justify-center">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="size-16 rounded-full bg-neutral-800" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-56 bg-neutral-800" />
          <Skeleton className="h-6 w-40 bg-neutral-800" />
        </div>
      </div>

      <div className="w-[58rem] flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-16 bg-neutral-800" />
          <Skeleton className="h-10 w-20 bg-neutral-800" />
          <Skeleton className="h-10 w-16 bg-neutral-800" />
        </div>
        <Skeleton className="h-10 w-36 bg-neutral-800" />
      </div>

      <div className="w-[58rem] space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <Skeleton className="size-12 rounded-full bg-neutral-800" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-48 bg-neutral-800" />
                  <Skeleton className="h-6 w-24 bg-neutral-800 rounded-full" />
                </div>
                <Skeleton className="h-5 w-full bg-neutral-800" />
                <Skeleton className="h-4 w-28 bg-neutral-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

