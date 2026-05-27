import { notFound } from "next/navigation";
import type {
  Decision,
  DecisionEvent,
  DecisionOption,
  DecisionOptionProCon
} from "@/lib/database.types";
import { calculateDecisionDebtScore, type DebtScore } from "@/lib/scoring";
import { daysBetween } from "@/lib/utils";
import { requireUser } from "@/lib/auth";
import {
  detectDecisionTraps,
  getCostOfWaiting,
  type TrapTag
} from "@/lib/decision-intelligence";

export type DecisionWithScore = Decision & {
  debt: DebtScore;
  traps: TrapTag[];
  costOfWaiting: ReturnType<typeof getCostOfWaiting>;
};

export type OptionWithProsCons = DecisionOption & {
  pros: DecisionOptionProCon[];
  cons: DecisionOptionProCon[];
};

export type DecisionDetail = {
  decision: DecisionWithScore;
  options: OptionWithProsCons[];
  events: DecisionEvent[];
};

export async function getUserDecisions() {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("decisions")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((decision) => ({
    ...decision,
    debt: calculateDecisionDebtScore(decision),
    traps: detectDecisionTraps(decision),
    costOfWaiting: getCostOfWaiting(decision)
  }));
}

export async function getDecisionDetail(id: string): Promise<DecisionDetail> {
  const { supabase, user } = await requireUser();
  const { data: decision, error: decisionError } = await supabase
    .from("decisions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (decisionError) throw new Error(decisionError.message);
  if (!decision) notFound();

  const [{ data: options, error: optionsError }, { data: prosCons, error: prosError }, { data: events, error: eventsError }] =
    await Promise.all([
      supabase
        .from("decision_options")
        .select("*")
        .eq("decision_id", id)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("decision_option_pros_cons")
        .select("*")
        .eq("decision_id", id)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("decision_events")
        .select("*")
        .eq("decision_id", id)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
    ]);

  if (optionsError) throw new Error(optionsError.message);
  if (prosError) throw new Error(prosError.message);
  if (eventsError) throw new Error(eventsError.message);

  const groupedOptions = (options ?? []).map((option) => ({
    ...option,
    pros: (prosCons ?? []).filter(
      (item) => item.option_id === option.id && item.kind === "pro"
    ),
    cons: (prosCons ?? []).filter(
      (item) => item.option_id === option.id && item.kind === "con"
    )
  }));

  return {
    decision: {
      ...decision,
      debt: calculateDecisionDebtScore(decision),
      traps: detectDecisionTraps(decision),
      costOfWaiting: getCostOfWaiting(decision)
    },
    options: groupedOptions,
    events: events ?? []
  };
}

export async function getDashboardData() {
  const decisions = await getUserDecisions();
  const today = new Date();
  const weekFromNow = new Date();
  weekFromNow.setDate(today.getDate() + 7);

  const open = decisions.filter((decision) => decision.status === "open");
  const active = decisions.filter((decision) =>
    ["open", "deferred"].includes(decision.status)
  );
  const critical = open.filter((decision) => decision.debt.label === "Critical");
  const dueThisWeek = active.filter((decision) => {
    const deadline = decision.deadline
      ? new Date(`${decision.deadline}T00:00:00`)
      : null;
    const review = decision.review_date
      ? new Date(`${decision.review_date}T00:00:00`)
      : null;
    return [deadline, review].some(
      (date) => date && date <= weekFromNow && date >= today
    );
  });
  const averageAge =
    open.length === 0
      ? 0
      : Math.round(
          open.reduce(
            (total, decision) =>
              total + Math.max(0, daysBetween(new Date(decision.created_at), today)),
            0
          ) / open.length
        );

  const topToday = [...open]
    .sort((a, b) => b.debt.score - a.debt.score)
    .slice(0, 3);

  const categoryBreakdown = open.reduce<Record<string, number>>((acc, decision) => {
    acc[decision.category] = (acc[decision.category] ?? 0) + 1;
    return acc;
  }, {});

  const recentlyResolved = decisions
    .filter((decision) => decision.status !== "open")
    .sort(
      (a, b) =>
        new Date(b.resolved_at ?? b.updated_at).getTime() -
        new Date(a.resolved_at ?? a.updated_at).getTime()
    )
    .slice(0, 6);

  return {
    decisions,
    open,
    critical,
    dueThisWeek,
    averageAge,
    topToday,
    categoryBreakdown,
    recentlyResolved
  };
}

export async function getReviewQueue() {
  const decisions = await getUserDecisions();
  const today = new Date();

  return decisions
    .filter((decision) => {
      if (decision.status === "open") return true;
      if (decision.status !== "deferred" || !decision.review_date) return false;
      return new Date(`${decision.review_date}T00:00:00`) <= today;
    })
    .sort((a, b) => b.debt.score - a.debt.score);
}

export async function getReviewQueueDetails() {
  const { supabase, user } = await requireUser();
  const queue = await getReviewQueue();
  const ids = queue.map((decision) => decision.id);

  if (ids.length === 0) return [];

  const [{ data: options, error: optionsError }, { data: prosCons, error: prosError }] =
    await Promise.all([
      supabase
        .from("decision_options")
        .select("*")
        .in("decision_id", ids)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("decision_option_pros_cons")
        .select("*")
        .in("decision_id", ids)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
    ]);

  if (optionsError) throw new Error(optionsError.message);
  if (prosError) throw new Error(prosError.message);

  return queue.map((decision) => ({
    ...decision,
    options: (options ?? [])
      .filter((option) => option.decision_id === decision.id)
      .map((option) => ({
        ...option,
        pros: (prosCons ?? []).filter(
          (item) => item.option_id === option.id && item.kind === "pro"
        ),
        cons: (prosCons ?? []).filter(
          (item) => item.option_id === option.id && item.kind === "con"
        )
      }))
  }));
}

export async function getAnalyticsData() {
  const decisions = await getUserDecisions();
  const resolved = decisions.filter((decision) => decision.status !== "open");
  const open = decisions.filter((decision) => decision.status === "open");
  const categoryCounts = decisions.reduce<Record<string, number>>((acc, decision) => {
    acc[decision.category] = (acc[decision.category] ?? 0) + 1;
    return acc;
  }, {});
  const totalDebtScore = open.reduce((total, decision) => total + decision.debt.score, 0);
  const debtReduced = resolved.reduce(
    (total, decision) =>
      total +
      calculateDecisionDebtScore({
        ...decision,
        status: "open"
      }).score,
    0
  );
  const today = new Date();
  const averageAgeByCategory = open.reduce<Record<string, { total: number; count: number }>>(
    (acc, decision) => {
      const item = acc[decision.category] ?? { total: 0, count: 0 };
      item.total += Math.max(0, daysBetween(new Date(decision.created_at), today));
      item.count += 1;
      acc[decision.category] = item;
      return acc;
    },
    {}
  );
  const blockerCounts = decisions
    .flatMap((decision) => decision.blockers)
    .reduce<Record<string, number>>((acc, blocker) => {
      acc[blocker] = (acc[blocker] ?? 0) + 1;
      return acc;
    }, {});

  const resolutionDurations = resolved
    .filter((decision) => decision.resolved_at)
    .map((decision) => ({
      id: decision.id,
      title: decision.title,
      days: Math.max(
        0,
        daysBetween(new Date(decision.created_at), new Date(decision.resolved_at!))
      ),
      status: decision.status,
      category: decision.category,
      outcome: decision.outcome_notes || decision.final_decision
    }));

  const averageResolutionDays =
    resolutionDurations.length === 0
      ? 0
      : Math.round(
          resolutionDurations.reduce((total, item) => total + item.days, 0) /
            resolutionDurations.length
        );

  const statusCounts = decisions.reduce<Record<string, number>>((acc, decision) => {
    acc[decision.status] = (acc[decision.status] ?? 0) + 1;
    return acc;
  }, {});

  const trapCounts = open
    .flatMap((decision) => decision.traps)
    .reduce<Record<string, number>>((acc, trap) => {
      acc[trap.label] = (acc[trap.label] ?? 0) + 1;
      return acc;
    }, {});

  const categoryRisk = Object.entries(
    open.reduce<Record<string, { total: number; count: number }>>((acc, decision) => {
      const item = acc[decision.category] ?? { total: 0, count: 0 };
      item.total += decision.debt.score;
      item.count += 1;
      acc[decision.category] = item;
      return acc;
    }, {})
  )
    .map(([category, value]) => ({
      category,
      averageDebt: Math.round(value.total / value.count),
      count: value.count
    }))
    .sort((a, b) => b.averageDebt - a.averageDebt);

  const highestRiskCategory = categoryRisk[0] ?? null;
  const topTrap = Object.entries(trapCounts).sort(([, a], [, b]) => b - a)[0] ?? null;

  const debtTrend = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const label = date.toLocaleDateString("en", { month: "short", day: "numeric" });
    const score = decisions.reduce((total, decision) => {
      const created = new Date(decision.created_at);
      const resolvedAt = decision.resolved_at ? new Date(decision.resolved_at) : null;
      const existed = created <= date && (!resolvedAt || resolvedAt >= date);
      return existed ? total + decision.debt.score : total;
    }, 0);
    return { label, score };
  });

  return {
    decisions,
    open,
    resolved,
    categoryCounts,
    totalDebtScore,
    debtReduced,
    averageAgeByCategory,
    blockerCounts,
    statusCounts,
    trapCounts,
    categoryRisk,
    highestRiskCategory,
    topTrap,
    debtTrend,
    resolutionDurations,
    averageResolutionDays
  };
}
