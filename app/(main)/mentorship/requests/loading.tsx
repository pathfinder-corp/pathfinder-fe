import { Skeleton } from '@/components/ui/skeleton';

export default function MentorshipRequestsLoading() {
  return (
    <div className="pt-10 pb-12 flex flex-col items-center justify-center">
      <Skeleton className="h-14 w-80 mb-6 bg-neutral-800" />
      <Skeleton className="h-7 w-[32rem] mb-8 bg-neutral-800" />

      <Skeleton className="h-12 w-[26rem] mb-8 bg-neutral-800 rounded-lg" />

      <div className="w-[58rem] space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <Skeleton className="size-14 rounded-full bg-neutral-800" />
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48 bg-neutral-800" />
                    <Skeleton className="h-4 w-32 bg-neutral-800" />
                  </div>
                  <Skeleton className="h-7 w-24 bg-neutral-800 rounded-full" />
                </div>
                <Skeleton className="h-5 w-full bg-neutral-800" />
                <div className="flex gap-3">
                  <Skeleton className="h-9 w-24 bg-neutral-800 rounded-md" />
                  <Skeleton className="h-9 w-28 bg-neutral-800 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}