import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "green" | "amber" | "red" | "blue" | "berry";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-ink/6 text-ink ring-ink/10",
  green: "bg-mint text-moss ring-moss/15",
  amber: "bg-amber-100 text-amber-800 ring-amber-200",
  red: "bg-red-100 text-red-800 ring-red-200",
  blue: "bg-sky text-sky-900 ring-sky-200",
  berry: "bg-berry/10 text-berry ring-berry/15"
};

export function Badge({
  children,
  tone = "neutral",
  className
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded px-2 text-xs font-semibold ring-1",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
