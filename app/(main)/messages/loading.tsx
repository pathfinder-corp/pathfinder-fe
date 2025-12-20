import { Skeleton } from '@/components/ui/skeleton';

export default function MessagesLoading() {
  return (
    <div className="h-full flex overflow-hidden bg-neutral-950">
      <div className="w-[360px] border-r border-neutral-800 flex flex-col bg-neutral-900/50">
        <div className="h-24 px-5 flex items-center border-b border-neutral-800">
          <Skeleton className="h-9 w-32 bg-neutral-800" />
        </div>
        
        <div className="px-4 mt-5 mb-3">
          <Skeleton className="h-14 w-full rounded-lg bg-neutral-800" />
        </div>

        <div className="flex-1 p-3 space-y-2.5 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl">
              <Skeleton className="size-14 rounded-full bg-neutral-800 shrink-0" />
              <div className="flex-1 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-36 bg-neutral-800" />
                  <Skeleton className="h-5 w-16 bg-neutral-800" />
                </div>
                <Skeleton className="h-5 w-52 bg-neutral-800" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-24 px-6 flex items-center justify-between border-b border-neutral-800 bg-neutral-900/30">
          <div className="flex items-center gap-4">
            <Skeleton className="size-14 rounded-full bg-neutral-800" />
            <div className="space-y-2.5">
              <Skeleton className="h-7 w-36 bg-neutral-800" />
              <Skeleton className="h-6 w-28 bg-neutral-800" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-12 rounded-lg bg-neutral-800" />
          </div>
        </div>

        <div className="flex-1 p-6 space-y-5 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`flex gap-4 ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              {i % 2 === 0 && <Skeleton className="size-11 rounded-full bg-neutral-800 shrink-0" />}
              <div className={`space-y-2 ${i % 2 === 0 ? '' : 'flex flex-col items-end'}`}>
                <Skeleton className={`h-20 ${i % 2 === 0 ? 'w-80' : 'w-72'} rounded-2xl bg-neutral-800`} />
                <Skeleton className="h-4 w-14 bg-neutral-800" />
              </div>
              {i % 2 !== 0 && <Skeleton className="size-11 rounded-full bg-neutral-800 shrink-0" />}
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-neutral-800 bg-neutral-900/30">
          <div className="flex items-center gap-4">
            <Skeleton className="flex-1 h-16 rounded-lg bg-neutral-800" />
            <Skeleton className="size-14 rounded-full bg-neutral-800" />
          </div>
        </div>
      </div>
    </div>
  );
}

