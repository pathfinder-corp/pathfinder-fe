import { Skeleton } from '@/components/ui/skeleton';

export default function MentorProfileLoading() {
  return (
    <div className="flex flex-col items-center justify-center pt-12 pb-16">
      <div className="mb-8 flex items-center gap-5">
        <Skeleton className="size-20 rounded-full bg-neutral-800" />
        <div className="space-y-3">
          <Skeleton className="h-12 w-64 bg-neutral-800" />
          <Skeleton className="h-6 w-52 bg-neutral-800" />
        </div>
      </div>

      <Skeleton className="mb-8 h-20 w-232 rounded-xl bg-neutral-800" />

      <div className="w-232 space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-8 w-52 bg-neutral-800" />
          <Skeleton className="h-20 w-full rounded-lg bg-neutral-800" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-8 w-28 bg-neutral-800" />
          <Skeleton className="h-40 w-full rounded-lg bg-neutral-800" />
        </div>

        <div className="grid grid-cols-3 gap-7">
          <div className="space-y-3">
            <Skeleton className="h-8 w-44 bg-neutral-800" />
            <Skeleton className="h-20 w-full rounded-lg bg-neutral-800" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-8 w-36 bg-neutral-800" />
            <Skeleton className="h-20 w-full rounded-lg bg-neutral-800" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-8 w-32 bg-neutral-800" />
            <Skeleton className="h-20 w-full rounded-lg bg-neutral-800" />
          </div>
        </div>

        <Skeleton className="h-px w-full bg-neutral-800" />

        <div className="space-y-3">
          <Skeleton className="h-8 w-48 bg-neutral-800" />
          <Skeleton className="h-20 w-full rounded-lg bg-neutral-800" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-8 w-32 bg-neutral-800" />
          <Skeleton className="h-20 w-full rounded-lg bg-neutral-800" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-8 w-36 bg-neutral-800" />
          <Skeleton className="h-20 w-full rounded-lg bg-neutral-800" />
        </div>

        <Skeleton className="h-px w-full bg-neutral-800" />

        <div className="grid grid-cols-2 gap-7">
          <div className="space-y-3">
            <Skeleton className="h-8 w-40 bg-neutral-800" />
            <Skeleton className="h-20 w-full rounded-lg bg-neutral-800" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-8 w-44 bg-neutral-800" />
            <Skeleton className="h-20 w-full rounded-lg bg-neutral-800" />
          </div>
        </div>

        <Skeleton className="h-16 w-full rounded-lg bg-neutral-800" />

        <Skeleton className="mt-12 h-px w-full bg-neutral-800" />

        <div className="mt-10 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="size-14 rounded-xl bg-neutral-800" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 bg-neutral-800" />
              <Skeleton className="h-5 w-64 bg-neutral-800" />
            </div>
          </div>
          <Skeleton className="h-12 w-44 rounded-lg bg-neutral-800" />
        </div>

        <div className="mb-8 grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-24 w-full rounded-xl bg-neutral-800"
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-44 w-full rounded-xl bg-neutral-800"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
