import { Plus } from "lucide-react";
import { DecisionList } from "@/components/decisions/decision-list";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { getUserDecisions } from "@/lib/queries";

export default async function DecisionsPage() {
  const decisions = await getUserDecisions();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">
            Inbox
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Decisions</h1>
        </div>
        <Button asChild href="/decisions/new">
          <Plus className="h-4 w-4" />
          New decision
        </Button>
      </div>

      {decisions.length === 0 ? (
        <EmptyState
          title="Your inbox is empty"
          body="Capture the choice that keeps coming back to mind."
          action={
            <Button asChild href="/decisions/new">
              <Plus className="h-4 w-4" />
              New decision
            </Button>
          }
        />
      ) : (
        <DecisionList decisions={decisions} />
      )}
    </div>
  );
}
