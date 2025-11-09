import { Outlet } from 'react-router-dom'

/**
 * ReviewsMobileShell provides the shared chrome for the reviews feature.
 * Child routes render inside the shell via <Outlet /> to keep navigation cohesive.
 */
export function ReviewsMobileShell(): JSX.Element {
  return (
    <div
      className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col justify-between rounded-[32px] border border-border/40 bg-gradient-to-b from-background/95 via-background/98 to-background/90 shadow-2xl shadow-primary/5 backdrop-blur-lg"
      data-testid="reviews-mobile-shell"
    >
      <Outlet />
    </div>
  )
}
