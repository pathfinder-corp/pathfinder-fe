import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-48 bg-neutral-800" />
        <Skeleton className="h-6 w-96 bg-neutral-800" />
      </div>

      <div className="flex items-center gap-2 border-b border-neutral-800 pb-1">
        <Skeleton className="h-10 w-24 bg-neutral-800 rounded-md" />
        <Skeleton className="h-10 w-28 bg-neutral-800 rounded-md" />
      </div>

      <div className="space-y-6">
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48 bg-neutral-800" />
            <Skeleton className="h-5 w-64 bg-neutral-800" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24 bg-neutral-800" />
                <Skeleton className="h-6 w-48 bg-neutral-800" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-56 bg-neutral-800" />
            <Skeleton className="h-5 w-72 bg-neutral-800" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 bg-neutral-800" />
              <Skeleton className="h-12 w-full bg-neutral-800 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 bg-neutral-800" />
              <Skeleton className="h-12 w-full bg-neutral-800 rounded-lg" />
            </div>
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-12 w-36 bg-neutral-800 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

