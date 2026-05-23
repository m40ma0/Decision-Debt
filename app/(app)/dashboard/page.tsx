import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  Clock3,
  ListChecks,
  Plus,
  TrendingDown
} from "lucide-react";
import { DemoDataButton } from "@/components/demo-data-button";
import { DebtBadge } from "@/components/debt-badge";
import { EmptyState } from "@/components/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { categoryLabels, statusLabels } from "@/lib/constants";
import { getDashboardData } from "@/lib/queries";
import { formatDate, pluralize } from "@/lib/utils";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            Decision Debt
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <DemoDataButton />
          <Button asChild href="/decisions/new">
            <Plus className="h-4 w-4" />
            New decision
          </Button>
        </div>
      </div>

      {data.decisions.length === 0 ? (
        <EmptyState
          title="No decisions yet"
          body="Start with one unresolved choice or load the judge demo set."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <DemoDataButton />
              <Button asChild href="/decisions/new">
                <Plus className="h-4 w-4" />
                New decision
              </Button>
            </div>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Open decisions"
              value={data.open.length}
              icon={<ListChecks className="h-5 w-5" />}
              tone="green"
            />
            <StatCard
              label="Critical"
              value={data.critical.length}
              icon={<AlertTriangle className="h-5 w-5" />}
              tone="red"
            />
            <StatCard
              label="Due this week"
              value={data.dueThisWeek.length}
              icon={<CalendarDays className="h-5 w-5" />}
              tone="amber"
            />
            <StatCard
              label="Average age"
              value={pluralize(data.averageAge, "day")}
              icon={<Clock3 className="h-5 w-5" />}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Top 3 today</h2>
                  <p className="mt-1 text-sm text-ink/55">
                    Highest active debt score
                  </p>
                </div>
                <Button asChild href="/review" variant="outline" size="sm">
                  <TrendingDown className="h-4 w-4" />
                  Review
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.topToday.length === 0 ? (
                  <p className="text-sm text-ink/55">No open decisions.</p>
                ) : (
                  data.topToday.map((decision, index) => (
                    <Link
                      key={decision.id}
                      href={`/decisions/${decision.id}`}
                      className="block rounded-md border border-ink/10 bg-white p-4 transition hover:border-moss/30 hover:shadow-soft"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="grid h-6 w-6 place-items-center rounded bg-ink text-xs font-semibold text-white">
                              {index + 1}
                            </span>
                            <h3 className="truncate font-semibold">{decision.title}</h3>
                          </div>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/60">
                            {decision.description || decision.next_action}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Badge tone="blue">{categoryLabels[decision.category]}</Badge>
                            <Badge tone="neutral">{formatDate(decision.deadline)}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                          <p className="text-2xl font-semibold">{decision.debt.score}</p>
                          <DebtBadge label={decision.debt.label} />
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold">Category breakdown</h2>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.keys(data.categoryBreakdown).length === 0 ? (
                    <p className="text-sm text-ink/55">No open categories.</p>
                  ) : (
                    Object.entries(data.categoryBreakdown).map(([category, count]) => (
                      <div key={category} className="flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded bg-ink/10">
                          <div
                            className="h-full rounded bg-moss"
                            style={{
                              width: `${Math.max(12, (count / Math.max(1, data.open.length)) * 100)}%`
                            }}
                          />
                        </div>
                        <span className="w-28 text-sm text-ink/70">
                          {categoryLabels[category as keyof typeof categoryLabels]}
                        </span>
                        <span className="text-sm font-semibold">{count}</span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold">Recently resolved</h2>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.recentlyResolved.length === 0 ? (
                    <p className="text-sm text-ink/55">Nothing resolved yet.</p>
                  ) : (
                    data.recentlyResolved.map((decision) => (
                      <Link
                        href={`/decisions/${decision.id}`}
                        key={decision.id}
                        className="flex items-start justify-between gap-3 rounded-md border border-ink/10 bg-white p-3 transition hover:border-moss/30"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{decision.title}</p>
                          <p className="mt-1 text-xs text-ink/55">
                            {formatDate(decision.resolved_at ?? decision.updated_at)}
                          </p>
                        </div>
                        <Badge tone="green">{statusLabels[decision.status]}</Badge>
                      </Link>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
