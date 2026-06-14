import type {
  DecisionCategory,
  DecisionStatus,
  DecisionStakes,
  DecisionWorkflowStage
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
export const workflowStages: DecisionWorkflowStage[] = [
  "captured",
  "under_review",
  "owner_assigned",
  "resolved",
  "outcome_reviewed"
];

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

export const workflowStageLabels: Record<DecisionWorkflowStage, string> = {
  captured: "Captured",
  under_review: "Under Review",
  owner_assigned: "Owner Assigned",
  resolved: "Resolved",
  outcome_reviewed: "Outcome Reviewed"
};

export const stakesLabels: Record<DecisionStakes, string> = {
  low: "Low",
  medium: "Medium",
  high: "High"
};
