import { Skeleton } from '@/components/ui/skeleton';

export default function MentorLoading() {
  return (
    <div className="pt-12 pb-16 flex flex-col items-center justify-center">
      <Skeleton className="h-16 w-96 mb-8 bg-neutral-800" />
      <Skeleton className="h-8 w-xl bg-neutral-800" />

      <div className="w-232 space-y-8 mt-10">
        <div className="space-y-3">
          <Skeleton className="h-8 w-52 bg-neutral-800" />
          <Skeleton className="h-20 w-full bg-neutral-800 rounded-lg" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-8 w-28 bg-neutral-800" />
          <Skeleton className="h-40 w-full bg-neutral-800 rounded-lg" />
        </div>

        <div className="grid grid-cols-2 gap-7">
          <div className="space-y-3">
            <Skeleton className="h-8 w-44 bg-neutral-800" />
            <Skeleton className="h-20 w-full bg-neutral-800 rounded-lg" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-8 w-36 bg-neutral-800" />
            <Skeleton className="h-20 w-full bg-neutral-800 rounded-lg" />
          </div>
        </div>

        <div className="space-y-3">
          <Skeleton className="h-8 w-48 bg-neutral-800" />
          <Skeleton className="h-20 w-full bg-neutral-800 rounded-lg" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-8 w-32 bg-neutral-800" />
          <Skeleton className="h-20 w-full bg-neutral-800 rounded-lg" />
        </div>

        <div className="grid grid-cols-2 gap-7">
          <div className="space-y-3">
            <Skeleton className="h-8 w-40 bg-neutral-800" />
            <Skeleton className="h-20 w-full bg-neutral-800 rounded-lg" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-8 w-44 bg-neutral-800" />
            <Skeleton className="h-20 w-full bg-neutral-800 rounded-lg" />
          </div>
        </div>

        <div className="space-y-3">
          <Skeleton className="h-8 w-80 bg-neutral-800" />
          <Skeleton className="h-40 w-full bg-neutral-800 rounded-lg" />
        </div>

        <Skeleton className="h-16 w-full bg-neutral-800 rounded-lg" />
      </div>
    </div>
  );
}