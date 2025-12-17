import { Skeleton } from '@/components/ui/skeleton';

export default function MentorLoading() {
  return (
    <div className="pt-10 pb-12 flex flex-col items-center justify-center">
      <Skeleton className="h-14 w-80 mb-6 bg-neutral-800" />
      <Skeleton className="h-7 w-[32rem] bg-neutral-800" />

      <div className="w-[58rem] space-y-7 mt-8">
        <div className="space-y-3">
          <Skeleton className="h-8 w-48 bg-neutral-800" />
          <Skeleton className="h-18 w-full bg-neutral-800 rounded-lg" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-8 w-24 bg-neutral-800" />
          <Skeleton className="h-36 w-full bg-neutral-800 rounded-lg" />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-40 bg-neutral-800" />
            <Skeleton className="h-18 w-full bg-neutral-800 rounded-lg" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-8 w-32 bg-neutral-800" />
            <Skeleton className="h-18 w-full bg-neutral-800 rounded-lg" />
          </div>
        </div>

        <div className="space-y-3">
          <Skeleton className="h-8 w-44 bg-neutral-800" />
          <Skeleton className="h-18 w-full bg-neutral-800 rounded-lg" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-8 w-28 bg-neutral-800" />
          <Skeleton className="h-18 w-full bg-neutral-800 rounded-lg" />
        </div>

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

        <div className="space-y-3">
          <Skeleton className="h-8 w-72 bg-neutral-800" />
          <Skeleton className="h-36 w-full bg-neutral-800 rounded-lg" />
        </div>

        <Skeleton className="h-14 w-full bg-neutral-800 rounded-lg" />
      </div>
    </div>
  );
}