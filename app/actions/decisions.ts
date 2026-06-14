"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type {
  DecisionCategory,
  DecisionStakes,
  DecisionStatus,
  DecisionWorkflowStage,
  Json,
  OutcomeQuality,
  ProConKind
} from "@/lib/database.types";
import {
  extractDecisionIntakeCandidates,
  type DecisionIntakeCandidate
} from "@/lib/decision-intake";
import { parseLines } from "@/lib/utils";
import { requireUser } from "@/lib/auth";
import { decisionFormSchema } from "@/lib/validation";

export type ActionResult<T = undefined> =
  | { ok: true; message: string; data?: T }
  | { ok: false; message: string; errors?: Record<string, string[]> };

const emptyToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

const workflowStageSchema = z.enum([
  "captured",
  "under_review",
  "owner_assigned",
  "resolved",
  "outcome_reviewed"
]);

const optionSchema = z.object({
  title: z.string().trim().min(2, "Option title is too short.").max(160),
  description: z.string().trim().optional().default("")
});

const proConSchema = z.object({
  optionId: z.string().uuid(),
  decisionId: z.string().uuid(),
  kind: z.enum(["pro", "con"]),
  body: z.string().trim().min(2, "Add a little more detail.").max(500)
});

const detailSchema = z.object({
  missingInformation: z.string().optional().default(""),
  nextAction: z.string().trim().optional().default(""),
  outcomeNotes: z.string().trim().optional().default("")
});

const triageSchema = z.object({
  owner: z.string().trim().optional().default(""),
  workspace: z.string().trim().optional().default(""),
  project: z.string().trim().optional().default(""),
  tags: z.string().trim().optional().default(""),
  affectedStakeholders: z.coerce.number().int().min(0).max(1000).optional().default(0),
  workflowStage: workflowStageSchema
});

const goodEnoughSchema = z.object({
  minimumInformation: z.string().trim().optional().default(""),
  reversibleOption: z.string().trim().optional().default(""),
  doNothingCost: z.string().trim().optional().default(""),
  fifteenMinuteAction: z.string().trim().optional().default("")
});

const outcomeLearningSchema = z.object({
  outcomeQuality: z.enum(["good", "okay", "bad"]).nullable().optional(),
  confidenceAfter: z.preprocess(
    emptyToNull,
    z.coerce.number().int().min(1, "Use 1-5.").max(5, "Use 1-5.").nullable().optional()
  ),
  lessonLearned: z.string().trim().optional().default(""),
  outcomeNotes: z.string().trim().optional().default("")
});

const intakeExtractionSchema = z.object({
  notes: z.string().trim().min(10, "Paste a few notes to extract from.")
});

const resolutionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("committed"),
    decisionId: z.string().uuid(),
    optionId: z.string().uuid().optional(),
    finalDecision: z.string().trim().min(2, "Final decision is required."),
    reason: z.string().trim().min(2, "Reason is required."),
    outcomeNotes: z.string().trim().optional().default("")
  }),
  z.object({
    action: z.literal("deferred"),
    decisionId: z.string().uuid(),
    reviewDate: z.string().date("Set a review date."),
    reason: z.string().trim().min(2, "Reason is required.")
  }),
  z.object({
    action: z.literal("delegated"),
    decisionId: z.string().uuid(),
    delegatedTo: z.string().trim().min(2, "Owner is required."),
    reviewDate: z.preprocess(emptyToNull, z.string().date().nullable().optional()),
    reason: z.string().trim().min(2, "Reason is required.")
  }),
  z.object({
    action: z.literal("deleted"),
    decisionId: z.string().uuid(),
    reason: z.string().trim().min(2, "Reason is required.")
  })
]);

async function writeEvent(
  decisionId: string,
  eventType: string,
  title: string,
  body = "",
  metadata: Json = {}
) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("decision_events").insert({
    decision_id: decisionId,
    user_id: user.id,
    event_type: eventType,
    title,
    body,
    metadata
  });
  if (error) throw new Error(error.message);
}

