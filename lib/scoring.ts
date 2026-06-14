import type { Decision } from "@/lib/database.types";
import { daysBetween } from "@/lib/utils";

export type DebtLabel = "Low" | "Medium" | "High" | "Critical";

export type DebtScore = {
  score: number;
  label: DebtLabel;
  explanation: string[];
  drivers: {
    age: number;
    deadline: number;
    impact: number;
    owner: number;
    blockers: number;
    uncertainty: number;
    stakeholders: number;
    confidence: number;
    urgency: number;
    missingDeadline: number;
    stakes: number;
    emotionalLoad: number;
    timeImpact: number;
    moneyImpact: number;
  };
};

const stakesWeight = {
  low: 5,
  medium: 12,
  high: 20
} as const;

function deadlinePoints(deadline: string | null, today: Date) {
  if (!deadline) return 0;

  const daysUntil = daysBetween(today, new Date(`${deadline}T00:00:00`));
  if (daysUntil < 0) return 25;
  if (daysUntil <= 1) return 22;
  if (daysUntil <= 3) return 18;
  if (daysUntil <= 7) return 13;
  if (daysUntil <= 14) return 7;
  return 2;
}

export function getDebtLabel(score: number): DebtLabel {
  if (score >= 75) return "Critical";
  if (score >= 55) return "High";
  if (score >= 30) return "Medium";
  return "Low";
}

export function calculateDecisionDebtScore(
  decision: Pick<
    Decision,
    | "created_at"
    | "deadline"
    | "owner"
    | "workflow_stage"
    | "stakes"
    | "emotional_load"
    | "time_impact"
    | "money_impact"
    | "confidence"
    | "blockers"
    | "affected_stakeholders"
    | "status"
  >,
  today = new Date()
): DebtScore {
  if (
    decision.status === "deleted" ||
    decision.workflow_stage === "resolved" ||
    decision.workflow_stage === "outcome_reviewed"
  ) {
    return {
      score: 0,
      label: "Low",
      explanation: ["Resolved decisions no longer carry active decision debt."],
      drivers: {
        age: 0,
        deadline: 0,
        impact: 0,
        owner: 0,
        blockers: 0,
        uncertainty: 0,
        stakeholders: 0,
        confidence: 0,
        urgency: 0,
        missingDeadline: 0,
        stakes: 0,
        emotionalLoad: 0,
        timeImpact: 0,
        moneyImpact: 0
      }
    };
  }

  const ageDays = Math.max(0, daysBetween(new Date(decision.created_at), today));
  const age = Math.min(20, Math.round(ageDays * 0.9));
  const deadline = deadlinePoints(decision.deadline, today);
  const urgency = decision.deadline ? deadline : 4;
  const stakes = stakesWeight[decision.stakes];
  const emotionalLoad = decision.emotional_load * 2;
  const timeImpact = decision.time_impact * 3;
  const moneyImpact = decision.money_impact * 2;
  const impact = Math.min(20, stakes + emotionalLoad + timeImpact + moneyImpact);
  const confidence = (6 - decision.confidence) * 3;
  const uncertainty = Math.min(10, confidence + (decision.confidence <= 2 ? 2 : 0));
  const blockers = Math.min(15, decision.blockers.length * 3);
  const owner = decision.owner.trim() ? 0 : 12;
  const missingDeadline = decision.deadline ? 0 : 6;
  const stakeholders = Math.min(12, Math.ceil((decision.affected_stakeholders || 0) / 2));

  const raw =
    age +
    deadline +
    impact +
    owner +
    blockers +
    uncertainty +
    stakeholders +
    confidence +
    urgency +
    missingDeadline;
  const score = Math.max(0, Math.min(100, Math.round(raw)));
  const explanation: string[] = [];

  if (ageDays >= 14) explanation.push(`This decision is ${ageDays} days old.`);
  if (decision.deadline === null) explanation.push("No deadline is set.");
  if (decision.deadline && deadline >= 18) explanation.push("Deadline is urgent or overdue.");
  if (!decision.owner.trim()) explanation.push("No owner is assigned yet.");
  if (decision.stakes === "high") explanation.push("It has high stakes.");
  if (decision.emotional_load >= 4) explanation.push("It carries a heavy emotional load.");
  if (decision.time_impact >= 4) explanation.push("Waiting is costing execution time.");
  if (decision.money_impact >= 4) explanation.push("There is meaningful financial exposure.");
  if (decision.confidence <= 2) explanation.push("Confidence is low.");
  if (decision.blockers.length > 0) {
    explanation.push(`${decision.blockers.length} blocker${decision.blockers.length === 1 ? "" : "s"}.`);
  }
  if ((decision.affected_stakeholders || 0) > 0) {
    explanation.push(`${decision.affected_stakeholders} affected stakeholders.`);
  }

  if (explanation.length === 0) {
    explanation.push("Low urgency, manageable impact, and adequate confidence.");
  }

  return {
    score,
    label: getDebtLabel(score),
    explanation,
    drivers: {
      age,
      deadline,
      impact,
      owner,
      blockers,
      uncertainty,
      stakeholders,
      confidence,
      urgency,
      missingDeadline,
      stakes,
      emotionalLoad,
      timeImpact,
      moneyImpact
    }
  };
}

export function sortByDebt<T extends Pick<Decision, keyof Decision>>(
  decisions: T[]
) {
  return [...decisions].sort(
    (a, b) =>
      calculateDecisionDebtScore(b as Decision).score -
      calculateDecisionDebtScore(a as Decision).score
  );
}
