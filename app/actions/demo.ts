"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { isoDate } from "@/lib/utils";

type DemoDecision = {
  title: string;
  description: string;
  category:
    | "work"
    | "school"
    | "money"
    | "health"
    | "relationships"
    | "personal"
    | "other";
  deadline: string | null;
  stakes: "low" | "medium" | "high";
  emotional_load: number;
  time_impact: number;
  money_impact: number;
  confidence: number;
  blockers: string[];
  missing_information: string[];
  next_action: string;
  owner?: string;
  workspace?: string;
  project?: string;
  tags?: string[];
  affected_stakeholders?: number;
  workflow_stage?: "captured" | "under_review" | "owner_assigned" | "resolved" | "outcome_reviewed";
  minimum_information?: string;
  reversible_option?: string;
  do_nothing_cost?: string;
  fifteen_minute_action?: string;
  status?: "open" | "committed" | "deferred" | "delegated" | "deleted";
  final_decision?: string;
  resolution_reason?: string;
  outcome_notes?: string;
  outcome_quality?: "good" | "okay" | "bad";
  confidence_after?: number;
  lesson_learned?: string;
  resolved_at?: string;
  created_at: string;
  options: {
    title: string;
    description: string;
    pros: string[];
    cons: string[];
  }[];
};

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

