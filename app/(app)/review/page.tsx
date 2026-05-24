import { ReviewClient } from "@/components/review/review-client";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { getReviewQueueDetails } from "@/lib/queries";

export default async function ReviewPage() {
  const queue = await getReviewQueueDetails();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">
          Review
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Decision Review</h1>
      </div>
      {queue.length === 0 ? (
        <EmptyState
          title="Review clear"
          body="No open decisions need attention."
          action={
            <Button asChild href="/decisions/new">
              New Decision
            </Button>
          }
        />
      ) : (
        <ReviewClient queue={queue} />
      )}
    </div>
  );
}
