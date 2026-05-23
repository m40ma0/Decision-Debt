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
    stakes: number;
    emotionalLoad: number;
    timeImpact: number;
    moneyImpact: number;
    confidence: number;
    blockers: number;
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
    | "stakes"
    | "emotional_load"
    | "time_impact"
    | "money_impact"
    | "confidence"
    | "blockers"
    | "status"
  >,
  today = new Date()
): DebtScore {
  if (decision.status !== "open") {
    return {
      score: 0,
      label: "Low",
      explanation: ["Resolved decisions no longer carry active decision debt."],
      drivers: {
        age: 0,
        deadline: 0,
        stakes: 0,
        emotionalLoad: 0,
        timeImpact: 0,
        moneyImpact: 0,
        confidence: 0,
        blockers: 0
      }
    };
  }

  const ageDays = Math.max(0, daysBetween(new Date(decision.created_at), today));
  const age = Math.min(15, Math.floor(ageDays / 2));
  const deadline = deadlinePoints(decision.deadline, today);
  const stakes = stakesWeight[decision.stakes];
  const emotionalLoad = decision.emotional_load * 5;
  const timeImpact = decision.time_impact * 4;
  const moneyImpact = decision.money_impact * 3;
  const confidence = (6 - decision.confidence) * 5;
  const blockers = Math.min(12, decision.blockers.length * 4);

  const raw =
    age +
    deadline +
    stakes +
    emotionalLoad +
    timeImpact +
    moneyImpact +
    confidence +
    blockers;
  const score = Math.max(0, Math.min(100, Math.round(raw)));
  const explanation: string[] = [];

  if (ageDays >= 14) explanation.push(`Open for ${ageDays} days.`);
  if (deadline >= 18) explanation.push("Deadline is urgent or overdue.");
  if (decision.stakes === "high") explanation.push("High stakes.");
  if (decision.emotional_load >= 4) explanation.push("High emotional load.");
  if (decision.time_impact >= 4) explanation.push("Large time impact.");
  if (decision.money_impact >= 4) explanation.push("Large money impact.");
  if (decision.confidence <= 2) explanation.push("Low confidence.");
  if (decision.blockers.length > 0) {
    explanation.push(`${decision.blockers.length} blocker${decision.blockers.length === 1 ? "" : "s"}.`);
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
      stakes,
      emotionalLoad,
      timeImpact,
      moneyImpact,
      confidence,
      blockers
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
