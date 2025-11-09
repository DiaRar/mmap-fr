import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {}

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-separator', className)} {...props} />
})
