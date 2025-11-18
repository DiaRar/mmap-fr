import { Link } from 'react-router-dom';
import type { JSX } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import type { ReviewDraft } from '@/features/dashboard/types';

export interface ReviewDraftListProps {
  drafts: ReviewDraft[];
}

export function ReviewDraftList({ drafts }: ReviewDraftListProps): JSX.Element | null {
  if (drafts.length === 0) {
    return null;
  }

  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-base font-semibold text-foreground">Recent drafts</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          We keep the last five submissions in case you want to make edits before publishing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 px-0">
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className="flex items-center justify-between rounded-2xl border border-border/40 bg-muted/30 px-4 py-3 text-sm"
          >
            <div>
              <p className="font-semibold text-foreground">
                {draft.mealName}{' '}
                <span className="text-xs uppercase text-muted-foreground">
                  {draft.rating}★ {draft.currency}
                  {draft.price}
                </span>
              </p>
              <p className="text-muted-foreground">{draft.restaurantName}</p>
            </div>
            <Link to="/" className="text-xs font-semibold text-primary">
              Open
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
