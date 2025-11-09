import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {}

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-scroll-area', className)} {...props} />
})
