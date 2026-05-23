import { ArrowLeft } from "lucide-react";
import { DecisionDetailClient } from "@/components/decisions/decision-detail-client";
import { DecisionForm } from "@/components/decisions/decision-form";
import { Button } from "@/components/ui/button";
import { getDecisionDetail } from "@/lib/queries";

export default async function DecisionDetailPage({
  params
}: {
  params: { id: string };
}) {
  const detail = await getDecisionDetail(params.id);

  return (
    <div className="space-y-6">
      <Button asChild href="/decisions" variant="ghost" size="sm">
        <ArrowLeft className="h-4 w-4" />
        Inbox
      </Button>
      <DecisionDetailClient detail={detail} />
      <DecisionForm decision={detail.decision} />
    </div>
  );
}
