import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";

export function EmptyState({
  title,
  body,
  action
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <Card className="grid place-items-center px-6 py-14 text-center">
      <Inbox className="h-10 w-10 text-moss" />
      <h2 className="mt-4 text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-ink/60">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  );
}
