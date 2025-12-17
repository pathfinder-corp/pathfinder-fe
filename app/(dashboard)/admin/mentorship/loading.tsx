import { Skeleton } from '@/components/ui/skeleton';

export default function MentorshipLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-11 w-72 mb-3 bg-neutral-800" />
        <Skeleton className="h-7 w-96 bg-neutral-800" />
      </div>

      <div className="flex items-center gap-1 border-b border-neutral-800 pb-px">
        <Skeleton className="h-10 w-32 bg-neutral-800 rounded-md" />
        <Skeleton className="h-10 w-24 bg-neutral-800 rounded-md" />
        <Skeleton className="h-10 w-28 bg-neutral-800 rounded-md" />
        <Skeleton className="h-10 w-28 bg-neutral-800 rounded-md" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <Skeleton className="h-12 flex-1 max-w-xl bg-neutral-800 rounded-lg" />
        <Skeleton className="h-12 w-[180px] bg-neutral-800 rounded-lg" />
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-neutral-800">
          <Skeleton className="h-5 w-20 bg-neutral-800" />
          <Skeleton className="h-5 w-18 bg-neutral-800" />
          <Skeleton className="h-5 w-22 bg-neutral-800" />
          <Skeleton className="h-5 w-16 bg-neutral-800" />
          <Skeleton className="h-5 w-18 bg-neutral-800" />
          <Skeleton className="h-5 w-16 bg-neutral-800 ml-auto" />
        </div>

        {[...Array(10)].map((_, i) => (
          <div key={i} className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-neutral-800 items-center">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full bg-neutral-800 flex-shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-32 bg-neutral-800" />
                <Skeleton className="h-4 w-40 bg-neutral-800" />
              </div>
            </div>
            <Skeleton className="h-5 w-36 bg-neutral-800" />
            <Skeleton className="h-5 w-16 bg-neutral-800" />
            <Skeleton className="h-7 w-28 rounded-full bg-neutral-800" />
            <Skeleton className="h-5 w-24 bg-neutral-800" />
            <Skeleton className="size-9 rounded-lg bg-neutral-800 ml-auto" />
          </div>
        ))}

        <div className="px-6 py-4 flex items-center justify-between">
          <Skeleton className="h-6 w-64 bg-neutral-800" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24 bg-neutral-800 rounded-lg" />
            <Skeleton className="size-10 bg-neutral-800 rounded-lg" />
            <Skeleton className="size-10 bg-neutral-800 rounded-lg" />
            <Skeleton className="size-10 bg-neutral-800 rounded-lg" />
            <Skeleton className="h-10 w-20 bg-neutral-800 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
