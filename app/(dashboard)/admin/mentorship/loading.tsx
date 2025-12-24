import { Skeleton } from '@/components/ui/skeleton';

export default function MentorshipLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="mb-3 h-14 w-80 bg-neutral-800" />
        <Skeleton className="h-8 w-md bg-neutral-800" />
      </div>

      <div className="flex items-center gap-1 border-b border-neutral-800 pb-px">
        <Skeleton className="h-12 w-36 rounded-md bg-neutral-800" />
        <Skeleton className="h-12 w-28 rounded-md bg-neutral-800" />
        <Skeleton className="h-12 w-32 rounded-md bg-neutral-800" />
        <Skeleton className="h-12 w-32 rounded-md bg-neutral-800" />
      </div>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Skeleton className="h-14 max-w-xl flex-1 rounded-lg bg-neutral-800" />
        <Skeleton className="h-14 w-[200px] rounded-lg bg-neutral-800" />
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50">
        <div className="grid grid-cols-6 gap-4 border-b border-neutral-800 px-6 py-5">
          <Skeleton className="h-6 w-24 bg-neutral-800" />
          <Skeleton className="h-6 w-20 bg-neutral-800" />
          <Skeleton className="h-6 w-24 bg-neutral-800" />
          <Skeleton className="h-6 w-20 bg-neutral-800" />
          <Skeleton className="h-6 w-20 bg-neutral-800" />
          <Skeleton className="ml-auto h-6 w-20 bg-neutral-800" />
        </div>

        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-6 items-center gap-4 border-b border-neutral-800 px-6 py-5"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 shrink-0 rounded-full bg-neutral-800" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-36 bg-neutral-800" />
                <Skeleton className="h-5 w-44 bg-neutral-800" />
              </div>
            </div>
            <Skeleton className="h-6 w-40 bg-neutral-800" />
            <Skeleton className="h-6 w-20 bg-neutral-800" />
            <Skeleton className="h-8 w-32 rounded-full bg-neutral-800" />
            <Skeleton className="h-6 w-28 bg-neutral-800" />
            <Skeleton className="ml-auto size-10 rounded-lg bg-neutral-800" />
          </div>
        ))}

        <div className="flex items-center justify-between px-6 py-5">
          <Skeleton className="h-6 w-72 bg-neutral-800" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-11 w-28 rounded-lg bg-neutral-800" />
            <Skeleton className="size-11 rounded-lg bg-neutral-800" />
            <Skeleton className="size-11 rounded-lg bg-neutral-800" />
            <Skeleton className="size-11 rounded-lg bg-neutral-800" />
            <Skeleton className="h-11 w-24 rounded-lg bg-neutral-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
