import { Skeleton } from '@/components/ui/skeleton';

export default function MentorshipRequestsLoading() {
  return (
    <div className="flex flex-col items-center justify-center pt-12 pb-16">
      <Skeleton className="mb-8 h-16 w-lg bg-neutral-800" />
      <Skeleton className="mb-10 h-8 w-xl bg-neutral-800" />

      <Skeleton className="mb-10 h-14 w-232 rounded-lg bg-neutral-800" />

      <div className="w-232 space-y-5">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-7"
          >
            <div className="flex items-start gap-5">
              <Skeleton className="size-16 rounded-full bg-neutral-800" />
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-52 bg-neutral-800" />
                    <Skeleton className="h-5 w-36 bg-neutral-800" />
                  </div>
                  <Skeleton className="h-9 w-28 rounded-full bg-neutral-800" />
                </div>
                <Skeleton className="h-6 w-full bg-neutral-800" />
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-28 rounded-md bg-neutral-800" />
                  <Skeleton className="h-10 w-32 rounded-md bg-neutral-800" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
