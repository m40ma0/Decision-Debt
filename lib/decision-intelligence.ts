import type { Decision } from "@/lib/database.types";
import { calculateDecisionDebtScore } from "@/lib/scoring";
import { daysBetween } from "@/lib/utils";

export type TrapTag = {
  id:
    | "deadline_pressure"
    | "high_emotional_load"
    | "low_confidence"
    | "too_many_blockers"
    | "high_money_impact"
    | "high_time_impact"
    | "stale_decision";
  label: string;
  severity: "low" | "medium" | "high";
  reason: string;
};

export function detectDecisionTraps(
  decision: Pick<
    Decision,
    | "created_at"
    | "deadline"
    | "emotional_load"
    | "time_impact"
    | "money_impact"
    | "confidence"
    | "blockers"
    | "status"
  >,
  today = new Date()
): TrapTag[] {
  if (decision.status !== "open" && decision.status !== "deferred") return [];

  const traps: TrapTag[] = [];
  const ageDays = Math.max(0, daysBetween(new Date(decision.created_at), today));
  const daysUntilDeadline = decision.deadline
    ? daysBetween(today, new Date(`${decision.deadline}T00:00:00`))
    : null;

  if (daysUntilDeadline !== null && daysUntilDeadline <= 7) {
    traps.push({
      id: "deadline_pressure",
      label: "Deadline pressure",
      severity: daysUntilDeadline <= 1 ? "high" : "medium",
      reason:
        daysUntilDeadline < 0
          ? "The deadline has passed."
          : "The deadline is close enough that waiting narrows your options."
    });
  }

  if (decision.emotional_load >= 4) {
    traps.push({
      id: "high_emotional_load",
      label: "High emotional load",
      severity: decision.emotional_load === 5 ? "high" : "medium",
      reason: "This choice is taking up emotional bandwidth."
    });
  }

  if (decision.confidence <= 2) {
    traps.push({
      id: "low_confidence",
      label: "Low confidence",
      severity: decision.confidence === 1 ? "high" : "medium",
      reason: "The decision may be blocked by uncertainty, not effort."
    });
  }

  if (decision.blockers.length >= 3) {
    traps.push({
      id: "too_many_blockers",
      label: "Too many blockers",
      severity: "high",
      reason: "Multiple blockers make this decision easy to keep postponing."
    });
  }

  if (decision.money_impact >= 4) {
    traps.push({
      id: "high_money_impact",
      label: "High money impact",
      severity: decision.money_impact === 5 ? "high" : "medium",
      reason: "The cost of a late or weak decision could be financial."
    });
  }

  if (decision.time_impact >= 4) {
    traps.push({
      id: "high_time_impact",
      label: "High time impact",
      severity: decision.time_impact === 5 ? "high" : "medium",
      reason: "This choice can keep consuming planning and execution time."
    });
  }

  if (ageDays >= 14) {
    traps.push({
      id: "stale_decision",
      label: "Stale decision",
      severity: ageDays >= 30 ? "high" : "medium",
      reason: `This has been open for ${ageDays} days.`
    });
  }

  return traps;
}

export function getCostOfWaiting(
  decision: Pick<
    Decision,
    | "created_at"
    | "deadline"
    | "stakes"
    | "emotional_load"
    | "time_impact"
    | "money_impact"
    | "confidence"
    | "blockers"
    | "status"
    | "next_action"
    | "fifteen_minute_action"
  >,
  today = new Date()
) {
  const score = calculateDecisionDebtScore(decision, today);
  const traps = detectDecisionTraps(decision, today);
  const topTrap = traps[0];
  const nextAction =
    decision.fifteen_minute_action ||
    decision.next_action ||
    "Write the smallest missing fact or next owner.";

  const why =
    score.label === "Critical"
      ? "This decision is expensive because several pressure signals are stacking up."
      : score.label === "High"
        ? "This decision is becoming costly enough to deserve focused attention."
        : score.label === "Medium"
          ? "This decision is manageable, but it can grow if it stays open."
          : "This decision is currently low debt, so a small next step should keep it light.";

  const whatGetsWorse = topTrap
    ? topTrap.reason
    : "Waiting mainly keeps the choice in your head instead of moving it toward closure.";

  return {
    why,
    whatGetsWorse,
    nextAction,
    summary: `${why} ${whatGetsWorse}`
  };
}