const demoDecisions: DemoDecision[] = [
  {
    title: "Startup launch pricing model is blocking the demo",
    description:
      "The team needs to decide how to price the launch so the story is clear without overbuilding the product.",
    category: "work",
    deadline: isoDate(1),
    stakes: "high",
    emotional_load: 5,
    time_impact: 5,
    money_impact: 2,
    confidence: 2,
    owner: "",
    workspace: "Brainwave Launch",
    project: "Startup product launch",
    tags: ["pricing", "launch", "demo"],
    affected_stakeholders: 9,
    workflow_stage: "captured",
    blockers: ["unclear judging priority", "limited build time", "too many feature ideas"],
    missing_information: ["Which pricing story is strongest?", "What can be cut safely?"],
    next_action: "Compare the launch pricing options against the judging rubric.",
    created_at: daysAgo(18),
    options: [
      {
        title: "Polish the dashboard and review flow",
        description: "Make the core story obvious in a five minute demo.",
        pros: ["Strong judge narrative", "Reduces risk", "Fits the product thesis"],
        cons: ["Less breadth", "Some analytics stay simple"]
      },
      {
        title: "Add more integrations",
        description: "Connect calendar, tasks, and email signals.",
        pros: ["Feels ambitious", "More automation"],
        cons: ["High implementation risk", "May distract from the core idea"]
      }
    ]
  },
  {
    title: "Onboarding flow needs an owner before beta",
    description:
      "The beta onboarding journey is fragile, and the launch plan needs a named owner plus one clear flow.",
    category: "money",
    deadline: isoDate(3),
    stakes: "high",
    emotional_load: 4,
    time_impact: 4,
    money_impact: 5,
    confidence: 2,
    owner: "Maya",
    workspace: "Brainwave Launch",
    project: "Startup product launch",
    tags: ["onboarding", "beta"],
    affected_stakeholders: 14,
    workflow_stage: "under_review",
    blockers: ["copy not finalized", "tooltips missing", "handoff from growth team"],
    missing_information: ["Which onboarding path is simplest?", "Who owns the final copy?"],
    next_action: "Assign the onboarding owner and narrow the beta flow to one path.",
    created_at: daysAgo(27),
    options: [
      {
        title: "Renew for one year",
        description: "Accept stability and avoid moving work.",
        pros: ["Least disruption", "Known neighborhood"],
        cons: ["Higher monthly cost", "No layout upgrade"]
      },
      {
        title: "Move to a smaller place",
        description: "Reduce recurring spend if the search works quickly.",
        pros: ["Potential savings", "Fresh start"],
        cons: ["Search effort", "Moving expenses"]
      }
    ]
  },
  {
    title: "AI feature scope is too broad for launch",
    description:
      "The team needs to decide how much of the AI feature ships in the first release.",
    category: "health",
    deadline: isoDate(5),
    stakes: "high",
    emotional_load: 4,
    time_impact: 3,
    money_impact: 5,
    confidence: 1,
    owner: "Jordan",
    workspace: "Brainwave Launch",
    project: "Startup product launch",
    tags: ["ai", "scope", "launch"],
    affected_stakeholders: 11,
    workflow_stage: "owner_assigned",
    blockers: ["model quality uncertain", "scope creep risk"],
    missing_information: ["Must-have AI use case", "What can wait until v2"],
    next_action: "Lock the AI scope and write the v1 / v2 split.",
    created_at: daysAgo(12),
    options: [
      {
        title: "Lower premium plan",
        description: "Lower monthly cost with higher deductible.",
        pros: ["Better cash flow", "Works if usage stays low"],
        cons: ["Riskier if care needs increase"]
      },
      {
        title: "Higher coverage plan",
        description: "Higher premium with lower out-of-pocket risk.",
        pros: ["More predictable", "Better specialist coverage"],
        cons: ["Costs more every month"]
      }
    ]
  },
  {
    title: "Choose the school project deadline plan",
    description: "The project can still land well, but the scope and deadline need a clear reset.",
    category: "school",
    deadline: isoDate(8),
    stakes: "medium",
    emotional_load: 4,
    time_impact: 5,
    money_impact: 1,
    confidence: 3,
    blockers: ["advisor feedback pending", "scope still too broad"],
    missing_information: ["Minimum viable deliverable", "Rubric weighting"],
    next_action: "Send the advisor a two-scope plan and ask for a recommendation.",
    created_at: daysAgo(21),
    options: [
      {
        title: "Narrow the project scope",
        description: "Ship a focused version with stronger analysis.",
        pros: ["More realistic", "Better finish quality"],
        cons: ["Cuts one interesting feature"]
      },
      {
        title: "Ask for a short extension",
        description: "Protect the larger scope by moving the deadline.",
        pros: ["Keeps ambition", "More research time"],
        cons: ["May not be approved"]
      }
    ]
  },
  {
    title: "Choose a weekend family plan",
    description: "Everyone wants something different and the window is getting small.",
    category: "relationships",
    deadline: isoDate(2),
    stakes: "medium",
    emotional_load: 3,
    time_impact: 3,
    money_impact: 2,
    confidence: 4,
    blockers: ["weather uncertainty", "two schedules not confirmed"],
    missing_information: ["Saturday weather", "cousin arrival time"],
    next_action: "Ask for final availability by tonight.",
    created_at: daysAgo(6),
    options: [
      {
        title: "Picnic and museum",
        description: "Low cost and flexible if weather changes.",
        pros: ["Easy to adjust", "Kid friendly"],
        cons: ["Weather dependent"]
      },
      {
        title: "Book a brunch reservation",
        description: "Simple fixed plan with less coordination.",
        pros: ["Predictable", "Less planning"],
        cons: ["Less personal", "Reservation may be tight"]
      }
    ]
  },
  {
    title: "Choose the laptop upgrade budget",
    description: "The current machine slows down important work, but the purchase needs a clear ceiling.",
    category: "money",
    deadline: isoDate(14),
    stakes: "medium",
    emotional_load: 2,
    time_impact: 4,
    money_impact: 4,
    confidence: 3,
    blockers: ["budget ceiling unclear", "model comparison"],
    missing_information: ["Trade-in value", "Actual performance requirement"],
    next_action: "Set a maximum budget and compare two models only.",
    created_at: daysAgo(15),
    options: [
      {
        title: "Buy the mid-tier model",
        description: "Replace the machine this week without overspending.",
        pros: ["Immediate speed gain", "Less build friction"],
        cons: ["Higher upfront cost"]
      },
      {
        title: "Wait for the next refresh",
        description: "Keep current setup until the next hardware cycle.",
        pros: ["May get better specs", "More budget clarity"],
        cons: ["Lost time continues"]
      }
    ]
  },
  {
    title: "Set a morning routine",
    description: "Too many ad hoc starts are making mornings feel scattered.",
    category: "personal",
    deadline: isoDate(20),
    stakes: "low",
    emotional_load: 3,
    time_impact: 3,
    money_impact: 1,
    confidence: 4,
    blockers: ["sleep schedule inconsistent"],
    missing_information: ["Realistic wake time"],
    next_action: "Try a 30-minute version for three days.",
    created_at: daysAgo(9),
    options: [
      {
        title: "Exercise first",
        description: "Short workout before screens.",
        pros: ["Energy boost", "Clear start"],
        cons: ["Needs earlier bedtime"]
      },
      {
        title: "Planning first",
        description: "Review calendar and choose top decisions.",
        pros: ["Less mental clutter", "Easy to maintain"],
        cons: ["Less physical activation"]
      }
    ]
  },
  {
    title: "Choose which internship path to pursue",
    description: "Two opportunities are realistic, but applications and outreach need focus this week.",
    category: "work",
    deadline: isoDate(4),
    stakes: "high",
    emotional_load: 3,
    time_impact: 4,
    money_impact: 3,
    confidence: 2,
    blockers: ["portfolio needs tailoring", "mentor advice pending"],
    missing_information: ["Interview timeline", "Which role fits long-term goals"],
    next_action: "Ask one mentor to compare the two paths by tomorrow.",
    created_at: daysAgo(17),
    options: [
      {
        title: "Apply for product design internships",
        description: "Lean into research, prototyping, and portfolio storytelling.",
        pros: ["Matches Design4Future work", "Strong portfolio fit"],
        cons: ["More competitive"]
      },
      {
        title: "Apply for product operations internships",
        description: "Build execution experience closer to teams and metrics.",
        pros: ["Practical skills", "Broader openings"],
        cons: ["Less design depth"]
      }
    ]
  },
  {
    title: "Decide whether to join the neighborhood board",
    description: "It matters locally, but time commitment is unclear.",
    category: "personal",
    deadline: isoDate(30),
    stakes: "medium",
    emotional_load: 2,
    time_impact: 3,
    money_impact: 1,
    confidence: 3,
    blockers: ["meeting schedule unknown"],
    missing_information: ["Monthly time commitment"],
    next_action: "Ask current board member about workload.",
    created_at: daysAgo(11),
    options: [
      {
        title: "Join for one term",
        description: "Contribute directly and reassess later.",
        pros: ["Community impact", "Learn local issues"],
        cons: ["Evening time cost"]
      },
      {
        title: "Volunteer occasionally",
        description: "Help without formal role.",
        pros: ["Flexible", "Lower load"],
        cons: ["Less influence"]
      }
    ]
  },
  {
    title: "Choose a savings goal priority",
    description: "Emergency fund, travel, and debt payoff are competing.",
    category: "money",
    deadline: isoDate(10),
    stakes: "medium",
    emotional_load: 3,
    time_impact: 2,
    money_impact: 5,
    confidence: 3,
    blockers: ["monthly budget unclear"],
    missing_information: ["Next three months of fixed costs"],
    next_action: "Review recurring expenses.",
    created_at: daysAgo(24),
    options: [
      {
        title: "Emergency fund first",
        description: "Build three months of expenses.",
        pros: ["Reduces anxiety", "Improves resilience"],
        cons: ["Travel waits"]
      },
      {
        title: "Debt payoff first",
        description: "Reduce interest faster.",
        pros: ["Saves money long term", "Clear target"],
        cons: ["Less liquid cash"]
      }
    ]
  },
  {
    title: "Select the next course",
    description: "Both courses are useful, but only one fits the next semester.",
    category: "school",
    deadline: isoDate(16),
    stakes: "low",
    emotional_load: 2,
    time_impact: 4,
    money_impact: 2,
    confidence: 4,
    blockers: ["syllabus not posted"],
    missing_information: ["Instructor workload", "Project format"],
    next_action: "Email the program coordinator.",
    created_at: daysAgo(7),
    options: [
      {
        title: "Human-computer interaction",
        description: "Improve product design foundation.",
        pros: ["Directly useful", "Portfolio value"],
        cons: ["More writing"]
      },
      {
        title: "Data visualization",
        description: "Build stronger analytics skills.",
        pros: ["Useful for dashboards", "Technical depth"],
        cons: ["Heavier coding load"]
      }
    ]
  },
  {
    title: "Decide on birthday gift",
    description: "Need something thoughtful without overcomplicating it.",
    category: "relationships",
    deadline: isoDate(6),
    stakes: "low",
    emotional_load: 3,
    time_impact: 2,
    money_impact: 2,
    confidence: 3,
    blockers: ["gift ideas scattered"],
    missing_information: ["Recent wishlist hints"],
    next_action: "Pick between experience and practical gift.",
    created_at: daysAgo(5),
    options: [
      {
        title: "Concert tickets",
        description: "A shared experience.",
        pros: ["Memorable", "Personal"],
        cons: ["Date logistics"]
      },
      {
        title: "Nice everyday bag",
        description: "A useful upgrade.",
        pros: ["Practical", "Lasts longer"],
        cons: ["Taste risk"]
      }
    ]
  },
  {
    title: "Resolve the team meeting cadence",
    description: "The weekly meeting was drifting, so the team needed a clearer operating rhythm.",
    category: "work",
    deadline: isoDate(-2),
    stakes: "medium",
    emotional_load: 2,
    time_impact: 4,
    money_impact: 1,
    confidence: 4,
    owner: "Operations",
    workspace: "Brainwave Launch",
    project: "Startup product launch",
    tags: ["rituals", "meeting cadence"],
    affected_stakeholders: 6,
    workflow_stage: "outcome_reviewed",
    blockers: ["too many recurring meetings", "unclear decision owner"],
    missing_information: ["Which updates actually need discussion?"],
    next_action: "Pilot a shorter agenda for two weeks.",
    minimum_information: "Whether async updates cover status sharing.",
    reversible_option: "Try a two-week pilot before making it permanent.",
    do_nothing_cost: "The team keeps losing focus time to vague meetings.",
    fifteen_minute_action: "Draft the new 30-minute agenda and send it to the team.",
    status: "committed",
    final_decision: "Move to a 30-minute weekly decision meeting with async updates beforehand.",
    resolution_reason: "The reversible pilot reduces meeting load without removing team alignment.",
    outcome_notes: "The pilot cut meeting time and made decisions clearer.",
    outcome_quality: "good",
    confidence_after: 5,
    lesson_learned: "A reversible pilot helped the team stop debating the perfect process.",
    resolved_at: daysAgo(1),
    created_at: daysAgo(19),
    options: [
      {
        title: "Short weekly decision meeting",
        description: "Keep one concise meeting focused only on decisions and blockers.",
        pros: ["Preserves alignment", "Easy to test", "Cuts time waste"],
        cons: ["Requires agenda discipline"]
      },
      {
        title: "Fully async updates",
        description: "Replace the meeting with written updates.",
        pros: ["Maximum focus time", "Easy to document"],
        cons: ["Harder to resolve disagreement quickly"]
      }
    ]
  }
];

