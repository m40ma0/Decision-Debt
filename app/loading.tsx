import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="grid min-h-screen place-items-center bg-paper text-ink">
      <Loader2 className="h-7 w-7 animate-spin text-moss" aria-label="Loading" />
    </div>
  );
}
