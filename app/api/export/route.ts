import { NextResponse } from "next/server";
import { calculateDecisionDebtScore } from "@/lib/scoring";
import { getSessionUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "json";
  const { supabase, user } = await getSessionUser();

  if (!supabase || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("decisions")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const decisions = (data ?? []).map((decision) => ({
    ...decision,
    debt: calculateDecisionDebtScore(decision)
  }));

  if (format === "csv") {
    const rows = [
      [
        "title",
        "status",
        "workflow_stage",
        "owner",
        "workspace",
        "project",
        "tags",
        "deadline",
        "score",
        "label",
        "blockers",
        "affected_stakeholders",
        "updated_at"
      ],
      ...decisions.map((decision) => [
        decision.title,
        decision.status,
        decision.workflow_stage,
        decision.owner,
        decision.workspace,
        decision.project,
        decision.tags.join(" | "),
        decision.deadline ?? "",
        decision.debt.score,
        decision.debt.label,
        decision.blockers.join(" | "),
        decision.affected_stakeholders,
        decision.updated_at
      ])
    ];
    const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
    return new NextResponse(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": 'attachment; filename="decision-debt-export.csv"'
      }
    });
  }

  if (format === "md") {
    const markdown = [
      "# Decision Debt Export",
      "",
      ...decisions.map((decision) => [
        `## ${decision.title}`,
        `- Status: ${decision.status}`,
        `- Workflow: ${decision.workflow_stage}`,
        `- Owner: ${decision.owner || "Unassigned"}`,
        `- Workspace: ${decision.workspace || "None"}`,
        `- Project: ${decision.project || "None"}`,
        `- Tags: ${decision.tags.length > 0 ? decision.tags.map((tag) => `#${tag}`).join(", ") : "None"}`,
        `- Deadline: ${formatDate(decision.deadline)}`,
        `- Debt score: ${decision.debt.score} (${decision.debt.label})`,
        `- Blockers: ${decision.blockers.length > 0 ? decision.blockers.join(", ") : "None"}`,
        `- Stakeholders affected: ${decision.affected_stakeholders}`,
        ""
      ]).flat()
    ].join("\n");

    return new NextResponse(markdown, {
      headers: {
        "content-type": "text/markdown; charset=utf-8",
        "content-disposition": 'attachment; filename="decision-debt-export.md"'
      }
    });
  }

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    decisions
  });
}

