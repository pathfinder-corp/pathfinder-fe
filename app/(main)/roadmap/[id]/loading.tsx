import { Loader2 } from "lucide-react";

export default function DetailLoading() {
  return (
    <div className="flex items-center justify-center flex-col gap-3 h-[80vh] text-center">
      <Loader2 className="size-14 animate-spin text-neutral-400" />
      <p className="text-neutral-400 text-[1.15rem]">Loading roadmap...</p>
    </div>
  );
}