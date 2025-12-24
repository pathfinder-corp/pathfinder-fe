import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-12 w-56 bg-neutral-800" />
        <Skeleton className="h-8 w-md bg-neutral-800" />
      </div>

      <div className="flex items-center gap-2 border-b border-neutral-800 pb-1">
        <Skeleton className="h-12 w-28 rounded-md bg-neutral-800" />
        <Skeleton className="h-12 w-32 rounded-md bg-neutral-800" />
      </div>

      <div className="space-y-8">
        <div className="space-y-5 rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56 bg-neutral-800" />
            <Skeleton className="h-6 w-72 bg-neutral-800" />
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-28 bg-neutral-800" />
                <Skeleton className="h-7 w-52 bg-neutral-800" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5 rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 bg-neutral-800" />
            <Skeleton className="h-6 w-80 bg-neutral-800" />
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-5 w-28 bg-neutral-800" />
              <Skeleton className="h-14 w-full rounded-lg bg-neutral-800" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-28 bg-neutral-800" />
              <Skeleton className="h-14 w-full rounded-lg bg-neutral-800" />
            </div>
          </div>
          <Skeleton className="h-16 w-full rounded-lg bg-neutral-800" />
        </div>
      </div>
    </div>
  );
}
