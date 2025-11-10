import { StrictMode, Suspense, type JSX } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppProviders } from '@/app/providers'
import { AppRoutes } from '@/app/routes'
import { Spinner } from '@/components/ui/spinner'

export function AppBootstrapFallback(): JSX.Element {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Spinner />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <Suspense fallback={<AppBootstrapFallback />}>
        <AppRoutes />
      </Suspense>
    </AppProviders>
  </StrictMode>,
)
