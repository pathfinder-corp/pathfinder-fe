import { Skeleton } from '@/components/ui/skeleton';

export default function MentorsLoading() {
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

      <main className="pt-24">
        <section className="relative py-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <Skeleton className="h-8 w-56 mx-auto mb-6 rounded-full bg-neutral-800" />
            <Skeleton className="h-16 w-[32rem] mx-auto mb-4 bg-neutral-800" />
            <Skeleton className="h-7 w-[40rem] mx-auto mb-10 bg-neutral-800" />
            
            <div className="flex items-center justify-center gap-16 mb-12">
              <div className="text-center">
                <Skeleton className="h-10 w-20 mx-auto mb-1 bg-neutral-800" />
                <Skeleton className="h-4 w-24 mx-auto bg-neutral-800" />
              </div>
              <div className="h-8 w-px bg-neutral-800" />
              <div className="text-center">
                <Skeleton className="h-10 w-16 mx-auto mb-1 bg-neutral-800" />
                <Skeleton className="h-4 w-20 mx-auto bg-neutral-800" />
              </div>
              <div className="h-8 w-px bg-neutral-800" />
              <div className="text-center">
                <Skeleton className="h-10 w-24 mx-auto mb-1 bg-neutral-800" />
                <Skeleton className="h-4 w-32 mx-auto bg-neutral-800" />
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 -mt-4 mb-10">
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <Skeleton className="flex-1 h-14 bg-neutral-800 rounded-lg" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-14 w-[160px] bg-neutral-800 rounded-lg" />
                <Skeleton className="h-14 w-[180px] bg-neutral-800 rounded-lg" />
                <Skeleton className="h-14 w-32 bg-neutral-800 rounded-lg" />
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 pb-16">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-6 w-48 bg-neutral-800" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                <Skeleton className="h-32 w-full bg-neutral-800" />
                <div className="p-6 pt-14">
                  <Skeleton className="h-6 w-40 mb-2 bg-neutral-800" />
                  <Skeleton className="h-5 w-56 mb-4 bg-neutral-800" />
                  <Skeleton className="h-12 w-full mb-4 bg-neutral-800" />
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-20 bg-neutral-800 rounded-full" />
                    <Skeleton className="h-6 w-24 bg-neutral-800 rounded-full" />
                  </div>
                  <Skeleton className="h-11 w-full bg-neutral-800 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}