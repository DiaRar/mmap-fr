import type { JSX } from 'react';

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field';
import { AnimatedPillButton } from '@/components/ui/animated-pill-button';

export interface DietaryTagSelectorProps<TOption extends string> {
  options: readonly TOption[];
  value: TOption[];
  onToggle: (value: TOption) => void;
  error?: string;
}

export function DietaryTagSelector<TOption extends string>({
  options,
  value,
  onToggle,
  error,
}: DietaryTagSelectorProps<TOption>): JSX.Element {
  return (
    <Field>
      <FieldLabel>
        <FieldTitle>Dietary context</FieldTitle>
        <FieldDescription>
          Tap every tag that applies. We use this to personalise the map & feed.
        </FieldDescription>
      </FieldLabel>
      <FieldContent>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const isActive = value.includes(option);
            return (
              <AnimatedPillButton
                key={option}
                type="button"
                isActive={isActive}
                onClick={() => onToggle(option)}
                aria-label={`Toggle ${option}`}
              >
                {option}
              </AnimatedPillButton>
            );
          })}
        </div>
        <FieldError errors={error ? [{ message: error }] : undefined} />
      </FieldContent>
    </Field>
  );
}
