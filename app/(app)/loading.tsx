import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function AppLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded bg-ink/10" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="h-28 animate-pulse bg-white/65" />
        ))}
      </div>
      <Card className="grid h-72 place-items-center">
        <Loader2 className="h-7 w-7 animate-spin text-moss" />
      </Card>
    </div>
  );
}
