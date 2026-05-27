"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Brain,
  Check,
  Circle,
  Lightbulb,
  Info,
  Minus,
  Pencil,
  Plus,
  Save,
  Trash2
} from "lucide-react";
import {
  addOptionAction,
  addProConAction,
  deleteOptionAction,
  deleteProConAction,
  updateGoodEnoughAction,
  updateDecisionDetailAction,
  updateOutcomeLearningAction,
  updateOptionAction
} from "@/app/actions/decisions";
import { DebtBadge } from "@/components/debt-badge";
import { DecisionForm } from "@/components/decisions/decision-form";
import { ResolutionPanel } from "@/components/decisions/resolution-panel";
import { TrapTags } from "@/components/trap-tags";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/toast-provider";
import { categoryLabels, stakesLabels, statusLabels } from "@/lib/constants";
import type { DecisionDetail, OptionWithProsCons } from "@/lib/queries";
import { cn, formatDate, formatDateTime } from "@/lib/utils";

type DetailTab = "overview" | "options" | "unblock" | "resolve" | "edit" | "history";

export function DecisionDetailClient({ detail }: { detail: DecisionDetail }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [newOption, setNewOption] = useState({ title: "", description: "" });
  const [notes, setNotes] = useState({
    missingInformation: detail.decision.missing_information.join("\n"),
    nextAction: detail.decision.next_action,
    outcomeNotes: detail.decision.outcome_notes
  });
  const [goodEnough, setGoodEnough] = useState({
    minimumInformation: detail.decision.minimum_information ?? "",
    reversibleOption: detail.decision.reversible_option ?? "",
    doNothingCost: detail.decision.do_nothing_cost ?? "",
    fifteenMinuteAction: detail.decision.fifteen_minute_action ?? ""
  });
  const [outcome, setOutcome] = useState({
    outcomeQuality: detail.decision.outcome_quality ?? "",
    confidenceAfter: detail.decision.confidence_after?.toString() ?? "",
    lessonLearned: detail.decision.lesson_learned ?? "",
    outcomeNotes: detail.decision.outcome_notes ?? ""
  });
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const isActionable =
    detail.decision.status === "open" || detail.decision.status === "deferred";
  const isResolved = !isActionable;

  const tabs: Array<{ id: DetailTab; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "options", label: "Options" },
    { id: "unblock", label: "Unblock" },
    { id: "resolve", label: "Resolve" },
    { id: "edit", label: "Edit" },
    { id: "history", label: "History" }
  ];

  const scoreContributors = [
    { label: "Deadline", value: detail.decision.debt.drivers.deadline, max: 25 },
    { label: "Age", value: detail.decision.debt.drivers.age, max: 15 },
    { label: "Stakes", value: detail.decision.debt.drivers.stakes, max: 20 },
    {
      label: "Emotion",
      value: detail.decision.debt.drivers.emotionalLoad,
      max: 25
    },
    { label: "Time", value: detail.decision.debt.drivers.timeImpact, max: 20 },
    { label: "Money", value: detail.decision.debt.drivers.moneyImpact, max: 15 },
    {
      label: "Confidence",
      value: detail.decision.debt.drivers.confidence,
      max: 25
    },
    { label: "Blockers", value: detail.decision.debt.drivers.blockers, max: 12 }
  ];

  function saveNotes(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await updateDecisionDetailAction(detail.decision.id, notes);
      toast({ title: result.message, tone: result.ok ? "success" : "error" });
      if (result.ok) router.refresh();
    });
  }

  function addOption(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await addOptionAction(detail.decision.id, newOption);
      toast({ title: result.message, tone: result.ok ? "success" : "error" });
      if (result.ok) {
        setNewOption({ title: "", description: "" });
        router.refresh();
      }
    });
  }

  function saveGoodEnough(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await updateGoodEnoughAction(detail.decision.id, goodEnough);
      toast({ title: result.message, tone: result.ok ? "success" : "error" });
      if (result.ok) router.refresh();
    });
  }

  function saveOutcome(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await updateOutcomeLearningAction(detail.decision.id, {
        ...outcome,
        outcomeQuality: outcome.outcomeQuality || null,
        confidenceAfter: outcome.confidenceAfter || null
      });
      toast({ title: result.message, tone: result.ok ? "success" : "error" });
      if (result.ok) router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardContent>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <Badge tone="blue">{categoryLabels[detail.decision.category]}</Badge>
                <Badge tone="neutral">{statusLabels[detail.decision.status]}</Badge>
                <Badge tone="amber">{stakesLabels[detail.decision.stakes]} stakes</Badge>
              </div>
              <h1 className="mt-4 text-2xl font-semibold tracking-normal sm:text-3xl">
                {detail.decision.title}
              </h1>
              {detail.decision.description ? (
                <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/65">
                  {detail.decision.description}
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2 text-sm text-ink/55">
                <span>Deadline: {formatDate(detail.decision.deadline)}</span>
                <span>Updated: {formatDateTime(detail.decision.updated_at)}</span>
              </div>
              <div className="mt-4">
                <TrapTags traps={detail.decision.traps} />
              </div>
            </div>
            <div className="rounded-lg border border-ink/10 bg-white p-4 lg:w-72">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-ink/60">Debt score</p>
                <DebtBadge label={detail.decision.debt.label} />
              </div>
              <p className="mt-3 text-4xl font-semibold">
                {detail.decision.debt.score}
              </p>
              <p className="mt-2 text-sm leading-6 text-ink/60">
                {detail.decision.costOfWaiting.nextAction}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div
        className="flex gap-2 overflow-x-auto rounded-lg border border-ink/10 bg-white p-1"
        role="tablist"
        aria-label="Decision sections"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={cn(
              "h-10 shrink-0 rounded-md px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss/30",
              activeTab === tab.id
                ? "bg-ink text-white"
                : "text-ink/60 hover:bg-ink/5 hover:text-ink"
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {activeTab === "overview" ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Why this score?</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                {scoreContributors.map((item) => (
                  <div key={item.label} className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)_48px] sm:items-center">
                    <span className="text-sm font-medium text-ink/65">{item.label}</span>
                    <div className="h-2 overflow-hidden rounded-full bg-ink/10">
                      <div
                        className="h-full rounded-full bg-moss"
                        style={{
                          width: `${Math.max(
                            item.value === 0 ? 0 : 4,
                            Math.min(100, Math.round((item.value / item.max) * 100))
                          )}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-ink/70">
                      {item.value}
                    </span>
                  </div>
                ))}
                <ul className="space-y-2 border-t border-ink/10 pt-4 text-sm text-ink/65">
                  {detail.decision.debt.explanation.map((item) => (
                    <li key={item} className="flex gap-2">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-moss" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-moss/20 bg-mint/40">
              <CardHeader>
                <h2 className="text-lg font-semibold">Cost of Waiting</h2>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-6 text-ink/70">
                <p>
                  <span className="font-semibold text-ink">Why:</span>{" "}
                  {detail.decision.costOfWaiting.why}
                </p>
                <p>
                  <span className="font-semibold text-ink">Risk:</span>{" "}
                  {detail.decision.costOfWaiting.whatGetsWorse}
                </p>
                <p className="rounded-md bg-white/70 p-3">
                  <span className="font-semibold text-ink">Do today:</span>{" "}
                  {detail.decision.costOfWaiting.nextAction}
                </p>
              </CardContent>
            </Card>

            <Card className="xl:col-span-2">
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
                      Next action
                    </p>
                    <p className="mt-2 text-sm leading-6 text-ink/70">
                      {detail.decision.fifteen_minute_action ||
                        detail.decision.next_action ||
                        "Add a 15-minute action in Unblock."}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
                      Blockers
                    </p>
                    <p className="mt-2 text-sm leading-6 text-ink/70">
                      {detail.decision.blockers.length > 0
                        ? detail.decision.blockers.join(", ")
                        : "No blockers logged."}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
                      Missing info
                    </p>
                    <p className="mt-2 text-sm leading-6 text-ink/70">
                      {detail.decision.missing_information.length > 0
                        ? detail.decision.missing_information.join(", ")
                        : "Nothing listed yet."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {activeTab === "options" ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">Options</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <form className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]" onSubmit={addOption}>
                <Input
                  required
                  aria-label="Option title"
                  value={newOption.title}
                  onChange={(event) =>
                    setNewOption((current) => ({
                      ...current,
                      title: event.target.value
                    }))
                  }
                  placeholder="Option title"
                />
                <Input
                  aria-label="Option description"
                  value={newOption.description}
                  onChange={(event) =>
                    setNewOption((current) => ({
                      ...current,
                      description: event.target.value
                    }))
                  }
                  placeholder="Description"
                />
                <Button type="submit" disabled={pending}>
                  <Plus className="h-4 w-4" />
                  Add Option
                </Button>
              </form>

              {detail.options.length === 0 ? (
                <div className="rounded-md border border-dashed border-ink/15 p-6 text-center text-sm text-ink/55">
                  Add two or three realistic choices, then compare pros and cons.
                </div>
              ) : (
                <div className="space-y-4">
                  {detail.options.map((option) => (
                    <OptionCard key={option.id} option={option} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        {activeTab === "unblock" ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-md bg-sky text-sky-900">
                    <Brain className="h-4 w-4" />
                  </span>
                  <h2 className="text-lg font-semibold">Unblock This Decision</h2>
                </div>
              </CardHeader>
              <CardContent>
                <form className="grid gap-4 lg:grid-cols-2" onSubmit={saveGoodEnough}>
                  <Field label="Missing fact" htmlFor="minimumInformation">
                    <Textarea
                      id="minimumInformation"
                      value={goodEnough.minimumInformation}
                      onChange={(event) =>
                        setGoodEnough((current) => ({
                          ...current,
                          minimumInformation: event.target.value
                        }))
                      }
                    />
                  </Field>
                  <Field label="Reversible option" htmlFor="reversibleOption">
                    <Textarea
                      id="reversibleOption"
                      value={goodEnough.reversibleOption}
                      onChange={(event) =>
                        setGoodEnough((current) => ({
                          ...current,
                          reversibleOption: event.target.value
                        }))
                      }
                    />
                  </Field>
                  <Field label="If you do nothing" htmlFor="doNothingCost">
                    <Textarea
                      id="doNothingCost"
                      value={goodEnough.doNothingCost}
                      onChange={(event) =>
                        setGoodEnough((current) => ({
                          ...current,
                          doNothingCost: event.target.value
                        }))
                      }
                    />
                  </Field>
                  <Field label="15-minute next action" htmlFor="fifteenMinuteAction">
                    <Textarea
                      id="fifteenMinuteAction"
                      value={goodEnough.fifteenMinuteAction}
                      onChange={(event) =>
                        setGoodEnough((current) => ({
                          ...current,
                          fifteenMinuteAction: event.target.value
                        }))
                      }
                    />
                  </Field>
                  <div className="flex justify-end lg:col-span-2">
                    <Button type="submit" disabled={pending}>
                      <Lightbulb className="h-4 w-4" />
                      Save Unblock Plan
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Notes</h2>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={saveNotes}>
                  <Field
                    label="Missing information"
                    htmlFor="missingInformation"
                    hint="One per line"
                  >
                    <Textarea
                      id="missingInformation"
                      value={notes.missingInformation}
                      onChange={(event) =>
                        setNotes((current) => ({
                          ...current,
                          missingInformation: event.target.value
                        }))
                      }
                    />
                  </Field>
                  <Field label="Smallest next action" htmlFor="nextAction">
                    <Textarea
                      id="nextAction"
                      value={notes.nextAction}
                      onChange={(event) =>
                        setNotes((current) => ({
                          ...current,
                          nextAction: event.target.value
                        }))
                      }
                    />
                  </Field>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={pending}>
                      <Save className="h-4 w-4" />
                      Save Notes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {activeTab === "resolve" ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            {isActionable ? (
              <ResolutionPanel
                decisionId={detail.decision.id}
                options={detail.options}
              />
            ) : (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold">Resolution</h2>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-ink/65">
                  {detail.decision.final_decision ? (
                    <p>
                      <span className="font-semibold text-ink">Decision:</span>{" "}
                      {detail.decision.final_decision}
                    </p>
                  ) : null}
                  {detail.decision.delegated_to ? (
                    <p>
                      <span className="font-semibold text-ink">Owner:</span>{" "}
                      {detail.decision.delegated_to}
                    </p>
                  ) : null}
                  {detail.decision.resolution_reason ? (
                    <p>
                      <span className="font-semibold text-ink">Reason:</span>{" "}
                      {detail.decision.resolution_reason}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            )}

            <Card className="border-moss/20 bg-mint/35">
              <CardHeader>
                <h2 className="text-lg font-semibold">Before You Choose</h2>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-ink/70">
                <p>{detail.decision.costOfWaiting.why}</p>
                <p>
                  <span className="font-semibold text-ink">Smallest action:</span>{" "}
                  {detail.decision.fifteen_minute_action ||
                    detail.decision.next_action ||
                    detail.decision.costOfWaiting.nextAction}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {activeTab === "edit" ? <DecisionForm decision={detail.decision} /> : null}

        {activeTab === "history" ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">History</h2>
              </CardHeader>
              <CardContent>
                {detail.events.length === 0 ? (
                  <p className="text-sm text-ink/55">
                    History will appear after edits, options, and resolution actions.
                  </p>
                ) : (
                  <ol className="space-y-4">
                    {detail.events.map((event) => (
                      <li key={event.id} className="flex gap-3">
                        <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-mint text-moss">
                          <Circle className="h-2.5 w-2.5 fill-current" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{event.title}</p>
                          {event.body ? (
                            <p className="mt-1 text-sm leading-6 text-ink/60">
                              {event.body}
                            </p>
                          ) : null}
                          <p className="mt-1 text-xs text-ink/45">
                            {formatDateTime(event.created_at)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>

            {isResolved ? (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold">Outcome Learning</h2>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={saveOutcome}>
                    <Field label="Quality" htmlFor="outcomeQuality">
                      <Select
                        id="outcomeQuality"
                        value={outcome.outcomeQuality}
                        onChange={(event) =>
                          setOutcome((current) => ({
                            ...current,
                            outcomeQuality: event.target.value
                          }))
                        }
                      >
                        <option value="">Not rated</option>
                        <option value="good">Good</option>
                        <option value="okay">Okay</option>
                        <option value="bad">Bad</option>
                      </Select>
                    </Field>
                    <Field label="Confidence after" htmlFor="confidenceAfter">
                      <Input
                        id="confidenceAfter"
                        type="number"
                        min={1}
                        max={5}
                        value={outcome.confidenceAfter}
                        onChange={(event) =>
                          setOutcome((current) => ({
                            ...current,
                            confidenceAfter: event.target.value
                          }))
                        }
                      />
                    </Field>
                    <Field label="Lesson" htmlFor="lessonLearned">
                      <Textarea
                        id="lessonLearned"
                        value={outcome.lessonLearned}
                        onChange={(event) =>
                          setOutcome((current) => ({
                            ...current,
                            lessonLearned: event.target.value
                          }))
                        }
                      />
                    </Field>
                    <Field label="Notes" htmlFor="outcomeLearningNotes">
                      <Textarea
                        id="outcomeLearningNotes"
                        value={outcome.outcomeNotes}
                        onChange={(event) =>
                          setOutcome((current) => ({
                            ...current,
                            outcomeNotes: event.target.value
                          }))
                        }
                      />
                    </Field>
                    <div className="flex justify-end">
                      <Button type="submit" disabled={pending}>
                        <Save className="h-4 w-4" />
                        Save Outcome
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function OptionCard({ option }: { option: OptionWithProsCons }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    title: option.title,
    description: option.description
  });
  const [newItem, setNewItem] = useState({ kind: "pro" as "pro" | "con", body: "" });

  function updateOption(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await updateOptionAction(option.id, option.decision_id, draft);
      toast({ title: result.message, tone: result.ok ? "success" : "error" });
      if (result.ok) {
        setEditing(false);
        router.refresh();
      }
    });
  }

  function removeOption() {
    if (
      !window.confirm(
        "Delete this option and its pros/cons?"
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteOptionAction(option.id, option.decision_id);
      toast({ title: result.message, tone: result.ok ? "success" : "error" });
      if (result.ok) router.refresh();
    });
  }

  function addItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await addProConAction({
        optionId: option.id,
        decisionId: option.decision_id,
        kind: newItem.kind,
        body: newItem.body
      });
      toast({ title: result.message, tone: result.ok ? "success" : "error" });
      if (result.ok) {
        setNewItem((current) => ({ ...current, body: "" }));
        router.refresh();
      }
    });
  }

  function removeItem(id: string) {
    if (!window.confirm("Delete this pro/con?")) return;

    startTransition(async () => {
      const result = await deleteProConAction(id, option.decision_id);
      toast({ title: result.message, tone: result.ok ? "success" : "error" });
      if (result.ok) router.refresh();
    });
  }

  return (
    <div className="rounded-lg border border-ink/10 bg-white p-4">
      {editing ? (
        <form className="space-y-3" onSubmit={updateOption}>
          <Input
            required
            aria-label="Option title"
            value={draft.title}
            onChange={(event) =>
              setDraft((current) => ({ ...current, title: event.target.value }))
            }
          />
          <Textarea
            aria-label="Option description"
            value={draft.description}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                description: event.target.value
              }))
            }
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              <Check className="h-4 w-4" />
              Save
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">{option.title}</h3>
              {option.is_selected ? <Badge tone="green">Selected</Badge> : null}
            </div>
            {option.description ? (
              <p className="mt-1 text-sm leading-6 text-ink/60">{option.description}</p>
            ) : null}
          </div>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Edit option"
              title="Edit"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Delete"
              title="Delete"
              disabled={pending}
              onClick={removeOption}
            >
              <Trash2 className="h-4 w-4 text-coral" />
              Delete
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <ProConList label="Pros" items={option.pros} removeItem={removeItem} />
        <ProConList label="Cons" items={option.cons} removeItem={removeItem} />
      </div>

      <form className="mt-4 grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)_auto]" onSubmit={addItem}>
        <Select
          aria-label="Pro or con"
          value={newItem.kind}
          onChange={(event) =>
            setNewItem((current) => ({
              ...current,
              kind: event.target.value as "pro" | "con"
            }))
          }
        >
          <option value="pro">Pro</option>
          <option value="con">Con</option>
        </Select>
        <Input
          required
          value={newItem.body}
          onChange={(event) =>
            setNewItem((current) => ({ ...current, body: event.target.value }))
          }
          placeholder="Add pro or con"
        />
        <Button type="submit" disabled={pending}>
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </form>
    </div>
  );
}

function ProConList({
  label,
  items,
  removeItem
}: {
  label: string;
  items: OptionWithProsCons["pros"];
  removeItem: (id: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-ink/65">{label}</p>
      {items.length === 0 ? (
        <p className="rounded-md bg-ink/5 p-3 text-sm text-ink/45">None</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-2 rounded-md bg-ink/5 p-3 text-sm"
            >
              <Minus className="mt-0.5 h-4 w-4 shrink-0 text-moss" />
              <span className="min-w-0 flex-1 text-ink/70">{item.body}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-ink/40 hover:text-coral"
                aria-label={`Delete ${label.toLowerCase()}`}
                title={`Delete ${label.toLowerCase()}`}
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
