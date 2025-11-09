import type { JSX, PropsWithChildren } from 'react'

/**
 * AppProviders is the single place to configure global context providers,
 * including the shadcn/ui provider tree (e.g. TooltipProvider, ThemeProvider).
 * Add new providers here so routes remain clean and testable.
 */
export function AppProviders({ children }: PropsWithChildren): JSX.Element {
  return <>{children}</>
}
