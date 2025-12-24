import { Skeleton } from '@/components/ui/skeleton';

export default function MentorsLoading() {
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

      <main className="pt-24">
        <section className="relative overflow-hidden py-16">
          <div className="mx-auto max-w-[1100px] px-6 text-center">
            <Skeleton className="mx-auto mb-8 h-10 w-64 rounded-full bg-neutral-800" />
            <Skeleton className="mx-auto mb-6 h-20 w-xl bg-neutral-800" />
            <Skeleton className="mx-auto mb-12 h-8 w-176 bg-neutral-800" />

            <div className="mb-14 flex items-center justify-center gap-16">
              <div className="text-center">
                <Skeleton className="mx-auto mb-1 h-12 w-24 bg-neutral-800" />
                <Skeleton className="mx-auto h-5 w-28 bg-neutral-800" />
              </div>
              <div className="h-10 w-px bg-neutral-800" />
              <div className="text-center">
                <Skeleton className="mx-auto mb-1 h-12 w-20 bg-neutral-800" />
                <Skeleton className="mx-auto h-5 w-24 bg-neutral-800" />
              </div>
              <div className="h-10 w-px bg-neutral-800" />
              <div className="text-center">
                <Skeleton className="mx-auto mb-1 h-12 w-28 bg-neutral-800" />
                <Skeleton className="mx-auto h-5 w-36 bg-neutral-800" />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto -mt-4 mb-10 max-w-[1100px] px-6">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6">
            <div className="flex flex-col gap-4 lg:flex-row">
              <Skeleton className="h-16 flex-1 rounded-lg bg-neutral-800" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-16 w-[180px] rounded-lg bg-neutral-800" />
                <Skeleton className="h-16 w-[200px] rounded-lg bg-neutral-800" />
                <Skeleton className="h-16 w-36 rounded-lg bg-neutral-800" />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] px-6 pb-16">
          <div className="mb-10 flex items-center justify-between">
            <Skeleton className="h-7 w-52 bg-neutral-800" />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900"
              >
                <Skeleton className="h-32 w-full bg-neutral-800" />
                <div className="p-6 pt-14">
                  <Skeleton className="mb-2 h-8 w-44 bg-neutral-800" />
                  <Skeleton className="mb-4 h-6 w-60 bg-neutral-800" />
                  <Skeleton className="mb-5 h-14 w-full bg-neutral-800" />
                  <div className="mb-5 flex gap-2">
                    <Skeleton className="h-7 w-24 rounded-full bg-neutral-800" />
                    <Skeleton className="h-7 w-28 rounded-full bg-neutral-800" />
                  </div>
                  <Skeleton className="h-12 w-full rounded-lg bg-neutral-800" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
