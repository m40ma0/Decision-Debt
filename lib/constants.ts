import type {
  DecisionCategory,
  DecisionStatus,
  DecisionStakes
} from "@/lib/database.types";

export const decisionCategories: DecisionCategory[] = [
  "work",
  "school",
  "money",
  "health",
  "relationships",
  "personal",
  "other"
];

export const decisionStatuses: DecisionStatus[] = [
  "open",
  "committed",
  "deferred",
  "delegated",
  "deleted"
];

export const decisionStakes: DecisionStakes[] = ["low", "medium", "high"];

export const categoryLabels: Record<DecisionCategory, string> = {
  work: "Work",
  school: "School",
  money: "Money",
  health: "Health",
  relationships: "Relationships",
  personal: "Personal",
  other: "Other"
};

export const statusLabels: Record<DecisionStatus, string> = {
  open: "Open",
  committed: "Committed",
  deferred: "Deferred",
  delegated: "Delegated",
  deleted: "Deleted"
};

export const stakesLabels: Record<DecisionStakes, string> = {
  low: "Low",
  medium: "Medium",
  high: "High"
};
