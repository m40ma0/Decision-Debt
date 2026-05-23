import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  icon,
  tone = "neutral"
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  tone?: "neutral" | "red" | "amber" | "green";
}) {
  const toneClass = {
    neutral: "bg-sky text-sky-900",
    red: "bg-red-100 text-red-800",
    amber: "bg-amber-100 text-amber-800",
    green: "bg-mint text-moss"
  }[tone];

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ink/55">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-normal">{value}</p>
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-md ${toneClass}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
