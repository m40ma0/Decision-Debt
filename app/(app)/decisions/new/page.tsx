import { DecisionForm } from "@/components/decisions/decision-form";

export default function NewDecisionPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">
          Create
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">
          New Decision
        </h1>
      </div>
      <DecisionForm />
    </div>
  );
}
