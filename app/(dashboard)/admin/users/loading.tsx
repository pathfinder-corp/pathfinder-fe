import { Skeleton } from '@/components/ui/skeleton';

export default function UsersLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="mb-3 h-11 w-32 bg-neutral-800" />
        <Skeleton className="h-7 w-72 bg-neutral-800" />
      </div>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Skeleton className="h-12 max-w-xl flex-1 rounded-lg bg-neutral-800" />
        <Skeleton className="h-12 w-[140px] rounded-lg bg-neutral-800" />
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50">
        <div className="grid grid-cols-7 gap-4 border-b border-neutral-800 px-6 py-4">
          <Skeleton className="h-5 w-14 bg-neutral-800" />
          <Skeleton className="h-5 w-14 bg-neutral-800" />
          <Skeleton className="h-5 w-12 bg-neutral-800" />
          <Skeleton className="h-5 w-14 bg-neutral-800" />
          <Skeleton className="h-5 w-18 bg-neutral-800" />
          <Skeleton className="h-5 w-22 bg-neutral-800" />
          <Skeleton className="ml-auto h-5 w-16 bg-neutral-800" />
        </div>

        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-7 items-center gap-4 border-b border-neutral-800 px-6 py-4"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 shrink-0 rounded-full bg-neutral-800" />
              <Skeleton className="h-5 w-32 bg-neutral-800" />
            </div>
            <Skeleton className="h-5 w-48 bg-neutral-800" />
            <Skeleton className="h-7 w-20 rounded-full bg-neutral-800" />
            <Skeleton className="h-7 w-18 rounded-full bg-neutral-800" />
            <Skeleton className="h-5 w-28 bg-neutral-800" />
            <Skeleton className="h-5 w-28 bg-neutral-800" />
            <Skeleton className="ml-auto size-9 rounded-lg bg-neutral-800" />
          </div>
        ))}

        <div className="flex items-center justify-between px-6 py-4">
          <Skeleton className="h-6 w-52 bg-neutral-800" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24 rounded-lg bg-neutral-800" />
            <Skeleton className="size-10 rounded-lg bg-neutral-800" />
            <Skeleton className="size-10 rounded-lg bg-neutral-800" />
            <Skeleton className="size-10 rounded-lg bg-neutral-800" />
            <Skeleton className="h-10 w-20 rounded-lg bg-neutral-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
