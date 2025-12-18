import { Loader2 } from "lucide-react";

export default function DetailLoading() {
  return (
    <div className="flex items-center justify-center flex-col gap-4 h-[80vh] text-center">
      <Loader2 className="size-16 animate-spin text-neutral-400" />
      <p className="text-neutral-400 text-xl">Loading roadmap...</p>
    </div>
  );
}