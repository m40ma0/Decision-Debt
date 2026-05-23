"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DatabaseZap } from "lucide-react";
import { seedDemoDataAction } from "@/app/actions/demo";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast-provider";

export function DemoDataButton({ hasDemoData = false }: { hasDemoData?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [loaded, setLoaded] = useState(hasDemoData);
  const { toast } = useToast();

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={pending || loaded}
      onClick={() => {
        startTransition(async () => {
          const result = await seedDemoDataAction();
          if (result.ok) {
            setLoaded(true);
            router.refresh();
          }
          toast({
            title: result.message,
            tone: result.ok ? "success" : "error"
          });
        });
      }}
    >
      <DatabaseZap className="h-4 w-4" />
      {pending ? "Loading" : loaded ? "Demo data loaded" : "Load demo data"}
    </Button>
  );
}
