import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-card', className)} {...props} />
})

export interface CardMediaProps extends HTMLAttributes<HTMLDivElement> {}

export const CardMedia = forwardRef<HTMLDivElement, CardMediaProps>(function CardMedia(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-card__media', className)} {...props} />
})

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {}

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(function CardBody(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-card__body', className)} {...props} />
})
