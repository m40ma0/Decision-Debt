import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  Clock3,
  Layers3,
  ListChecks,
  TrendingUp
} from "lucide-react";
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
  const trapEntries = Object.entries(data.trapCounts).sort(([, a], [, b]) => b - a);
  const statusEntries = Object.entries(data.statusCounts).sort(([, a], [, b]) => b - a);
  const trendMax = Math.max(1, ...data.debtTrend.map((item) => item.score));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">
          Analytics
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Analytics</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total debt score"
          value={data.totalDebtScore}
          icon={<ListChecks className="h-5 w-5" />}
          tone="green"
        />
        <StatCard
          label="Open decisions"
          value={data.open.length}
          icon={<Layers3 className="h-5 w-5" />}
        />
        <StatCard
          label="Average resolve time"
          value={pluralize(data.averageResolutionDays, "day")}
          icon={<Clock3 className="h-5 w-5" />}
          tone="amber"
        />
        <StatCard
          label="Highest risk"
          value={
            data.highestRiskCategory
              ? categoryLabels[data.highestRiskCategory.category as keyof typeof categoryLabels]
              : "None"
          }
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="red"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="border-moss/20 bg-mint/35">
          <CardContent>
            <p className="text-sm font-semibold text-moss">Insight</p>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              {data.highestRiskCategory
                ? `${categoryLabels[data.highestRiskCategory.category as keyof typeof categoryLabels]} carries the most debt.`
                : "No risk pattern yet."}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm font-semibold text-ink/65">Top trap</p>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              {data.topTrap
                ? `${data.topTrap[0]} · ${data.topTrap[1]}`
                : "None"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm font-semibold text-ink/65">Status mix</p>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              {statusEntries.length === 0
                ? "No data"
                : statusEntries
                    .map(([status, count]) => `${statusLabels[status as keyof typeof statusLabels]} ${count}`)
                    .join(" · ")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-moss" />
              <h2 className="text-lg font-semibold">Debt Trend</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex h-44 items-end gap-2">
              {data.debtTrend.map((item) => (
                <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t bg-moss"
                    style={{
                      height: `${Math.max(6, (item.score / trendMax) * 150)}px`
                    }}
                    title={`${item.label}: ${item.score}`}
                  />
                  <span className="text-[11px] text-ink/45">{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Categories</h2>
          </CardHeader>
          <CardContent>
            {categoryEntries.length === 0 ? (
              <p className="text-sm text-ink/55">No data.</p>
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
            <h2 className="text-lg font-semibold">Blockers</h2>
          </CardHeader>
          <CardContent>
            {blockerEntries.length === 0 ? (
              <p className="text-sm text-ink/55">No blockers.</p>
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

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Age by Category</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(data.averageAgeByCategory).length === 0 ? (
              <p className="text-sm text-ink/55">No open decisions.</p>
            ) : (
              Object.entries(data.averageAgeByCategory).map(([category, value]) => (
                <div key={category} className="flex items-center justify-between gap-4 rounded-md bg-white p-3">
                  <span className="text-sm font-medium">
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </span>
                  <span className="text-sm text-ink/60">
                    {pluralize(Math.round(value.total / value.count), "day")}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Traps</h2>
          </CardHeader>
          <CardContent>
            {trapEntries.length === 0 ? (
              <p className="text-sm text-ink/55">No traps.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {trapEntries.map(([trap, count]) => (
                  <Badge key={trap} tone={count > 1 ? "amber" : "neutral"}>
                    {trap} · {count}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Outcomes</h2>
        </CardHeader>
        <CardContent>
          {outcomeEntries.length === 0 ? (
            <p className="text-sm text-ink/55">No outcomes.</p>
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
                    {decision.outcome_quality ? (
                      <Badge tone={decision.outcome_quality === "good" ? "green" : decision.outcome_quality === "bad" ? "red" : "amber"}>
                        {decision.outcome_quality}
                      </Badge>
                    ) : null}
                  </div>
                  <h3 className="mt-3 font-semibold">{decision.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink/60">
                    {decision.lesson_learned || decision.outcome_notes || decision.final_decision}
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
