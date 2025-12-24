import { Loader2 } from 'lucide-react';

export default function DetailLoading() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-center">
      <Loader2 className="size-20 animate-spin text-neutral-400" />
      <p className="text-2xl text-neutral-400">Loading roadmap...</p>
    </div>
  );
}
