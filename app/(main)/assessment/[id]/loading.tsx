import { Skeleton } from '@/components/ui/skeleton';

export default function AssessmentDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Skeleton className="size-10 rounded-lg bg-neutral-800" />
          <Skeleton className="h-6 w-32 bg-neutral-800" />
          <Skeleton className="size-10 rounded-lg bg-neutral-800" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-5 w-24 bg-neutral-800" />
          <Skeleton className="h-6 w-16 rounded-full bg-neutral-800" />
        </div>
      </div>

      <Skeleton className="h-2 w-full rounded-full mb-4 bg-neutral-800" />

      <div className="bg-neutral-900/30 border border-neutral-800 rounded-2xl p-8 mb-6">
        <Skeleton className="h-8 w-full mb-4 bg-neutral-800" />
        <Skeleton className="h-8 w-3/4 mb-8 bg-neutral-800" />

        <div className="space-y-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex items-center gap-4 p-5 rounded-xl border border-neutral-800 bg-neutral-900/50">
              <Skeleton className="size-7 rounded-full bg-neutral-800" />
              <Skeleton className="h-5 w-full bg-neutral-800" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-12 w-32 rounded-lg bg-neutral-800" />
        <Skeleton className="h-12 w-36 rounded-lg bg-neutral-800" />
      </div>
    </div>
  );
}

