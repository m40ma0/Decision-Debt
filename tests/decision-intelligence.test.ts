import assert from "node:assert/strict";
import test from "node:test";
import { calculateDecisionDebtScore } from "@/lib/scoring";
import { detectDecisionTraps, getCostOfWaiting } from "@/lib/decision-intelligence";
import { decisionFormSchema } from "@/lib/validation";
import type { Decision } from "@/lib/database.types";

const baseDecision: Decision = {
  id: "decision_1",
  user_id: "user_1",
  title: "Pick insurance",
  description: "Choose a plan before enrollment closes.",
  category: "health",
  status: "open",
  deadline: "2026-05-24",
  review_date: null,
  stakes: "high",
  emotional_load: 5,
  time_impact: 4,
  money_impact: 5,
  confidence: 1,
  blockers: ["network unknown", "prescription costs", "deductible comparison"],
  missing_information: [],
  next_action: "Call the clinic.",
  final_decision: "",
  resolution_reason: "",
  outcome_notes: "",
  delegated_to: "",
  defer_reason: "",
  minimum_information: "",
  reversible_option: "",
  do_nothing_cost: "",
  fifteen_minute_action: "",
  outcome_quality: null,
  confidence_after: null,
  lesson_learned: "",
  is_demo: false,
  created_at: "2026-05-01T00:00:00.000Z",
  updated_at: "2026-05-01T00:00:00.000Z",
  resolved_at: null
};

test("scores high-pressure open decisions as critical", () => {
  const score = calculateDecisionDebtScore(
    baseDecision,
    new Date("2026-05-23T00:00:00.000Z")
  );

  assert.equal(score.label, "Critical");
  assert.equal(score.score, 100);
  assert.ok(score.explanation.some((item) => item.includes("Deadline")));
});

test("detects actionable decision traps", () => {
  const traps = detectDecisionTraps(
    baseDecision,
    new Date("2026-05-23T00:00:00.000Z")
  );
  const labels = traps.map((trap) => trap.label);

  assert.ok(labels.includes("Deadline pressure"));
  assert.ok(labels.includes("Low confidence"));
  assert.ok(labels.includes("Too many blockers"));
  assert.ok(labels.includes("Stale decision"));
});

test("cost of waiting returns human next-action guidance", () => {
  const cost = getCostOfWaiting(
    {
      ...baseDecision,
      fifteen_minute_action: "Open the plan comparison PDF."
    },
    new Date("2026-05-23T00:00:00.000Z")
  );

  assert.match(cost.why, /expensive|costly/i);
  assert.equal(cost.nextAction, "Open the plan comparison PDF.");
});

test("decision form validation rejects empty required fields and bad scores", () => {
  const result = decisionFormSchema.safeParse({
    title: "",
    description: "",
    category: "work",
    stakes: "medium",
    emotionalLoad: 0,
    timeImpact: 6,
    moneyImpact: 3,
    confidence: 3
  });

  assert.equal(result.success, false);
  if (!result.success) {
    const fields = result.error.flatten().fieldErrors;
    assert.ok(fields.title?.includes("Title is required."));
    assert.ok(fields.description?.includes("Description is required."));
    assert.ok(fields.emotionalLoad?.length);
    assert.ok(fields.timeImpact?.length);
  }
});
