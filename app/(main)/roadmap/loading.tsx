import { Loader2 } from 'lucide-react';

export default function RoadmapLoading() {
  return (
    <div className="pt-12 flex flex-col items-center justify-center">
      <Loader2 className="size-12 animate-spin text-neutral-400" />
      <p className="mt-5 text-xl text-neutral-400">Loading...</p>
    </div>
  );
}