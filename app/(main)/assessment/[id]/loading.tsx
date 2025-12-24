import { Skeleton } from '@/components/ui/skeleton';

export default function AssessmentDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl py-8">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Skeleton className="size-14 rounded-lg bg-neutral-800" />
          <Skeleton className="h-8 w-40 bg-neutral-800" />
          <Skeleton className="size-14 rounded-lg bg-neutral-800" />
        </div>
        <div className="flex items-center gap-5">
          <Skeleton className="h-7 w-32 bg-neutral-800" />
          <Skeleton className="h-8 w-20 rounded-full bg-neutral-800" />
        </div>
      </div>

      <Skeleton className="mb-12 h-3 w-full rounded-full bg-neutral-800" />

      <div className="mb-10 rounded-2xl border border-neutral-800 bg-neutral-900/30 p-12">
        <Skeleton className="mb-5 h-10 w-full bg-neutral-800" />
        <Skeleton className="mb-12 h-10 w-3/4 bg-neutral-800" />

        <div className="space-y-6">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-6 rounded-xl border border-neutral-800 bg-neutral-900/50 p-7"
            >
              <Skeleton className="size-9 rounded-full bg-neutral-800" />
              <Skeleton className="h-6 w-full bg-neutral-800" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-16 w-40 rounded-lg bg-neutral-800" />
        <Skeleton className="h-16 w-44 rounded-lg bg-neutral-800" />
      </div>
    </div>
  );
}
