"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";
import { DebtBadge } from "@/components/debt-badge";
import { ResolutionPanel } from "@/components/decisions/resolution-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { categoryLabels } from "@/lib/constants";
import type { DecisionWithScore, OptionWithProsCons } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

type ReviewItem = DecisionWithScore & {
  options: OptionWithProsCons[];
};

export function ReviewClient({ queue }: { queue: ReviewItem[] }) {
  const [index, setIndex] = useState(0);
  const current = queue[index];

  const progress = useMemo(() => {
    if (queue.length === 0) return 100;
    return ((index + 1) / queue.length) * 100;
  }, [index, queue.length]);

  if (!current) {
    return (
      <Card className="grid place-items-center px-6 py-16 text-center">
        <CheckCircle2 className="h-12 w-12 text-moss" />
        <h2 className="mt-4 text-xl font-semibold">Review clear</h2>
        <Button asChild href="/dashboard" className="mt-6">
          Dashboard
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
        <div className="h-2 bg-ink/10">
          <div
            className="h-full bg-moss transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold">
            {index + 1} of {queue.length}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={index === 0}
              onClick={() => setIndex((value) => Math.max(0, value - 1))}
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={index >= queue.length - 1}
              onClick={() =>
                setIndex((value) => Math.min(queue.length - 1, value + 1))
              }
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="blue">{categoryLabels[current.category]}</Badge>
                    <Badge tone="neutral">Deadline {formatDate(current.deadline)}</Badge>
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold tracking-normal">
                    {current.title}
                  </h2>
                  {current.description ? (
                    <p className="mt-3 text-sm leading-6 text-ink/65">
                      {current.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-semibold">{current.debt.score}</span>
                  <DebtBadge label={current.debt.label} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-ink/65">Blockers</p>
                {current.blockers.length === 0 ? (
                  <p className="mt-2 rounded-md bg-ink/5 p-3 text-sm text-ink/45">
                    None
                  </p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {current.blockers.map((blocker) => (
                      <li key={blocker} className="rounded-md bg-red-50 p-3 text-sm text-red-900">
                        {blocker}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-ink/65">Next action</p>
                <p className="mt-2 rounded-md bg-mint/70 p-3 text-sm leading-6 text-ink/70">
                  {current.next_action || "No next action set."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-lg font-semibold">Options</h2>
              <Button asChild href={`/decisions/${current.id}`} variant="outline" size="sm">
                <ExternalLink className="h-4 w-4" />
                Detail
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {current.options.length === 0 ? (
                <p className="rounded-md border border-dashed border-ink/15 p-5 text-center text-sm text-ink/55">
                  No options added.
                </p>
              ) : (
                current.options.map((option) => (
                  <div key={option.id} className="rounded-lg border border-ink/10 bg-white p-4">
                    <h3 className="font-semibold">{option.title}</h3>
                    {option.description ? (
                      <p className="mt-1 text-sm text-ink/60">{option.description}</p>
                    ) : null}
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-moss">
                          Pros
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-ink/60">
                          {option.pros.map((item) => (
                            <li key={item.id}>{item.body}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-coral">
                          Cons
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-ink/60">
                          {option.cons.map((item) => (
                            <li key={item.id}>{item.body}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <ResolutionPanel
          decisionId={current.id}
          options={current.options}
          onResolved={() => setIndex((value) => Math.min(queue.length - 1, value + 1))}
        />
      </div>
    </div>
  );
}
