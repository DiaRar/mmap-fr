import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

type ButtonVariant = 'primary' | 'outline' | 'ghost'
type ButtonSize = 'default' | 'icon'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'default', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      data-variant={variant}
      data-size={size === 'icon' ? 'icon' : undefined}
      className={cn('ui-button', className)}
      {...props}
    />
  )
})
