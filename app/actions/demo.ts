"use server";

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
    title: "Choose the launch scope for the Design4Future submission",
    description: "Pick the smallest set of features that makes the story clear without overbuilding.",
    category: "work",
    deadline: isoDate(1),
    stakes: "high",
    emotional_load: 5,
    time_impact: 5,
    money_impact: 2,
    confidence: 2,
    blockers: ["unclear judging priority", "limited build time", "too many feature ideas"],
    missing_information: ["Which demo path will be strongest?", "What can be cut safely?"],
    next_action: "Compare scoring rubric against the top feature list.",
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
    title: "Decide whether to renew the apartment lease",
    description: "The renewal offer is higher, but moving has hidden costs and time pressure.",
    category: "money",
    deadline: isoDate(3),
    stakes: "high",
    emotional_load: 4,
    time_impact: 4,
    money_impact: 5,
    confidence: 2,
    blockers: ["waiting for landlord reply", "moving quotes missing"],
    missing_information: ["Final rent offer", "Two mover quotes", "Commute change"],
    next_action: "Ask landlord for final renewal terms.",
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
    title: "Pick a health insurance plan",
    description: "Open enrollment ends soon and plan details are hard to compare.",
    category: "health",
    deadline: isoDate(5),
    stakes: "high",
    emotional_load: 4,
    time_impact: 3,
    money_impact: 5,
    confidence: 1,
    blockers: ["deductibles confusing", "doctor coverage unknown"],
    missing_information: ["Primary doctor network", "Expected prescription costs"],
    next_action: "Call clinic and confirm accepted plans.",
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
    title: "Commit to a thesis topic",
    description: "Several topics are viable, but the advisor meeting needs a direction.",
    category: "school",
    deadline: isoDate(8),
    stakes: "medium",
    emotional_load: 4,
    time_impact: 5,
    money_impact: 1,
    confidence: 3,
    blockers: ["advisor feedback pending"],
    missing_information: ["Dataset access", "Advisor preference"],
    next_action: "Send advisor a two-option brief.",
    created_at: daysAgo(21),
    options: [
      {
        title: "Decision fatigue research",
        description: "Study how unresolved choices affect daily planning.",
        pros: ["Matches interests", "Original angle"],
        cons: ["Harder to measure"]
      },
      {
        title: "Calendar behavior analysis",
        description: "Analyze scheduling patterns and productivity.",
        pros: ["Cleaner dataset", "Easier scope"],
        cons: ["Less distinctive"]
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
    title: "Decide what laptop to buy",
    description: "Current machine is slowing down during builds.",
    category: "money",
    deadline: isoDate(14),
    stakes: "medium",
    emotional_load: 2,
    time_impact: 4,
    money_impact: 4,
    confidence: 3,
    blockers: ["budget approval", "model comparison"],
    missing_information: ["Trade-in value", "Team hardware policy"],
    next_action: "Get budget approval from finance.",
    created_at: daysAgo(15),
    options: [
      {
        title: "Buy now",
        description: "Replace the machine this week.",
        pros: ["Immediate speed gain", "Less build friction"],
        cons: ["Higher upfront cost"]
      },
      {
        title: "Wait for next refresh",
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
    title: "Pick the customer interview segment",
    description: "The team can only recruit one segment before the sprint review.",
    category: "work",
    deadline: isoDate(4),
    stakes: "high",
    emotional_load: 3,
    time_impact: 4,
    money_impact: 3,
    confidence: 2,
    blockers: ["sample size small", "sales has conflicting input"],
    missing_information: ["Highest churn segment", "Recruiting feasibility"],
    next_action: "Ask sales ops for churn by segment.",
    created_at: daysAgo(17),
    options: [
      {
        title: "Interview new managers",
        description: "Focus on people making first purchase decisions.",
        pros: ["High buying signal", "Fresh pain points"],
        cons: ["Harder to recruit"]
      },
      {
        title: "Interview power users",
        description: "Learn from existing heavy usage patterns.",
        pros: ["Easy access", "Rich workflows"],
        cons: ["May miss acquisition friction"]
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
  }
];

export async function seedDemoDataAction() {
  const { supabase, user } = await requireUser();

  const { error: deleteError } = await supabase
    .from("decisions")
    .delete()
    .eq("user_id", user.id)
    .eq("is_demo", true);

  if (deleteError) return { ok: false, message: deleteError.message };

  for (const demo of demoDecisions) {
    const { options, ...decision } = demo;
    const { data: inserted, error: decisionError } = await supabase
      .from("decisions")
      .insert({
        ...decision,
        user_id: user.id,
        status: "open",
        is_demo: true
      })
      .select("id")
      .single();

    if (decisionError) return { ok: false, message: decisionError.message };

    await supabase.from("decision_events").insert({
      decision_id: inserted.id,
      user_id: user.id,
      event_type: "demo_seeded",
      title: "Demo decision loaded",
      body: demo.description,
      metadata: { isDemo: true }
    });

    for (const option of options) {
      const { pros, cons, ...optionPayload } = option;
      const { data: insertedOption, error: optionError } = await supabase
        .from("decision_options")
        .insert({
          ...optionPayload,
          decision_id: inserted.id,
          user_id: user.id
        })
        .select("id")
        .single();

      if (optionError) return { ok: false, message: optionError.message };

      const rows = [
        ...pros.map((body) => ({
          body,
          kind: "pro" as const,
          option_id: insertedOption.id,
          decision_id: inserted.id,
          user_id: user.id
        })),
        ...cons.map((body) => ({
          body,
          kind: "con" as const,
          option_id: insertedOption.id,
          decision_id: inserted.id,
          user_id: user.id
        }))
      ];

      if (rows.length > 0) {
        const { error: prosConsError } = await supabase
          .from("decision_option_pros_cons")
          .insert(rows);
        if (prosConsError) return { ok: false, message: prosConsError.message };
      }
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/decisions");
  revalidatePath("/review");
  revalidatePath("/analytics");
  return { ok: true, message: "Demo data loaded." };
}
