import { Badge } from "@/components/ui/badge";
import type { TrapTag } from "@/lib/decision-intelligence";

const toneBySeverity = {
  low: "neutral",
  medium: "amber",
  high: "red"
} as const;

export function TrapTags({
  traps,
  limit,
  compact = false
}: {
  traps: TrapTag[];
  limit?: number;
  compact?: boolean;
}) {
  const visible = typeof limit === "number" ? traps.slice(0, limit) : traps;
  if (visible.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((trap) => (
        <Badge
          key={trap.id}
          tone={toneBySeverity[trap.severity]}
          className={compact ? "h-5 text-[11px]" : undefined}
        >
          {trap.label}
        </Badge>
      ))}
      {limit && traps.length > limit ? (
        <Badge tone="neutral" className={compact ? "h-5 text-[11px]" : undefined}>
          +{traps.length - limit}
        </Badge>
      ) : null}
    </div>
  );
}
