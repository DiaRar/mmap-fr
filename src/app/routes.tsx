import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense, type JSX } from 'react';

import { Spinner } from '@/components/ui/spinner';

const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((module) => ({
    default: module.LoginPage,
  }))
);

const RegisterPage = lazy(() =>
  import('@/features/auth/pages/RegisterPage').then((module) => ({
    default: module.RegisterPage,
  }))
);

const DashboardShell = lazy(() =>
  import('@/features/dashboard/layouts/DashboardShell').then((module) => ({
    default: module.DashboardShell,
  }))
);

const FeedPage = lazy(() =>
  import('@/features/dashboard/feed/pages/FeedPage').then((module) => ({
    default: module.FeedPage,
  }))
);

const MapPage = lazy(() =>
  import('@/features/dashboard/map/pages/MapPage').then((module) => ({
    default: module.MapPage,
  }))
);

const RecommendationsPage = lazy(() =>
  import('@/features/dashboard/recommendations/pages/RecommendationsPage').then((module) => ({
    default: module.RecommendationsPage,
  }))
);

const ReviewFormPage = lazy(() =>
  import('@/features/dashboard/submission/pages/ReviewFormPage').then((module) => ({
    default: module.ReviewFormPage,
  }))
);

function RouteSpinner(): JSX.Element {
  return (
    <div className="grid min-h-screen w-full place-items-center p-6">
      <Spinner />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<RouteSpinner />}>
        <DashboardShell />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<RouteSpinner />}>
            <FeedPage />
          </Suspense>
        ),
      },
      {
        path: 'map',
        element: (
          <Suspense fallback={<RouteSpinner />}>
            <MapPage />
          </Suspense>
        ),
      },
      {
        path: 'recommendations',
        element: (
          <Suspense fallback={<RouteSpinner />}>
            <RecommendationsPage />
          </Suspense>
        ),
      },
      {
        path: 'reviews/new',
        element: (
          <Suspense fallback={<RouteSpinner />}>
            <ReviewFormPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<RouteSpinner />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<RouteSpinner />}>
        <RegisterPage />
      </Suspense>
    ),
  },
]);

/**
 * AppRoutes centralises every route definition for the application.
 * New feature routes should be added here so navigation remains consistent.
 */
export function AppRoutes(): JSX.Element {
  return <RouterProvider router={router} />;
}
