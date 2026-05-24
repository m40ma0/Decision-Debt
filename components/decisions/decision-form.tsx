"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import {
  createDecisionAction,
  updateDecisionAction
} from "@/app/actions/decisions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/toast-provider";
import {
  categoryLabels,
  decisionCategories,
  decisionStakes,
  stakesLabels
} from "@/lib/constants";
import type { Decision } from "@/lib/database.types";

type DecisionFormState = {
  title: string;
  description: string;
  category: string;
  deadline: string;
  reviewDate: string;
  stakes: string;
  emotionalLoad: number;
  timeImpact: number;
  moneyImpact: number;
  confidence: number;
  blockers: string;
  missingInformation: string;
  nextAction: string;
  outcomeNotes: string;
};

function decisionToState(decision?: Decision): DecisionFormState {
  return {
    title: decision?.title ?? "",
    description: decision?.description ?? "",
    category: decision?.category ?? "work",
    deadline: decision?.deadline ?? "",
    reviewDate: decision?.review_date ?? "",
    stakes: decision?.stakes ?? "medium",
    emotionalLoad: decision?.emotional_load ?? 3,
    timeImpact: decision?.time_impact ?? 3,
    moneyImpact: decision?.money_impact ?? 1,
    confidence: decision?.confidence ?? 3,
    blockers: decision?.blockers.join("\n") ?? "",
    missingInformation: decision?.missing_information.join("\n") ?? "",
    nextAction: decision?.next_action ?? "",
    outcomeNotes: decision?.outcome_notes ?? ""
  };
}

export function DecisionForm({ decision }: { decision?: Decision }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<DecisionFormState>(() => decisionToState(decision));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEditing = Boolean(decision);

  const isValid = useMemo(
    () => form.title.trim().length >= 1 && form.description.trim().length >= 1,
    [form.description, form.title]
  );

  function setField<K extends keyof DecisionFormState>(
    key: K,
    value: DecisionFormState[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function validateClient() {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = "Title is required.";
    if (!form.description.trim()) next.description = "Description is required.";
    for (const key of [
      "emotionalLoad",
      "timeImpact",
      "moneyImpact",
      "confidence"
    ] as const) {
      const value = Number(form[key]);
      if (!Number.isInteger(value) || value < 1 || value > 5) {
        next[key] = "Use a value from 1 to 5.";
      }
    }
    if (form.deadline && Number.isNaN(Date.parse(form.deadline))) {
      next.deadline = "Use a valid deadline.";
    }
    if (form.reviewDate && Number.isNaN(Date.parse(form.reviewDate))) {
      next.reviewDate = "Use a valid review date.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateClient()) {
      toast({ title: "Check the highlighted fields.", tone: "error" });
      return;
    }
    startTransition(async () => {
      const result = decision
        ? await updateDecisionAction(decision.id, form)
        : await createDecisionAction(form);

      toast({ title: result.message, tone: result.ok ? "success" : "error" });

      if (result.ok) {
        if (!decision && result.data?.id) {
          const target = `/decisions/${result.data.id}`;
          window.location.assign(target);
        } else if (decision) {
          router.refresh();
        }
      } else if (result.errors) {
        setErrors(
          Object.fromEntries(
            Object.entries(result.errors).map(([key, messages]) => [
              key,
              messages[0] ?? "Check this field."
            ])
          )
        );
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">
          {isEditing ? "Edit Decision" : "New Decision"}
        </h2>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={submit}>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <Field label="Title" htmlFor="title" error={errors.title}>
                <Input
                  id="title"
                  required
                  aria-invalid={Boolean(errors.title)}
                  value={form.title}
                  onChange={(event) => setField("title", event.target.value)}
                />
              </Field>
            </div>
            <div className="lg:col-span-2">
              <Field label="Description" htmlFor="description" error={errors.description}>
                <Textarea
                  id="description"
                  required
                  aria-invalid={Boolean(errors.description)}
                  value={form.description}
                  onChange={(event) => setField("description", event.target.value)}
                />
              </Field>
            </div>
            <Field label="Category" htmlFor="category" error={errors.category}>
              <Select
                id="category"
                value={form.category}
                onChange={(event) => setField("category", event.target.value)}
              >
                {decisionCategories.map((category) => (
                  <option key={category} value={category}>
                    {categoryLabels[category]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Stakes" htmlFor="stakes" error={errors.stakes}>
              <Select
                id="stakes"
                value={form.stakes}
                onChange={(event) => setField("stakes", event.target.value)}
              >
                {decisionStakes.map((stakes) => (
                  <option key={stakes} value={stakes}>
                    {stakesLabels[stakes]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Deadline"
              htmlFor="deadline"
              hint="Optional"
              error={errors.deadline}
            >
              <Input
                id="deadline"
                type="date"
                value={form.deadline}
                onChange={(event) => setField("deadline", event.target.value)}
              />
            </Field>
            <Field label="Review date" htmlFor="reviewDate" error={errors.reviewDate}>
              <Input
                id="reviewDate"
                type="date"
                value={form.reviewDate}
                onChange={(event) => setField("reviewDate", event.target.value)}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["emotionalLoad", "Emotional load"],
              ["timeImpact", "Time impact"],
              ["moneyImpact", "Money impact"],
              ["confidence", "Confidence"]
            ].map(([key, label]) => (
              <Field key={key} label={label} htmlFor={key}>
                <Input
                  id={key}
                  type="number"
                  min={1}
                  max={5}
                  value={form[key as keyof DecisionFormState] as number}
                  aria-invalid={Boolean(errors[key])}
                  onChange={(event) =>
                    setField(
                      key as keyof DecisionFormState,
                      Number(event.target.value) as never
                    )
                  }
                />
                {errors[key] ? (
                  <p className="text-xs font-medium text-coral">{errors[key]}</p>
                ) : null}
              </Field>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Blockers" htmlFor="blockers" hint="One per line">
              <Textarea
                id="blockers"
                value={form.blockers}
                onChange={(event) => setField("blockers", event.target.value)}
              />
            </Field>
            <Field
              label="Missing information"
              htmlFor="missingInformation"
              hint="One per line"
            >
              <Textarea
                id="missingInformation"
                value={form.missingInformation}
                onChange={(event) =>
                  setField("missingInformation", event.target.value)
                }
              />
            </Field>
            <Field label="Next action" htmlFor="nextAction">
              <Textarea
                id="nextAction"
                value={form.nextAction}
                onChange={(event) => setField("nextAction", event.target.value)}
              />
            </Field>
            <Field label="Outcome" htmlFor="outcomeNotes">
              <Textarea
                id="outcomeNotes"
                value={form.outcomeNotes}
                onChange={(event) => setField("outcomeNotes", event.target.value)}
              />
            </Field>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={pending || !isValid}>
              <Save className="h-4 w-4" />
              {pending ? "Saving" : isEditing ? "Save Changes" : "Create Decision"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
