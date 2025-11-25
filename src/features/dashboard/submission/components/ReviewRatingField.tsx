import { Star } from 'lucide-react';
import type { JSX } from 'react';

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field';

const RATINGS = [1, 2, 3, 4, 5];

export interface ReviewRatingFieldProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
}

export function ReviewRatingField({ value, onChange, error }: ReviewRatingFieldProps): JSX.Element {
  return (
    <Field>
      <FieldLabel>
        <FieldTitle>Rating</FieldTitle>
        <FieldDescription>Tap the stars to score the dish.</FieldDescription>
      </FieldLabel>
      <FieldContent>
        <div className="inline-flex gap-2">
          {RATINGS.map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => onChange(rating)}
              className="rounded-full border border-border/50 bg-white/80 p-2 text-primary transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              aria-pressed={value >= rating}
              aria-label={`Rate ${rating} star${rating > 1 ? 's' : ''}`}
            >
              <Star className="size-5" fill={value >= rating ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>
        <FieldError errors={error ? [{ message: error }] : undefined} />
      </FieldContent>
    </Field>
  );
}
