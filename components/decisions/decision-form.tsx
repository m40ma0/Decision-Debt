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
  const isEditing = Boolean(decision);

  const isValid = useMemo(() => form.title.trim().length >= 2, [form.title]);

  function setField<K extends keyof DecisionFormState>(
    key: K,
    value: DecisionFormState[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = decision
        ? await updateDecisionAction(decision.id, form)
        : await createDecisionAction(form);

      toast({ title: result.message, tone: result.ok ? "success" : "error" });

      if (result.ok) {
        if (!decision && result.data?.id) {
          router.push(`/decisions/${result.data.id}`);
        } else if (decision) {
          router.refresh();
        }
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">
          {isEditing ? "Decision details" : "New decision"}
        </h2>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={submit}>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <Field label="Title" htmlFor="title">
                <Input
                  id="title"
                  required
                  value={form.title}
                  onChange={(event) => setField("title", event.target.value)}
                />
              </Field>
            </div>
            <div className="lg:col-span-2">
              <Field label="Description" htmlFor="description">
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(event) => setField("description", event.target.value)}
                />
              </Field>
            </div>
            <Field label="Category" htmlFor="category">
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
            <Field label="Stakes" htmlFor="stakes">
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
            <Field label="Deadline" htmlFor="deadline">
              <Input
                id="deadline"
                type="date"
                value={form.deadline}
                onChange={(event) => setField("deadline", event.target.value)}
              />
            </Field>
            <Field label="Review date" htmlFor="reviewDate">
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
                  onChange={(event) =>
                    setField(
                      key as keyof DecisionFormState,
                      Number(event.target.value) as never
                    )
                  }
                />
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
            <Field label="Outcome notes" htmlFor="outcomeNotes">
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
              {pending ? "Saving" : "Save"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
