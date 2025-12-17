import { Skeleton } from '@/components/ui/skeleton';

export default function MentorProfileLoading() {
  return (
    <div className="pt-10 pb-12 flex flex-col items-center justify-center">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="size-16 rounded-full bg-neutral-800" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-56 bg-neutral-800" />
          <Skeleton className="h-5 w-48 bg-neutral-800" />
        </div>
      </div>

      <Skeleton className="w-[58rem] h-16 mb-6 bg-neutral-800 rounded-xl" />

      <div className="w-[58rem] space-y-7">
        <div className="space-y-3">
          <Skeleton className="h-8 w-48 bg-neutral-800" />
          <Skeleton className="h-18 w-full bg-neutral-800 rounded-lg" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-8 w-24 bg-neutral-800" />
          <Skeleton className="h-36 w-full bg-neutral-800 rounded-lg" />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-40 bg-neutral-800" />
            <Skeleton className="h-18 w-full bg-neutral-800 rounded-lg" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-8 w-32 bg-neutral-800" />
            <Skeleton className="h-18 w-full bg-neutral-800 rounded-lg" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-8 w-28 bg-neutral-800" />
            <Skeleton className="h-18 w-full bg-neutral-800 rounded-lg" />
          </div>
        </div>

        <Skeleton className="h-px w-full bg-neutral-800" />

        <div className="space-y-3">
          <Skeleton className="h-8 w-44 bg-neutral-800" />
          <Skeleton className="h-18 w-full bg-neutral-800 rounded-lg" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-8 w-28 bg-neutral-800" />
          <Skeleton className="h-18 w-full bg-neutral-800 rounded-lg" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-8 w-32 bg-neutral-800" />
          <Skeleton className="h-18 w-full bg-neutral-800 rounded-lg" />
        </div>

        <Skeleton className="h-px w-full bg-neutral-800" />

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-36 bg-neutral-800" />
            <Skeleton className="h-18 w-full bg-neutral-800 rounded-lg" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-8 w-40 bg-neutral-800" />
            <Skeleton className="h-18 w-full bg-neutral-800 rounded-lg" />
          </div>
        </div>

        <Skeleton className="h-14 w-full bg-neutral-800 rounded-lg" />
      </div>
    </div>
  );
}