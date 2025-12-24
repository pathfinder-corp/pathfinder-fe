import { Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function HistoryLoading() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-xl border border-neutral-800 bg-neutral-900/50 p-7"
        >
          <div className="mb-4 flex items-start justify-between">
            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className="h-8 w-3/4 bg-neutral-800" />
              <Skeleton className="h-8 w-1/2 bg-neutral-800" />

              <div className="mt-3 flex items-center gap-2">
                <Calendar className="size-5 text-neutral-600" />
                <Skeleton className="h-6 w-24 bg-neutral-800" />
              </div>
            </div>

            <Skeleton className="size-10 rounded bg-neutral-800" />
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-20 bg-neutral-800" />
              <Skeleton className="h-6 w-28 bg-neutral-800" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-20 bg-neutral-800" />
              <Skeleton className="h-6 w-24 bg-neutral-800" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-20 bg-neutral-800" />
              <Skeleton className="h-6 w-32 bg-neutral-800" />
            </div>
          </div>

          <div className="mt-4 border-t border-neutral-800 pt-4">
            <Skeleton className="h-6 w-full bg-neutral-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