export async function seedDemoDataAction() {
  const { supabase, user } = await requireUser();

  const { count, error: countError } = await supabase
    .from("decisions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_demo", true);

  if (countError) return { ok: false, message: countError.message };

  if ((count ?? 0) >= demoDecisions.length) {
    return { ok: true, message: "Demo data already loaded." };
  }

  const { error: deleteError } = await supabase
    .from("decisions")
    .delete()
    .eq("user_id", user.id)
    .eq("is_demo", true);

  if (deleteError) return { ok: false, message: deleteError.message };

  const decisionRows = [];
  const optionRows = [];
  const prosConsRows = [];
  const eventRows = [];

  for (const demo of demoDecisions) {
    const { options, ...decision } = demo;
    const decisionId = randomUUID();

    decisionRows.push({
      ...decision,
      id: decisionId,
      user_id: user.id,
      status: decision.status ?? ("open" as const),
      workflow_stage: decision.workflow_stage ?? "captured",
      owner: decision.owner ?? "",
      workspace: decision.workspace ?? "",
      project: decision.project ?? "",
      tags: decision.tags ?? [],
      affected_stakeholders: decision.affected_stakeholders ?? 0,
      is_demo: true
    });

    eventRows.push({
      decision_id: decisionId,
      user_id: user.id,
      event_type: "demo_seeded",
      title: "Demo decision loaded",
      body: demo.description,
      metadata: { isDemo: true }
    });

    if (decision.status && decision.status !== "open") {
      eventRows.push({
        decision_id: decisionId,
        user_id: user.id,
        event_type: decision.status,
        title: "Demo decision resolved",
        body: decision.resolution_reason ?? "",
        metadata: { isDemo: true, finalDecision: decision.final_decision ?? "" }
      });
    }

    for (const option of options) {
      const { pros, cons, ...optionPayload } = option;
      const optionId = randomUUID();

      optionRows.push({
        ...optionPayload,
        id: optionId,
        decision_id: decisionId,
        user_id: user.id
      });

      prosConsRows.push(
        ...pros.map((body) => ({
          body,
          kind: "pro" as const,
          option_id: optionId,
          decision_id: decisionId,
          user_id: user.id
        })),
        ...cons.map((body) => ({
          body,
          kind: "con" as const,
          option_id: optionId,
          decision_id: decisionId,
          user_id: user.id
        }))
      );
    }
  }

  const { error: decisionsError } = await supabase
    .from("decisions")
    .insert(decisionRows);
  if (decisionsError) return { ok: false, message: decisionsError.message };

  const { error: eventsError } = await supabase
    .from("decision_events")
    .insert(eventRows);
  if (eventsError) return { ok: false, message: eventsError.message };

  const { error: optionsError } = await supabase
    .from("decision_options")
    .insert(optionRows);
  if (optionsError) return { ok: false, message: optionsError.message };

  const { error: prosConsError } = await supabase
    .from("decision_option_pros_cons")
    .insert(prosConsRows);
  if (prosConsError) return { ok: false, message: prosConsError.message };

  revalidatePath("/dashboard");
  revalidatePath("/decisions");
  revalidatePath("/review");
  revalidatePath("/analytics");
  return { ok: true, message: "Demo data loaded." };
}
