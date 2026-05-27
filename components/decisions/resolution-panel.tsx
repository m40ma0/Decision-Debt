"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Forward, PauseCircle, Trash2 } from "lucide-react";
import { resolveDecisionAction } from "@/app/actions/decisions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/toast-provider";
import type { DecisionOption } from "@/lib/database.types";
import { cn } from "@/lib/utils";

type ResolutionAction = "committed" | "deferred" | "delegated" | "deleted";

const actions = [
  { value: "committed", label: "Commit", icon: CheckCircle2 },
  { value: "deferred", label: "Defer", icon: PauseCircle },
  { value: "delegated", label: "Delegate", icon: Forward },
  { value: "deleted", label: "Delete", icon: Trash2 }
] as const;

export function ResolutionPanel({
  decisionId,
  options,
  className,
  onResolved
}: {
  decisionId: string;
  options: DecisionOption[];
  className?: string;
  onResolved?: () => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [action, setAction] = useState<ResolutionAction>("committed");
  const [form, setForm] = useState({
    optionId: options[0]?.id ?? "",
    finalDecision: options[0]?.title ?? "",
    reason: "",
    reviewDate: "",
    delegatedTo: "",
    outcomeNotes: ""
  });

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      action === "deleted" &&
      !window.confirm("Mark this decision as deleted? It will move to history.")
    ) {
      return;
    }

    startTransition(async () => {
      const payload =
        action === "committed"
          ? {
              action,
              decisionId,
              optionId: form.optionId || undefined,
              finalDecision: form.finalDecision,
              reason: form.reason,
              outcomeNotes: form.outcomeNotes
            }
          : action === "deferred"
            ? {
                action,
                decisionId,
                reviewDate: form.reviewDate,
                reason: form.reason
              }
            : action === "delegated"
              ? {
                  action,
                  decisionId,
                  delegatedTo: form.delegatedTo,
                  reviewDate: form.reviewDate,
                  reason: form.reason
                }
              : {
                  action,
                  decisionId,
                  reason: form.reason
                };

      const result = await resolveDecisionAction(payload);
      toast({ title: result.message, tone: result.ok ? "success" : "error" });
      if (result.ok) {
        onResolved?.();
        router.refresh();
      }
    });
  }

  return (
    <Card className={className}>
      <CardHeader>
        <h2 className="text-lg font-semibold">Resolve</h2>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={submit}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {actions.map((item) => {
              const Icon = item.icon;
              const active = action === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setAction(item.value)}
                  className={cn(
                    "flex h-16 flex-col items-center justify-center gap-1 rounded-md border text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss/30",
                    active
                      ? "border-ink bg-ink text-white"
                      : "border-ink/10 bg-white text-ink/70 hover:border-moss/30 hover:text-ink"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {action === "committed" ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Option" htmlFor="optionId">
                <Select
                  id="optionId"
                  value={form.optionId}
                  onChange={(event) => {
                    const option = options.find((item) => item.id === event.target.value);
                    update("optionId", event.target.value);
                    if (option) update("finalDecision", option.title);
                  }}
                >
                  <option value="">Custom decision</option>
                  {options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.title}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Decision" htmlFor="finalDecision">
                <Input
                  id="finalDecision"
                  required
                  value={form.finalDecision}
                  onChange={(event) => update("finalDecision", event.target.value)}
                />
              </Field>
              <div className="lg:col-span-2">
                <Field label="Reason" htmlFor="commitReason">
                  <Textarea
                    id="commitReason"
                    required
                    value={form.reason}
                    onChange={(event) => update("reason", event.target.value)}
                  />
                </Field>
              </div>
              <div className="lg:col-span-2">
                <Field label="Outcome" htmlFor="outcomeNotes">
                  <Textarea
                    id="outcomeNotes"
                    value={form.outcomeNotes}
                    onChange={(event) => update("outcomeNotes", event.target.value)}
                  />
                </Field>
              </div>
            </div>
          ) : null}

          {action === "deferred" ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Review date" htmlFor="deferReviewDate">
                <Input
                  id="deferReviewDate"
                  type="date"
                  required
                  value={form.reviewDate}
                  onChange={(event) => update("reviewDate", event.target.value)}
                />
              </Field>
              <Field label="Reason" htmlFor="deferReason">
                <Textarea
                  id="deferReason"
                  required
                  value={form.reason}
                  onChange={(event) => update("reason", event.target.value)}
                />
              </Field>
            </div>
          ) : null}

          {action === "delegated" ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Owner" htmlFor="delegatedTo">
                <Input
                  id="delegatedTo"
                  required
                  value={form.delegatedTo}
                  onChange={(event) => update("delegatedTo", event.target.value)}
                />
              </Field>
              <Field label="Follow-up date" htmlFor="delegateReviewDate">
                <Input
                  id="delegateReviewDate"
                  type="date"
                  value={form.reviewDate}
                  onChange={(event) => update("reviewDate", event.target.value)}
                />
              </Field>
              <div className="lg:col-span-2">
                <Field label="Reason" htmlFor="delegateReason">
                  <Textarea
                    id="delegateReason"
                    required
                    value={form.reason}
                    onChange={(event) => update("reason", event.target.value)}
                  />
                </Field>
              </div>
            </div>
          ) : null}

          {action === "deleted" ? (
            <Field label="Reason" htmlFor="deleteReason">
              <Textarea
                id="deleteReason"
                required
                value={form.reason}
                onChange={(event) => update("reason", event.target.value)}
              />
            </Field>
          ) : null}

          <div className="flex justify-end">
            <Button
              type="submit"
              variant={action === "deleted" ? "danger" : "primary"}
              disabled={pending}
            >
              {pending ? "Saving" : actions.find((item) => item.value === action)?.label}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
