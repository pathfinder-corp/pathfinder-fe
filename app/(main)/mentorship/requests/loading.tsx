import { Skeleton } from '@/components/ui/skeleton';

export default function MentorshipRequestsLoading() {
  return (
    <div className="pt-12 pb-16 flex flex-col items-center justify-center">
      <Skeleton className="h-16 w-[32rem] mb-8 bg-neutral-800" />
      <Skeleton className="h-8 w-[36rem] mb-10 bg-neutral-800" />

      <Skeleton className="h-14 w-[58rem] mb-10 bg-neutral-800 rounded-lg" />

      <div className="w-[58rem] space-y-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-7">
            <div className="flex items-start gap-5">
              <Skeleton className="size-16 rounded-full bg-neutral-800" />
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-52 bg-neutral-800" />
                    <Skeleton className="h-5 w-36 bg-neutral-800" />
                  </div>
                  <Skeleton className="h-9 w-28 bg-neutral-800 rounded-full" />
                </div>
                <Skeleton className="h-6 w-full bg-neutral-800" />
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-28 bg-neutral-800 rounded-md" />
                  <Skeleton className="h-10 w-32 bg-neutral-800 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}