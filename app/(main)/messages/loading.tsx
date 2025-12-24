import { Skeleton } from '@/components/ui/skeleton';

export default function MessagesLoading() {
  return (
    <div className="flex h-full overflow-hidden bg-neutral-950">
      <div className="flex w-[360px] flex-col border-r border-neutral-800 bg-neutral-900/50">
        <div className="flex h-24 items-center border-b border-neutral-800 px-5">
          <Skeleton className="h-10 w-40 bg-neutral-800" />
        </div>

        <div className="mt-5 mb-3 px-4">
          <Skeleton className="h-16 w-full rounded-lg bg-neutral-800" />
        </div>

        <div className="flex-1 space-y-2.5 overflow-hidden p-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 rounded-xl p-4">
              <Skeleton className="size-16 shrink-0 rounded-full bg-neutral-800" />
              <div className="flex-1 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-7 w-40 bg-neutral-800" />
                  <Skeleton className="h-6 w-20 bg-neutral-800" />
                </div>
                <Skeleton className="h-6 w-60 bg-neutral-800" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-24 items-center justify-between border-b border-neutral-800 bg-neutral-900/30 px-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full bg-neutral-800" />
            <div className="space-y-2.5">
              <Skeleton className="h-8 w-40 bg-neutral-800" />
              <Skeleton className="h-7 w-32 bg-neutral-800" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-14 rounded-lg bg-neutral-800" />
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-hidden p-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`flex gap-4 ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
            >
              {i % 2 === 0 && (
                <Skeleton className="size-12 shrink-0 rounded-full bg-neutral-800" />
              )}
              <div
                className={`space-y-2 ${i % 2 === 0 ? '' : 'flex flex-col items-end'}`}
              >
                <Skeleton
                  className={`h-24 ${i % 2 === 0 ? 'w-80' : 'w-72'} rounded-2xl bg-neutral-800`}
                />
                <Skeleton className="h-5 w-16 bg-neutral-800" />
              </div>
              {i % 2 !== 0 && (
                <Skeleton className="size-12 shrink-0 rounded-full bg-neutral-800" />
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-800 bg-neutral-900/30 p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-18 flex-1 rounded-lg bg-neutral-800" />
            <Skeleton className="size-16 rounded-full bg-neutral-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
