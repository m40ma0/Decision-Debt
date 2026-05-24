"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AppError({
  error,
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-coral">
          Error
        </p>
        <h1 className="mt-3 text-2xl font-semibold">Refresh needed</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-ink/60">
          {error.message || "A page-level error occurred while loading this view."}
        </p>
        <Button type="button" onClick={reset} className="mt-6">
          <RotateCcw className="h-4 w-4" />
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}
