import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  BookOpen,
  Clock3,
  ListChecks,
  Plus,
  TrendingDown
} from "lucide-react";
import { DemoDataButton } from "@/components/demo-data-button";
import { DebtBadge } from "@/components/debt-badge";
import { EmptyState } from "@/components/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrapTags } from "@/components/trap-tags";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  categoryLabels,
  statusLabels,
  workflowStageLabels
} from "@/lib/constants";
import { getDashboardData } from "@/lib/queries";
import { formatDate, pluralize } from "@/lib/utils";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const hasDemoData =
    data.decisions.filter((decision) => decision.is_demo).length >= 13;
  const topTrap = data.open
    .flatMap((decision) => decision.traps)
    .reduce<Record<string, number>>((acc, trap) => {
      acc[trap.label] = (acc[trap.label] ?? 0) + 1;
      return acc;
    }, {});
  const dominantTrap = Object.entries(topTrap).sort(([, a], [, b]) => b - a)[0];
  const workflowEntries = Object.entries(data.workflowCounts).sort(([, a], [, b]) => b - a);

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
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/60">
            Capture decisions as structured risk, score the debt they create, and
            reduce organizational uncertainty before it compounds.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DemoDataButton hasDemoData={hasDemoData} />
          <Button
            asChild
            href="/api/export?format=csv"
            download="decision-debt-export.csv"
            variant="outline"
            size="sm"
          >
            Export CSV
          </Button>
          <Button
            asChild
            href="/api/export?format=md"
            download="decision-debt-export.md"
            variant="outline"
            size="sm"
          >
            Export Markdown
          </Button>
        </div>
      </div>

      {hasDemoData ? (
        <Card className="border-berry/20 bg-berry/5">
          <CardContent>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-berry">
                  Demo scenario
                </p>
                <p className="mt-2 text-lg font-semibold text-ink">
                  Startup launch blocked by pricing, onboarding, and AI scope decisions.
                </p>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-ink/65">
                The dashboard is seeded to show an unresolved startup launch with
                clear owners, blockers, and one resolved outcome review.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-ink/10 bg-gradient-to-r from-white to-mint/35">
        <CardContent>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">
                Moonshot framing
              </p>
              <h2 className="text-xl font-semibold">
                This is a foresight layer, not another task board.
              </h2>
              <p className="max-w-3xl text-sm leading-6 text-ink/65">
                The prototype converts notes into decisions, scores unresolved
                uncertainty, and preserves outcome learning so teams can see how
                hesitation affects execution.
              </p>
            </div>
            <Button asChild href="/moonshot" variant="outline">
              <BookOpen className="h-4 w-4" />
              Read the paper
            </Button>
          </div>
        </CardContent>
      </Card>

      {data.decisions.length === 0 ? (
        <EmptyState
          title="No decisions yet"
          body="Add one choice or load the demo."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <DemoDataButton hasDemoData={hasDemoData} />
              <Button asChild href="/decisions/new">
                <Plus className="h-4 w-4" />
                New Decision
              </Button>
            </div>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Unresolved decisions"
              value={data.open.length}
              icon={<ListChecks className="h-5 w-5" />}
              tone="green"
            />
            <StatCard
              label="Total debt score"
              value={data.totalUnresolvedDebt}
              icon={<Clock3 className="h-5 w-5" />}
            />
            <StatCard
              label="Debt interest"
              value={data.debtInterest}
              icon={<AlertTriangle className="h-5 w-5" />}
              tone="red"
            />
            <StatCard
              label="Without owners"
              value={data.decisionsWithoutOwners.length}
              icon={<CalendarDays className="h-5 w-5" />}
              tone="amber"
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.7fr)]">
            <Card className="border-moss/20 bg-mint/35">
              <CardContent>
                <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_220px] lg:items-center">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">
                      Cost of Delay
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {pluralize(data.averageAge, "day")} average age
                    </p>
                  </div>
                  <p className="text-sm leading-6 text-ink/70">
                    {dominantTrap
                      ? `Top trap: ${dominantTrap[0].toLowerCase()}. Clear one blocker today.`
                      : "Light load. Keep each decision moving."}
                  </p>
                  <Button asChild href="/review" variant="secondary">
                    <TrendingDown className="h-4 w-4" />
                    Review Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Workflow Snapshot</h2>
              </CardHeader>
              <CardContent className="space-y-2">
                {workflowEntries.length === 0 ? (
                  <p className="text-sm text-ink/55">No workflow data yet.</p>
                ) : (
                  workflowEntries.map(([stage, count]) => (
                    <div key={stage} className="flex items-center justify-between gap-3">
                      <span className="text-sm text-ink/70">
                        {workflowStageLabels[stage as keyof typeof workflowStageLabels]}
                      </span>
                      <Badge tone="neutral">{count}</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Resolve Today</h2>
                </div>
                <Button asChild href="/review" variant="outline" size="sm">
                  <TrendingDown className="h-4 w-4" />
                  Review Now
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.topToday.length === 0 ? (
                  <p className="text-sm text-ink/55">Nothing open.</p>
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
                            <h3 className="min-w-0 break-words font-semibold sm:truncate">
                              {decision.title}
                            </h3>
                          </div>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/60">
                            {decision.description || decision.next_action}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Badge tone="blue">{categoryLabels[decision.category]}</Badge>
                            <Badge tone="neutral">{formatDate(decision.deadline)}</Badge>
                            <Badge tone="green">
                              {workflowStageLabels[decision.workflow_stage]}
                            </Badge>
                          </div>
                          <div className="mt-3">
                            <TrapTags traps={decision.traps} limit={3} compact />
                          </div>
                          <p className="mt-3 text-xs leading-5 text-ink/50">
                            Owner: {decision.owner || "Unassigned"} ·{" "}
                            {decision.blockers.length} blocker
                            {decision.blockers.length === 1 ? "" : "s"} ·{" "}
                            {decision.affected_stakeholders} stakeholders
                          </p>
                          <p className="mt-3 text-xs leading-5 text-ink/50">
                            {decision.costOfWaiting.whatGetsWorse}
                          </p>
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
                  <h2 className="text-lg font-semibold">Impact Breakdown</h2>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-ink/65">Blocking execution</span>
                    <span className="text-sm font-semibold">
                      {data.decisionsBlockingExecution.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-ink/65">Average age</span>
                    <span className="text-sm font-semibold">
                      {pluralize(data.averageAge, "day")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-ink/65">Recently resolved</span>
                    <span className="text-sm font-semibold">
                      {data.recentlyResolved.length}
                    </span>
                  </div>
                  {data.highestRisk ? (
                    <div className="rounded-md border border-ink/10 bg-white p-3">
                      <p className="text-sm font-semibold">{data.highestRisk.title}</p>
                      <p className="mt-1 text-xs text-ink/55">
                        {data.highestRisk.debt.score} debt score ·{" "}
                        {data.highestRisk.debt.explanation[0]}
                      </p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold">Categories</h2>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.keys(data.categoryBreakdown).length === 0 ? (
                    <p className="text-sm text-ink/55">No categories.</p>
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
                  <h2 className="text-lg font-semibold">Resolved</h2>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.recentlyResolved.length === 0 ? (
                    <p className="text-sm text-ink/55">
                      Resolved decisions will appear here after review.
                    </p>
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
