import { AnimatePresence, motion } from "framer-motion"
import type { JSX } from "react"
import { useLocation, useOutlet } from "react-router-dom"

/**
 * ReviewsMobileShell provides the shared chrome for the reviews feature.
 * Child routes render inside the shell via <Outlet /> to keep navigation cohesive.
 */
export function ReviewsMobileShell(): JSX.Element {
  const location = useLocation()
  const outlet = useOutlet()

  return (
    <div className="relative flex min-h-screen w-full justify-center bg-gradient-to-br from-background via-background/95 to-primary/10 px-1.5 py-3 sm:px-4 sm:py-5 lg:px-8 lg:py-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_55%)]" />
      <div
        className="mx-auto flex w-full max-w-md flex-col justify-between rounded-[28px] border border-border/40 bg-gradient-to-b from-background/95 via-background/98 to-background/90 shadow-2xl shadow-primary/5 backdrop-blur-lg transition-[max-width] duration-300 sm:max-w-2xl lg:max-w-6xl lg:rounded-[36px] lg:border-border/30 lg:bg-background/95 lg:shadow-lg"
        data-testid="reviews-mobile-shell"
      >
        <AnimatePresence mode="wait" initial={false}>
          {outlet && (
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex w-full flex-1"
            >
              {outlet}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