function validationError(error: z.ZodError): ActionResult {
  const fieldErrors = Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).filter(
      (entry): entry is [string, string[]] => Array.isArray(entry[1])
    )
  );

  return {
    ok: false,
    message: error.issues[0]?.message ?? "Check the form values.",
    errors: fieldErrors
  };
}

function splitTags(value: string) {
  return parseLines(value)
    .map((tag) => tag.replace(/^#/, "").trim())
    .filter(Boolean);
}

function workflowStageForStatus(action: DecisionStatus): DecisionWorkflowStage {
  if (action === "delegated") return "owner_assigned";
  if (action === "deferred") return "under_review";
  if (action === "committed" || action === "deleted") return "resolved";
  return "captured";
}

export async function createDecisionAction(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = decisionFormSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const { supabase, user } = await requireUser();
  const values = parsed.data;
  const { data, error } = await supabase
    .from("decisions")
    .insert({
      user_id: user.id,
      title: values.title,
      description: values.description,
      category: values.category as DecisionCategory,
      workflow_stage: "captured",
      workspace: values.workspace ?? "",
      project: values.project ?? "",
      owner: values.owner ?? "",
      tags: splitTags(values.tags),
      affected_stakeholders: values.affectedStakeholders ?? 0,
      deadline: values.deadline ?? null,
      review_date: values.reviewDate ?? null,
      stakes: values.stakes as DecisionStakes,
      emotional_load: values.emotionalLoad,
      time_impact: values.timeImpact,
      money_impact: values.moneyImpact,
      confidence: values.confidence,
      blockers: parseLines(values.blockers),
      missing_information: parseLines(values.missingInformation),
      next_action: values.nextAction,
      outcome_notes: values.outcomeNotes
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: error.message };
  await writeEvent(data.id, "created", "Decision captured", values.description);
  revalidatePath("/dashboard");
  revalidatePath("/decisions");
  return { ok: true, message: "Decision created.", data };
}

export async function updateDecisionAction(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const parsed = decisionFormSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const { supabase, user } = await requireUser();
  const values = parsed.data;
  const { error } = await supabase
    .from("decisions")
    .update({
      title: values.title,
      description: values.description,
      category: values.category as DecisionCategory,
      workspace: values.workspace ?? "",
      project: values.project ?? "",
      owner: values.owner ?? "",
      tags: splitTags(values.tags),
      affected_stakeholders: values.affectedStakeholders ?? 0,
      deadline: values.deadline ?? null,
      review_date: values.reviewDate ?? null,
      stakes: values.stakes as DecisionStakes,
      emotional_load: values.emotionalLoad,
      time_impact: values.timeImpact,
      money_impact: values.moneyImpact,
      confidence: values.confidence,
      blockers: parseLines(values.blockers),
      missing_information: parseLines(values.missingInformation),
      next_action: values.nextAction,
      outcome_notes: values.outcomeNotes
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, message: error.message };
  await writeEvent(id, "updated", "Decision updated");
  revalidatePath("/dashboard");
  revalidatePath("/decisions");
  revalidatePath(`/decisions/${id}`);
  return { ok: true, message: "Decision updated." };
}

export async function updateDecisionTriageAction(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const parsed = triageSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("decisions")
    .update({
      owner: parsed.data.owner,
      workspace: parsed.data.workspace,
      project: parsed.data.project,
      tags: splitTags(parsed.data.tags),
      affected_stakeholders: parsed.data.affectedStakeholders,
      workflow_stage: parsed.data.workflowStage
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, message: error.message };
  await writeEvent(
    id,
    "triage_updated",
    "Triage updated",
    [parsed.data.owner, parsed.data.workspace, parsed.data.project]
      .filter(Boolean)
      .join(" • "),
    {
      owner: parsed.data.owner,
      workspace: parsed.data.workspace,
      project: parsed.data.project,
      tags: splitTags(parsed.data.tags),
      affectedStakeholders: parsed.data.affectedStakeholders,
      workflowStage: parsed.data.workflowStage
    }
  );
  revalidatePath("/dashboard");
  revalidatePath("/decisions");
  revalidatePath(`/decisions/${id}`);
  revalidatePath("/review");
  return { ok: true, message: "Triage saved." };
}

export async function deleteDecisionAction(id: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("decisions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/decisions");
  return { ok: true, message: "Decision removed." };
}

export async function updateDecisionDetailAction(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const parsed = detailSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("decisions")
    .update({
      missing_information: parseLines(parsed.data.missingInformation),
      next_action: parsed.data.nextAction,
      outcome_notes: parsed.data.outcomeNotes
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, message: error.message };
  await writeEvent(id, "updated", "Decision notes updated");
  revalidatePath(`/decisions/${id}`);
  revalidatePath("/dashboard");
  return { ok: true, message: "Decision notes saved." };
}

export async function updateGoodEnoughAction(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const parsed = goodEnoughSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("decisions")
    .update({
      minimum_information: parsed.data.minimumInformation,
      reversible_option: parsed.data.reversibleOption,
      do_nothing_cost: parsed.data.doNothingCost,
      fifteen_minute_action: parsed.data.fifteenMinuteAction,
      next_action: parsed.data.fifteenMinuteAction || undefined
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, message: error.message };
  await writeEvent(id, "good_enough_updated", "Good enough mode updated");
  revalidatePath(`/decisions/${id}`);
  revalidatePath("/dashboard");
  revalidatePath("/review");
  return { ok: true, message: "Good enough prompts saved." };
}

export async function updateOutcomeLearningAction(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const parsed = outcomeLearningSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("decisions")
    .update({
      outcome_quality: (parsed.data.outcomeQuality ?? null) as OutcomeQuality | null,
      confidence_after: parsed.data.confidenceAfter ?? null,
      lesson_learned: parsed.data.lessonLearned,
      outcome_notes: parsed.data.outcomeNotes,
      workflow_stage: "outcome_reviewed"
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, message: error.message };
  await writeEvent(
    id,
    "outcome_learning_updated",
    "Outcome updated",
    parsed.data.lessonLearned
  );
  revalidatePath(`/decisions/${id}`);
  revalidatePath("/analytics");
  revalidatePath("/history");
  return { ok: true, message: "Outcome saved." };
}

export async function extractDecisionIntakeAction(
  input: unknown
): Promise<ActionResult<{ candidates: DecisionIntakeCandidate[] }>> {
  const parsed = intakeExtractionSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const candidates = extractDecisionIntakeCandidates(parsed.data.notes).slice(0, 3);
  if (candidates.length === 0) {
    return {
      ok: false,
      message: "No decision-shaped notes found. Try including a decision, owner, or deadline."
    };
  }

  return {
    ok: true,
    message: `Extracted ${candidates.length} decision candidate${candidates.length === 1 ? "" : "s"}.`,
    data: { candidates }
  };
}

export async function addOptionAction(
  decisionId: string,
  input: unknown
): Promise<ActionResult> {
  const parsed = optionSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("decision_options").insert({
    decision_id: decisionId,
    user_id: user.id,
    title: parsed.data.title,
    description: parsed.data.description
  });

  if (error) return { ok: false, message: error.message };
  await writeEvent(decisionId, "option_added", "Option added", parsed.data.title);
  revalidatePath(`/decisions/${decisionId}`);
  return { ok: true, message: "Option added." };
}

export async function updateOptionAction(
  optionId: string,
  decisionId: string,
  input: unknown
): Promise<ActionResult> {
  const parsed = optionSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("decision_options")
    .update({
      title: parsed.data.title,
      description: parsed.data.description
    })
    .eq("id", optionId)
    .eq("user_id", user.id);

  if (error) return { ok: false, message: error.message };
  await writeEvent(decisionId, "option_updated", "Option updated", parsed.data.title);
  revalidatePath(`/decisions/${decisionId}`);
  return { ok: true, message: "Option updated." };
}

export async function deleteOptionAction(
  optionId: string,
  decisionId: string
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("decision_options")
    .delete()
    .eq("id", optionId)
    .eq("user_id", user.id);

  if (error) return { ok: false, message: error.message };
  await writeEvent(decisionId, "option_deleted", "Option removed");
  revalidatePath(`/decisions/${decisionId}`);
  return { ok: true, message: "Option removed." };
}

export async function addProConAction(input: unknown): Promise<ActionResult> {
  const parsed = proConSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("decision_option_pros_cons").insert({
    option_id: parsed.data.optionId,
    decision_id: parsed.data.decisionId,
    user_id: user.id,
    kind: parsed.data.kind as ProConKind,
    body: parsed.data.body
  });

  if (error) return { ok: false, message: error.message };
  await writeEvent(
    parsed.data.decisionId,
    `${parsed.data.kind}_added`,
    `${parsed.data.kind === "pro" ? "Pro" : "Con"} added`,
    parsed.data.body
  );
  revalidatePath(`/decisions/${parsed.data.decisionId}`);
  return { ok: true, message: "Saved." };
}

export async function deleteProConAction(
  id: string,
  decisionId: string
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("decision_option_pros_cons")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, message: error.message };
  revalidatePath(`/decisions/${decisionId}`);
  return { ok: true, message: "Removed." };
}

export async function resolveDecisionAction(input: unknown): Promise<ActionResult> {
  const parsed = resolutionSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const { supabase, user } = await requireUser();
  const action = parsed.data.action as DecisionStatus;
  const now = new Date().toISOString();
  const update: Record<string, unknown> = {
    status: action,
    resolution_reason: "reason" in parsed.data ? parsed.data.reason : "",
    workflow_stage: workflowStageForStatus(action)
  };

  if (parsed.data.action === "committed") {
    update.final_decision = parsed.data.finalDecision;
    update.outcome_notes = parsed.data.outcomeNotes;
    update.resolved_at = now;
  }

  if (parsed.data.action === "deferred") {
    update.review_date = parsed.data.reviewDate;
    update.defer_reason = parsed.data.reason;
    update.resolved_at = null;
  }

  if (parsed.data.action === "delegated") {
    update.delegated_to = parsed.data.delegatedTo;
    update.review_date = parsed.data.reviewDate ?? null;
    update.resolved_at = null;
  }

  if (parsed.data.action === "deleted") {
    update.resolved_at = now;
  }

  const { error } = await supabase
    .from("decisions")
    .update(update)
    .eq("id", parsed.data.decisionId)
    .eq("user_id", user.id);

  if (error) return { ok: false, message: error.message };

  if (parsed.data.action === "committed" && parsed.data.optionId) {
    await supabase
      .from("decision_options")
      .update({ is_selected: false })
      .eq("decision_id", parsed.data.decisionId)
      .eq("user_id", user.id);
    await supabase
      .from("decision_options")
      .update({ is_selected: true })
      .eq("id", parsed.data.optionId)
      .eq("user_id", user.id);
  }

  const eventTitle = {
    committed: "Committed",
    deferred: "Deferred",
    delegated: "Delegated",
    deleted: "Deleted"
  }[parsed.data.action];

  await writeEvent(
    parsed.data.decisionId,
    parsed.data.action,
    eventTitle,
    update.resolution_reason as string,
    parsed.data as Json
  );
  revalidatePath("/dashboard");
  revalidatePath("/decisions");
  revalidatePath("/review");
  revalidatePath(`/decisions/${parsed.data.decisionId}`);
  return { ok: true, message: `${eventTitle}.` };
}
