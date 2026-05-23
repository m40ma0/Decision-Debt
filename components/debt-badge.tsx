import { Badge } from "@/components/ui/badge";
import type { DebtLabel } from "@/lib/scoring";

const toneByDebt = {
  Low: "green",
  Medium: "amber",
  High: "berry",
  Critical: "red"
} as const;

export function DebtBadge({ label }: { label: DebtLabel }) {
  return <Badge tone={toneByDebt[label]}>{label}</Badge>;
}
