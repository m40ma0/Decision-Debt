"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Save } from "lucide-react";
import {
  createDecisionAction,
  updateDecisionAction
} from "@/app/actions/decisions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, Input, Label, Select, Textarea } from "@/components/ui/field";
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

const decisionTemplates = [
  {
    id: "work",
    label: "Work",
    patch: {
      title: "Prioritize a work initiative",
      description: "Choose which work commitment deserves focus next.",
      category: "work",
      stakes: "high",
      emotionalLoad: 3,
      timeImpact: 4,
      moneyImpact: 2,
      confidence: 3,
      missingInformation: "Expected effort\nSuccess criteria",
      nextAction: "List the tradeoffs and ask one stakeholder for input."
    }
  },
  {
    id: "school",
    label: "School",
    patch: {
      title: "Choose a school deadline strategy",
      description: "Decide how to handle an assignment, exam, project, or course choice.",
      category: "school",
      stakes: "medium",
      emotionalLoad: 3,
      timeImpact: 4,
      moneyImpact: 1,
      confidence: 3,
      missingInformation: "Deadline requirements\nGrading impact",
      nextAction: "Write the next 15-minute study or planning action."
    }
  },
  {
    id: "money",
    label: "Money",
    patch: {
      title: "Make a money decision",
      description: "Compare the financial upside, downside, and risk of waiting.",
      category: "money",
      stakes: "high",
      emotionalLoad: 4,
      timeImpact: 3,
      moneyImpact: 5,
      confidence: 2,
      missingInformation: "Total cost\nWorst-case downside",
      nextAction: "Find the one number that would make this decision clearer."
    }
  },
  {
    id: "health",
    label: "Health",
    patch: {
      title: "Choose a health next step",
      description: "Decide what support, appointment, or habit change comes next.",
      category: "health",
      stakes: "high",
      emotionalLoad: 4,
      timeImpact: 3,
      moneyImpact: 2,
      confidence: 2,
      missingInformation: "Professional advice\nAvailable appointment times",
      nextAction: "Book or request the smallest next appointment/check-in."
    }
  },
  {
    id: "relationships",
    label: "Relationships",
    patch: {
      title: "Handle a relationship choice",
      description: "Clarify what to say, when to say it, and what outcome is acceptable.",
      category: "relationships",
      stakes: "medium",
      emotionalLoad: 5,
      timeImpact: 2,
      moneyImpact: 1,
      confidence: 2,
      missingInformation: "Desired boundary\nTiming",
      nextAction: "Draft the first sentence of the conversation."
    }
  },
  {
    id: "personal",
    label: "Personal",
    patch: {
      title: "Choose a personal next step",
      description: "Reduce an open personal decision to one small next action.",
      category: "personal",
      stakes: "medium",
      emotionalLoad: 3,
      timeImpact: 3,
      moneyImpact: 1,
      confidence: 3,
      missingInformation: "What matters most\nReversible option",
      nextAction: "Pick one reversible option to test this week."
    }
  }
] satisfies Array<{
  id: string;
  label: string;
  patch: Partial<DecisionFormState>;
}>;

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
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "created" | "saved" | "error"
  >("idle");
  const [form, setForm] = useState<DecisionFormState>(() => decisionToState(decision));
  const [templateId, setTemplateId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEditing = Boolean(decision);

  const isValid = useMemo(
    () => form.title.trim().length >= 1 && form.description.trim().length >= 1,
    [form.description, form.title]
  );
  const isBusy = pending || submitState === "submitting" || submitState === "created";

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

  function applyTemplate(id: string) {
    setTemplateId(id);
    const template = decisionTemplates.find((item) => item.id === id);
    if (!template) return;

    setForm((current) => ({
      ...current,
      ...template.patch,
      title: current.title.trim() ? current.title : template.patch.title ?? current.title,
      description: current.description.trim()
        ? current.description
        : template.patch.description ?? current.description
    }));
    setErrors({});
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

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isBusy) return;

    if (!validateClient()) {
      setSubmitState("error");
      toast({ title: "Check the highlighted fields.", tone: "error" });
      return;
    }

    setSubmitState("submitting");
    const result = decision
      ? await updateDecisionAction(decision.id, form)
      : await createDecisionAction(form);

    if (result.ok) {
      if (!decision && result.data?.id) {
        setSubmitState("created");
        toast({ title: "Decision created.", tone: "success" });
        router.push(`/decisions/${result.data.id}`);
        return;
      }

      setSubmitState("saved");
      toast({ title: result.message, tone: "success" });
      startTransition(() => {
        if (decision) {
          router.refresh();
        }
      });
      window.setTimeout(() => setSubmitState("idle"), 1800);
      return;
    }

    setSubmitState("error");
    toast({ title: result.message, tone: "error" });
    if (result.errors) {
      setErrors(
        Object.fromEntries(
          Object.entries(result.errors).map(([key, messages]) => [
            key,
            messages[0] ?? "Check this field."
          ])
        )
      );
    }
  }

  const submitCopy = isEditing
    ? submitState === "submitting"
      ? "Saving changes..."
      : submitState === "saved"
        ? "Changes saved"
        : "Save Changes"
    : submitState === "submitting"
      ? "Creating decision..."
      : submitState === "created"
        ? "Decision created"
        : "Create Decision";

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">
          {isEditing ? "Edit Decision" : "New Decision"}
        </h2>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={submit}>
          <p className="sr-only" aria-live="polite">
            {submitState === "submitting"
              ? isEditing
                ? "Saving changes."
                : "Creating decision."
              : submitState === "created"
                ? "Decision created. Opening detail page."
                : submitState === "saved"
                  ? "Changes saved."
                  : ""}
          </p>
          {!isEditing ? (
            <Field label="Template" htmlFor="decisionTemplate" hint="Optional shortcut">
              <Select
                id="decisionTemplate"
                value={templateId}
                onChange={(event) => applyTemplate(event.target.value)}
              >
                <option value="">Start from a common decision</option>
                {decisionTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.label}
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}

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
            <ScaleControl
              id="emotionalLoad"
              label="Emotional load"
              value={form.emotionalLoad}
              helper="How much headspace this is using."
              error={errors.emotionalLoad}
              onChange={(value) => setField("emotionalLoad", value)}
            />
            <ScaleControl
              id="timeImpact"
              label="Time impact"
              value={form.timeImpact}
              helper="How much time waiting is costing."
              error={errors.timeImpact}
              onChange={(value) => setField("timeImpact", value)}
            />
            <ScaleControl
              id="moneyImpact"
              label="Money impact"
              value={form.moneyImpact}
              helper="How much money is at stake."
              error={errors.moneyImpact}
              onChange={(value) => setField("moneyImpact", value)}
            />
            <ScaleControl
              id="confidence"
              label="Confidence"
              value={form.confidence}
              helper="How ready you feel to choose."
              lowLabel="unclear"
              highLabel="clear"
              error={errors.confidence}
              onChange={(value) => setField("confidence", value)}
            />
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
            <Button type="submit" disabled={isBusy || !isValid}>
              {submitState === "submitting" || pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : submitState === "created" || submitState === "saved" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {submitCopy}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ScaleControl({
  id,
  label,
  value,
  helper,
  lowLabel = "low",
  highLabel = "high",
  error,
  onChange
}: {
  id: string;
  label: string;
  value: number;
  helper: string;
  lowLabel?: string;
  highLabel?: string;
  error?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        <span className="rounded-full bg-mint px-2.5 py-1 text-xs font-semibold text-moss">
          {value}/5
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
        aria-valuetext={`${value} out of 5`}
        className="mt-4 w-full accent-moss focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss/30"
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="mt-1 flex justify-between text-[11px] uppercase tracking-[0.12em] text-ink/45">
        <span>1 {lowLabel}</span>
        <span>5 {highLabel}</span>
      </div>
      <p id={`${id}-hint`} className="mt-2 text-xs leading-5 text-ink/55">
        {helper}
      </p>
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-xs font-medium text-coral">
          {error}
        </p>
      ) : null}
    </div>
  );
}
