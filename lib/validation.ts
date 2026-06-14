import { z } from "zod";

const emptyToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

export const decisionFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(160),
  description: z.string().trim().min(1, "Description is required.").max(2000),
  category: z.enum([
    "work",
    "school",
    "money",
    "health",
    "relationships",
    "personal",
    "other"
  ]),
  deadline: z.preprocess(
    emptyToNull,
    z.string().date("Use a valid deadline.").nullable().optional()
  ),
  owner: z.string().optional().default(""),
  workspace: z.string().optional().default(""),
  project: z.string().optional().default(""),
  tags: z.string().optional().default(""),
  affectedStakeholders: z
    .coerce.number()
    .int()
    .min(0, "Use a number.")
    .max(1000, "Use a number.")
    .optional()
    .default(0),
  reviewDate: z.preprocess(
    emptyToNull,
    z.string().date("Use a valid review date.").nullable().optional()
  ),
  stakes: z.enum(["low", "medium", "high"]),
  emotionalLoad: z.coerce.number().int().min(1, "Use 1-5.").max(5, "Use 1-5."),
  timeImpact: z.coerce.number().int().min(1, "Use 1-5.").max(5, "Use 1-5."),
  moneyImpact: z.coerce.number().int().min(1, "Use 1-5.").max(5, "Use 1-5."),
  confidence: z.coerce.number().int().min(1, "Use 1-5.").max(5, "Use 1-5."),
  blockers: z.string().optional().default(""),
  missingInformation: z.string().optional().default(""),
  nextAction: z.string().trim().optional().default(""),
  outcomeNotes: z.string().trim().optional().default("")
});

export type DecisionFormInput = z.infer<typeof decisionFormSchema>;
