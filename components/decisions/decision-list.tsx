"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpDown, Calendar, Search, Trash2 } from "lucide-react";
import { deleteDecisionAction } from "@/app/actions/decisions";
import { DebtBadge } from "@/components/debt-badge";
import { TrapTags } from "@/components/trap-tags";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import { useToast } from "@/components/toast-provider";
import {
  categoryLabels,
  decisionCategories,
  decisionStatuses,
  statusLabels
} from "@/lib/constants";
import type { DecisionWithScore } from "@/lib/queries";
import { daysBetween, formatDate } from "@/lib/utils";

type SortKey = "score" | "deadline" | "age" | "category";

export function DecisionList({ decisions }: { decisions: DecisionWithScore[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [score, setScore] = useState("all");
  const [sort, setSort] = useState<SortKey>("score");

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return decisions
      .filter((decision) => {
        const matchesSearch =
          normalized.length === 0 ||
          [decision.title, decision.description, decision.next_action]
            .join(" ")
            .toLowerCase()
            .includes(normalized);
        const matchesStatus = status === "all" || decision.status === status;
        const matchesCategory = category === "all" || decision.category === category;
        const matchesScore =
          score === "all" || decision.debt.label.toLowerCase() === score;
        return matchesSearch && matchesStatus && matchesCategory && matchesScore;
      })
      .sort((a, b) => {
        if (sort === "score") return b.debt.score - a.debt.score;
        if (sort === "deadline") {
          const aDate = a.deadline ? new Date(a.deadline).getTime() : Infinity;
          const bDate = b.deadline ? new Date(b.deadline).getTime() : Infinity;
          return aDate - bDate;
        }
        if (sort === "age") {
          return (
            daysBetween(new Date(b.created_at), new Date()) -
            daysBetween(new Date(a.created_at), new Date())
          );
        }
        return a.category.localeCompare(b.category);
      });
  }, [category, decisions, score, search, sort, status]);

  function remove(id: string) {
    if (
      !window.confirm(
        "Delete this decision and its history?"
      )
    ) {
      return;
    }

    setPendingId(id);
    startTransition(async () => {
      const result = await deleteDecisionAction(id);
      toast({ title: result.message, tone: result.ok ? "success" : "error" });
      setPendingId(null);
      if (result.ok) router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_160px_160px_160px_160px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <Input
              className="pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search decisions"
            />
          </div>
          <Select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All statuses</option>
            {decisionStatuses.map((item) => (
              <option key={item} value={item}>
                {statusLabels[item]}
              </option>
            ))}
          </Select>
          <Select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="all">All categories</option>
            {decisionCategories.map((item) => (
              <option key={item} value={item}>
                {categoryLabels[item]}
              </option>
            ))}
          </Select>
          <Select value={score} onChange={(event) => setScore(event.target.value)}>
            <option value="all">All scores</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </Select>
          <Select value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>
            <option value="score">Sort by score</option>
            <option value="deadline">Sort by deadline</option>
            <option value="age">Sort by age</option>
            <option value="category">Sort by category</option>
          </Select>
        </div>
      </Card>

      <div className="overflow-hidden rounded-lg border border-ink/10 bg-white/82 shadow-soft">
        <div className="hidden grid-cols-[minmax(280px,1fr)_130px_130px_130px_80px] gap-4 border-b border-ink/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink/45 lg:grid">
          <span>Decision</span>
          <span>Status</span>
          <span>Deadline</span>
          <span className="flex items-center gap-1">
            <ArrowUpDown className="h-3 w-3" />
            Debt
          </span>
          <span />
        </div>
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink/55">No matches.</div>
        ) : (
          filtered.map((decision) => (
            <div
              key={decision.id}
              className="grid gap-3 border-b border-ink/10 p-4 last:border-b-0 lg:grid-cols-[minmax(280px,1fr)_130px_130px_130px_80px] lg:items-center"
            >
              <Link href={`/decisions/${decision.id}`} className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate font-semibold">{decision.title}</h2>
                  <Badge tone="blue">{categoryLabels[decision.category]}</Badge>
                </div>
                <p className="mt-1 line-clamp-1 text-sm text-ink/55">
                  {decision.description || decision.next_action || "No details"}
                </p>
                <div className="mt-2">
                  <TrapTags traps={decision.traps} limit={3} compact />
                </div>
              </Link>
              <Badge tone={decision.status === "open" ? "green" : "neutral"}>
                {statusLabels[decision.status]}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-ink/60">
                <Calendar className="h-4 w-4" />
                {formatDate(decision.deadline)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold">{decision.debt.score}</span>
                <DebtBadge label={decision.debt.label} />
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label="Remove decision"
                  title="Delete"
                  disabled={pendingId === decision.id}
                  onClick={() => remove(decision.id)}
                >
                  <Trash2 className="h-4 w-4 text-coral" />
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
