import Link from "next/link";
import { Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { categoryLabels, statusLabels } from "@/lib/constants";
import { getAnalyticsData } from "@/lib/queries";
import { daysBetween, formatDate, formatDateTime, pluralize } from "@/lib/utils";

export default async function HistoryPage() {
  const { resolved } = await getAnalyticsData();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">
          History
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">History</h1>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Resolved</h2>
        </CardHeader>
        <CardContent>
          {resolved.length === 0 ? (
            <p className="text-sm text-ink/55">No resolved decisions.</p>
          ) : (
            <div className="space-y-3">
              {resolved.map((decision) => {
                const days =
                  decision.resolved_at === null
                    ? null
                    : Math.max(
                        0,
                        daysBetween(
                          new Date(decision.created_at),
                          new Date(decision.resolved_at)
                        )
                      );

                return (
                  <Link
                    key={decision.id}
                    href={`/decisions/${decision.id}`}
                    className="block rounded-lg border border-ink/10 bg-white p-4 transition hover:border-moss/30 hover:shadow-soft"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2">
                          <Badge tone="green">{statusLabels[decision.status]}</Badge>
                          <Badge tone="blue">{categoryLabels[decision.category]}</Badge>
                        </div>
                        <h2 className="mt-3 font-semibold">{decision.title}</h2>
                        {decision.final_decision || decision.resolution_reason ? (
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/60">
                            {decision.final_decision || decision.resolution_reason}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-col gap-2 text-sm text-ink/55 lg:items-end">
                        <span>{formatDateTime(decision.resolved_at ?? decision.updated_at)}</span>
                        {days !== null ? (
                          <span className="inline-flex items-center gap-2">
                            <Clock3 className="h-4 w-4" />
                            {pluralize(days, "day")}
                          </span>
                        ) : (
                          <span>Review {formatDate(decision.review_date)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
