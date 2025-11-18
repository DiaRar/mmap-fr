import type { JSX } from 'react';

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field';
import { ButtonGroup } from '@/components/ui/button-group';
import { AnimatedPillButton } from '@/components/ui/animated-pill-button';

export interface ReviewCurrencySelectorProps<TOption extends string> {
  value: TOption;
  options: readonly TOption[];
  onChange: (value: TOption) => void;
  error?: string;
}

export function ReviewCurrencySelector<TOption extends string>({
  value,
  options,
  onChange,
  error,
}: ReviewCurrencySelectorProps<TOption>): JSX.Element {
  return (
    <Field>
      <FieldLabel>
        <FieldTitle>Currency</FieldTitle>
        <FieldDescription>Switch for USD if you expensed the meal.</FieldDescription>
      </FieldLabel>
      <FieldContent>
        <ButtonGroup className="flex flex-wrap gap-2">
          {options.map((symbol) => (
            <AnimatedPillButton
              key={symbol}
              type="button"
              isActive={value === symbol}
              onClick={() => onChange(symbol)}
              aria-label={`Use ${symbol}`}
            >
              {symbol}
            </AnimatedPillButton>
          ))}
        </ButtonGroup>
        <FieldError errors={error ? [{ message: error }] : undefined} />
      </FieldContent>
    </Field>
  );
}
