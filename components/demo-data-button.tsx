"use client";

import { useTransition } from "react";
import { DatabaseZap } from "lucide-react";
import { seedDemoDataAction } from "@/app/actions/demo";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast-provider";

export function DemoDataButton() {
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await seedDemoDataAction();
          toast({
            title: result.message,
            tone: result.ok ? "success" : "error"
          });
        });
      }}
    >
      <DatabaseZap className="h-4 w-4" />
      {pending ? "Loading" : "Load demo data"}
    </Button>
  );
}
