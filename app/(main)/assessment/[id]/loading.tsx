import { Skeleton } from '@/components/ui/skeleton';

export default function AssessmentDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-5">
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

      <Skeleton className="h-3 w-full rounded-full mb-12 bg-neutral-800" />

      <div className="bg-neutral-900/30 border border-neutral-800 rounded-2xl p-12 mb-10">
        <Skeleton className="h-10 w-full mb-5 bg-neutral-800" />
        <Skeleton className="h-10 w-3/4 mb-12 bg-neutral-800" />

        <div className="space-y-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex items-center gap-6 p-7 rounded-xl border border-neutral-800 bg-neutral-900/50">
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

