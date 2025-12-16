import { Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function HistoryLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 animate-pulse"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0 space-y-3">
              <Skeleton className="h-6 w-3/4 bg-neutral-800" />
              <Skeleton className="h-6 w-1/2 bg-neutral-800" />
              
              <div className="flex items-center gap-2 mt-3">
                <Calendar className="size-4 text-neutral-600" />
                <Skeleton className="h-4 w-20 bg-neutral-800" />
              </div>
            </div>

            <Skeleton className="size-10 rounded bg-neutral-800" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16 bg-neutral-800" />
              <Skeleton className="h-4 w-24 bg-neutral-800" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16 bg-neutral-800" />
              <Skeleton className="h-4 w-20 bg-neutral-800" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16 bg-neutral-800" />
              <Skeleton className="h-4 w-28 bg-neutral-800" />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-800">
            <Skeleton className="h-4 w-full bg-neutral-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

