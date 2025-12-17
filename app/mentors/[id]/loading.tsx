import { Skeleton } from '@/components/ui/skeleton';

export default function MentorDetailLoading() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <header className="fixed top-0 w-full h-24 z-50 bg-black/40 backdrop-blur-2xl border-b border-white/10">
        <div className="size-full px-16 grid grid-cols-3 items-center">
          <Skeleton className="h-10 w-40 bg-neutral-800" />
          <div className="hidden lg:flex items-center gap-10 justify-center">
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

      <main className="pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <Skeleton className="h-10 w-40 mb-10 bg-neutral-800" />

          <div className="flex flex-col lg:flex-row items-start gap-8 mb-8">
            <Skeleton className="size-40 rounded-xl bg-neutral-800 flex-shrink-0" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-10 w-72 bg-neutral-800" />
              <Skeleton className="h-6 w-full max-w-lg bg-neutral-800" />
              <Skeleton className="h-5 w-48 bg-neutral-800" />
              <div className="flex gap-3">
                <Skeleton className="h-8 w-28 bg-neutral-800 rounded-full" />
                <Skeleton className="h-8 w-32 bg-neutral-800 rounded-full" />
              </div>
            </div>
          </div>

          <div className="flex gap-4 mb-8 border-b border-neutral-800 pb-1">
            <Skeleton className="h-10 w-20 bg-neutral-800" />
            <Skeleton className="h-10 w-28 bg-neutral-800" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <Skeleton className="h-6 w-32 mb-4 bg-neutral-800" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-full bg-neutral-800" />
                  <Skeleton className="h-5 w-full bg-neutral-800" />
                  <Skeleton className="h-5 w-3/4 bg-neutral-800" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Skeleton className="size-8 rounded bg-neutral-800" />
                <Skeleton className="size-8 rounded bg-neutral-800" />
              </div>

              <div className="pt-4">
                <Skeleton className="h-4 w-16 mb-3 bg-neutral-800" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-24 bg-neutral-800 rounded-full" />
                  <Skeleton className="h-8 w-28 bg-neutral-800 rounded-full" />
                  <Skeleton className="h-8 w-20 bg-neutral-800 rounded-full" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-5 space-y-4">
                <Skeleton className="h-5 w-20 bg-neutral-800" />
                <Skeleton className="h-12 w-full bg-neutral-800 rounded-lg" />
                <Skeleton className="h-px w-full bg-neutral-800" />
                <Skeleton className="h-4 w-24 bg-neutral-800" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-full bg-neutral-800" />
                  <Skeleton className="h-5 w-full bg-neutral-800" />
                </div>
              </div>

              <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-5 space-y-4">
                <Skeleton className="h-5 w-24 bg-neutral-800" />
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-24 bg-neutral-800" />
                    <Skeleton className="h-5 w-16 bg-neutral-800" />
                  </div>
                  <Skeleton className="h-px w-full bg-neutral-800" />
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-20 bg-neutral-800" />
                    <Skeleton className="h-5 w-8 bg-neutral-800" />
                  </div>
                  <Skeleton className="h-px w-full bg-neutral-800" />
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-24 bg-neutral-800" />
                    <Skeleton className="h-5 w-12 bg-neutral-800" />
                  </div>
                  <Skeleton className="h-px w-full bg-neutral-800" />
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-16 bg-neutral-800" />
                    <Skeleton className="h-6 w-20 bg-neutral-800 rounded-full" />
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