import { Outlet } from 'react-router-dom'

/**
 * ReviewsMobileShell provides the shared chrome for the reviews feature.
 * Child routes render inside the shell via <Outlet /> to keep navigation cohesive.
 */
export function ReviewsMobileShell(): JSX.Element {
  return (
    <div className="mobile-shell" data-testid="reviews-mobile-shell">
      <Outlet />
    </div>
  )
}
