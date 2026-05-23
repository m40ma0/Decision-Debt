import Link from "next/link";
import { BarChart3, Clock3, Layers3, ListChecks } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { categoryLabels, statusLabels } from "@/lib/constants";
import { getAnalyticsData } from "@/lib/queries";
import { pluralize } from "@/lib/utils";

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();
  const blockerEntries = Object.entries(data.blockerCounts).sort(
    ([, a], [, b]) => b - a
  );
  const categoryEntries = Object.entries(data.categoryCounts).sort(
    ([, a], [, b]) => b - a
  );
  const outcomeEntries = data.resolved
    .filter((decision) => decision.outcome_notes || decision.final_decision)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">
          Analytics
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Patterns</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total decisions"
          value={data.decisions.length}
          icon={<ListChecks className="h-5 w-5" />}
          tone="green"
        />
        <StatCard
          label="Resolved"
          value={data.resolved.length}
          icon={<Layers3 className="h-5 w-5" />}
        />
        <StatCard
          label="Average resolve time"
          value={pluralize(data.averageResolutionDays, "day")}
          icon={<Clock3 className="h-5 w-5" />}
          tone="amber"
        />
        <StatCard
          label="Repeated blockers"
          value={blockerEntries.filter(([, count]) => count > 1).length}
          icon={<BarChart3 className="h-5 w-5" />}
          tone="red"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Most common categories</h2>
          </CardHeader>
          <CardContent>
            {categoryEntries.length === 0 ? (
              <p className="text-sm text-ink/55">No category data yet.</p>
            ) : (
              <div className="space-y-3">
                {categoryEntries.map(([category, count]) => (
                  <div key={category} className="flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded bg-ink/10">
                      <div
                        className="h-full rounded bg-moss"
                        style={{
                          width: `${Math.max(12, (count / data.decisions.length) * 100)}%`
                        }}
                      />
                    </div>
                    <span className="w-28 text-sm text-ink/70">
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </span>
                    <span className="text-sm font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Repeated blockers</h2>
          </CardHeader>
          <CardContent>
            {blockerEntries.length === 0 ? (
              <p className="text-sm text-ink/55">No blockers logged yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {blockerEntries.slice(0, 14).map(([blocker, count]) => (
                  <Badge key={blocker} tone={count > 1 ? "amber" : "neutral"}>
                    {blocker} · {count}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Decision outcomes</h2>
        </CardHeader>
        <CardContent>
          {outcomeEntries.length === 0 ? (
            <p className="text-sm text-ink/55">No outcomes recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {outcomeEntries.map((decision) => (
                <Link
                  href={`/decisions/${decision.id}`}
                  key={decision.id}
                  className="block rounded-lg border border-ink/10 bg-white p-4 transition hover:border-moss/30"
                >
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="green">{statusLabels[decision.status]}</Badge>
                    <Badge tone="blue">{categoryLabels[decision.category]}</Badge>
                  </div>
                  <h3 className="mt-3 font-semibold">{decision.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink/60">
                    {decision.outcome_notes || decision.final_decision}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
