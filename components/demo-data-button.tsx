"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DatabaseZap } from "lucide-react";
import { seedDemoDataAction } from "@/app/actions/demo";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast-provider";

export function DemoDataButton({ hasDemoData = false }: { hasDemoData?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [loaded, setLoaded] = useState(hasDemoData);
  const { toast } = useToast();

  async function loadDemoScenario() {
    setPending(true);
    try {
      const result = await Promise.race([
        seedDemoDataAction(),
        new Promise<{ ok: false; message: string }>((resolve) =>
          window.setTimeout(
            () =>
              resolve({
                ok: false,
                message: "Demo loading is taking too long. Please try again."
              }),
            12_000
          )
        )
      ]);

      if (result.ok) {
        setLoaded(true);
        router.refresh();
      }
      toast({
        title: result.message,
        tone: result.ok ? "success" : "error"
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={pending || loaded}
      onClick={loadDemoScenario}
    >
      <DatabaseZap className="h-4 w-4" />
      {pending
        ? "Loading"
        : loaded
          ? "Demo data already loaded"
          : "Load Demo"}
    </Button>
  );
}
