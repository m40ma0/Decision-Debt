import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-6 text-ink">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-coral">
          Not found
        </p>
        <h1 className="mt-3 text-3xl font-semibold">This decision is not available.</h1>
        <Button asChild href="/dashboard" className="mt-6">
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Button>
      </div>
    </main>
  );
}
