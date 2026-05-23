"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Circle,
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
  updateDecisionDetailAction,
  updateOptionAction
} from "@/app/actions/decisions";
import { DebtBadge } from "@/components/debt-badge";
import { ResolutionPanel } from "@/components/decisions/resolution-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/toast-provider";
import { categoryLabels, stakesLabels, statusLabels } from "@/lib/constants";
import type { DecisionDetail, OptionWithProsCons } from "@/lib/queries";
import { formatDate, formatDateTime } from "@/lib/utils";

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

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <Badge tone="blue">{categoryLabels[detail.decision.category]}</Badge>
                <Badge tone="neutral">{statusLabels[detail.decision.status]}</Badge>
                <Badge tone="amber">{stakesLabels[detail.decision.stakes]} stakes</Badge>
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-normal">
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
            </div>
            <div className="rounded-lg border border-ink/10 bg-white p-4 lg:w-64">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-ink/60">Debt score</p>
                <DebtBadge label={detail.decision.debt.label} />
              </div>
              <p className="mt-3 text-4xl font-semibold">
                {detail.decision.debt.score}
              </p>
              <ul className="mt-3 space-y-1 text-sm text-ink/60">
                {detail.decision.debt.explanation.map((item) => (
                  <li key={item} className="flex gap-2">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-moss" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">Options</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <form className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]" onSubmit={addOption}>
                <Input
                  required
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
                  value={newOption.description}
                  onChange={(event) =>
                    setNewOption((current) => ({
                      ...current,
                      description: event.target.value
                    }))
                  }
                  placeholder="Short description"
                />
                <Button type="submit" disabled={pending}>
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </form>

              {detail.options.length === 0 ? (
                <div className="rounded-md border border-dashed border-ink/15 p-6 text-center text-sm text-ink/55">
                  No options added.
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

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Missing information and next action</h2>
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
                <Field label="Next action" htmlFor="nextAction">
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
                <Field label="Outcome notes" htmlFor="outcomeNotes">
                  <Textarea
                    id="outcomeNotes"
                    value={notes.outcomeNotes}
                    onChange={(event) =>
                      setNotes((current) => ({
                        ...current,
                        outcomeNotes: event.target.value
                      }))
                    }
                  />
                </Field>
                <div className="flex justify-end">
                  <Button type="submit" disabled={pending}>
                    <Save className="h-4 w-4" />
                    Save notes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {detail.decision.status === "open" || detail.decision.status === "deferred" ? (
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

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">History</h2>
            </CardHeader>
            <CardContent>
              {detail.events.length === 0 ? (
                <p className="text-sm text-ink/55">No history yet.</p>
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
        </div>
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
        "Remove this option? Its pros and cons will be permanently deleted."
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
    if (!window.confirm("Remove this pro or con?")) return;

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
            value={draft.title}
            onChange={(event) =>
              setDraft((current) => ({ ...current, title: event.target.value }))
            }
          />
          <Textarea
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
              size="icon"
              aria-label="Edit option"
              title="Edit"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remove option"
              title="Remove"
              disabled={pending}
              onClick={removeOption}
            >
              <Trash2 className="h-4 w-4 text-coral" />
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
          Add
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
              <button
                type="button"
                className="text-ink/35 transition hover:text-coral"
                aria-label="Remove"
                title="Remove"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
