import { Loader2 } from 'lucide-react';

export default function RoadmapLoading() {
  return (
    <div className="flex flex-col items-center justify-center pt-64">
      <Loader2 className="size-16 animate-spin text-neutral-400" />
      <p className="mt-5 text-3xl text-neutral-400">Loading...</p>
    </div>
  );
}
