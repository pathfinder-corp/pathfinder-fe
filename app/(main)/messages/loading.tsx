import { Skeleton } from '@/components/ui/skeleton';

export default function MessagesLoading() {
  return (
    <div className="h-full flex overflow-hidden bg-neutral-950">
      <div className="w-[300px] border-r border-neutral-800 flex flex-col bg-neutral-900/50">
        <div className="h-20 px-4 flex items-center border-b border-neutral-800">
          <Skeleton className="h-7 w-28 bg-neutral-800" />
        </div>
        
        <div className="px-3 mt-4 mb-2">
          <Skeleton className="h-11 w-full rounded-lg bg-neutral-800" />
        </div>

        <div className="flex-1 p-2 space-y-1 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl">
              <Skeleton className="size-12 rounded-full bg-neutral-800 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32 bg-neutral-800" />
                  <Skeleton className="h-5 w-14 bg-neutral-800" />
                </div>
                <Skeleton className="h-5 w-48 bg-neutral-800" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-20 px-5 flex items-center justify-between border-b border-neutral-800 bg-neutral-900/30">
          <div className="flex items-center gap-3">
            <Skeleton className="size-11 rounded-full bg-neutral-800" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32 bg-neutral-800" />
              <Skeleton className="h-5 w-24 bg-neutral-800" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-10 rounded-lg bg-neutral-800" />
          </div>
        </div>

        <div className="flex-1 p-5 space-y-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              {i % 2 === 0 && <Skeleton className="size-9 rounded-full bg-neutral-800 flex-shrink-0" />}
              <div className={`space-y-1 ${i % 2 === 0 ? '' : 'flex flex-col items-end'}`}>
                <Skeleton className={`h-16 ${i % 2 === 0 ? 'w-72' : 'w-64'} rounded-2xl bg-neutral-800`} />
                <Skeleton className="h-3 w-12 bg-neutral-800" />
              </div>
              {i % 2 !== 0 && <Skeleton className="size-9 rounded-full bg-neutral-800 flex-shrink-0" />}
            </div>
          ))}
        </div>

        <div className="p-5 border-t border-neutral-800 bg-neutral-900/30">
          <div className="flex items-center gap-3">
            <Skeleton className="flex-1 h-14 rounded-lg bg-neutral-800" />
            <Skeleton className="size-12 rounded-full bg-neutral-800" />
          </div>
        </div>
      </div>
    </div>
  );
}

