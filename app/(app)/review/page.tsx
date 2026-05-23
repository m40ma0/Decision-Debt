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
          Weekly review
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Review mode</h1>
      </div>
      {queue.length === 0 ? (
        <EmptyState
          title="Nothing needs review"
          body="Open decisions and due deferred decisions will appear here."
          action={
            <Button asChild href="/decisions/new">
              New decision
            </Button>
          }
        />
      ) : (
        <ReviewClient queue={queue} />
      )}
    </div>
  );
}
