import { ScrollArea } from '@/components/ui/scroll-area';
import type { JSX } from 'react';
import { type ReviewResponse } from '@/features/dashboard/types';
import { ReviewCard } from './ReviewCard';

export interface FeedListProps {
  reviews: ReviewResponse[];
}

export function FeedList({ reviews }: FeedListProps): JSX.Element {
  if (reviews.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed bg-muted/20 p-8 text-center">
        <p className="text-base font-semibold text-foreground">No reviews found</p>
        <p className="max-w-[260px] text-sm text-muted-foreground">
          Be the first to review a meal nearby!
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="-mx-2 flex-1 px-2">
      <div className="flex flex-col gap-4 pb-16">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </ScrollArea>
  );
}

