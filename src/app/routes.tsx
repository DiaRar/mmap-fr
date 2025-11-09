import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ReviewsMobileShell, ReviewsPage } from '@/features/reviews'
import type { JSX } from 'react'

const router = createBrowserRouter([
  {
    element: <ReviewsMobileShell />,
    children: [
      {
        path: '/',
        element: <ReviewsPage />,
      },
    ],
  },
])

/**
 * AppRoutes centralises every route definition for the application.
 * New feature routes should be added here so navigation remains consistent.
 */
export function AppRoutes(): JSX.Element {
  return <RouterProvider router={router} />
}
