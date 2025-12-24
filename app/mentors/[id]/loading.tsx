import { Skeleton } from '@/components/ui/skeleton';

export default function MentorDetailLoading() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <header className="fixed top-0 z-50 h-24 w-full border-b border-white/10 bg-black/40 backdrop-blur-2xl">
        <div className="grid size-full grid-cols-3 items-center px-16">
          <Skeleton className="h-10 w-40 bg-neutral-800" />
          <div className="hidden items-center justify-center gap-10 lg:flex">
            <Skeleton className="h-6 w-16 bg-neutral-800" />
            <Skeleton className="h-6 w-28 bg-neutral-800" />
            <Skeleton className="h-6 w-24 bg-neutral-800" />
            <Skeleton className="h-6 w-20 bg-neutral-800" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="size-12 rounded-full bg-neutral-800" />
          </div>
        </div>
      </header>

      <main className="pt-40 pb-16">
        <div className="mx-auto max-w-[1100px] px-6">
          <div className="mb-8 flex flex-col items-start gap-8 lg:flex-row">
            <Skeleton className="size-40 shrink-0 rounded-xl bg-neutral-800" />
            <div className="flex-1">
              <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <Skeleton className="h-14 w-80 bg-neutral-800" />
                  <Skeleton className="h-8 w-full max-w-lg bg-neutral-800" />
                  <Skeleton className="h-6 w-56 bg-neutral-800" />
                </div>
                <Skeleton className="h-9 w-32 rounded-full bg-neutral-800" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-10 w-32 rounded-full bg-neutral-800" />
                <Skeleton className="h-10 w-36 rounded-full bg-neutral-800" />
              </div>
            </div>
          </div>

          <div className="mb-10 flex gap-1 border-b border-neutral-800">
            <Skeleton className="h-12 w-20 bg-neutral-800" />
            <Skeleton className="h-12 w-28 bg-neutral-800" />
            <Skeleton className="h-12 w-28 bg-neutral-800" />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              <div>
                <Skeleton className="mb-5 h-8 w-36 bg-neutral-800" />
                <div className="space-y-3">
                  <Skeleton className="h-6 w-full bg-neutral-800" />
                  <Skeleton className="h-6 w-full bg-neutral-800" />
                  <Skeleton className="h-6 w-3/4 bg-neutral-800" />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Skeleton className="size-10 rounded bg-neutral-800" />
                <Skeleton className="size-10 rounded bg-neutral-800" />
              </div>

              <div className="pt-4">
                <Skeleton className="mb-4 h-5 w-20 bg-neutral-800" />
                <div className="flex gap-2.5">
                  <Skeleton className="h-10 w-28 rounded-full bg-neutral-800" />
                  <Skeleton className="h-10 w-32 rounded-full bg-neutral-800" />
                  <Skeleton className="h-10 w-24 rounded-full bg-neutral-800" />
                </div>
              </div>
            </div>

            <div className="space-y-7">
              <div className="space-y-5 rounded-lg border border-neutral-800 bg-neutral-900/50 p-6">
                <Skeleton className="h-6 w-32 bg-neutral-800" />
                <Skeleton className="h-14 w-full rounded-lg bg-neutral-800" />
                <Skeleton className="h-px w-full bg-neutral-800" />
                <Skeleton className="h-5 w-28 bg-neutral-800" />
                <div className="space-y-3">
                  <Skeleton className="h-6 w-full bg-neutral-800" />
                  <Skeleton className="h-6 w-full bg-neutral-800" />
                </div>
              </div>

              <div className="space-y-5 rounded-lg border border-neutral-800 bg-neutral-900/50 p-6">
                <Skeleton className="h-6 w-40 bg-neutral-800" />
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-28 bg-neutral-800" />
                    <Skeleton className="h-6 w-20 bg-neutral-800" />
                  </div>
                  <Skeleton className="h-px w-full bg-neutral-800" />
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-24 bg-neutral-800" />
                    <Skeleton className="h-6 w-12 bg-neutral-800" />
                  </div>
                  <Skeleton className="h-px w-full bg-neutral-800" />
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-28 bg-neutral-800" />
                    <Skeleton className="h-6 w-16 bg-neutral-800" />
                  </div>
                  <Skeleton className="h-px w-full bg-neutral-800" />
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-20 bg-neutral-800" />
                    <Skeleton className="h-8 w-24 rounded-full bg-neutral-800" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
