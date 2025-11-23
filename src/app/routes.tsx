import { createBrowserRouter, Navigate, RouterProvider, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState, type JSX } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

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

type GuardProps = {
  children: JSX.Element;
};

function useAuthHydration(): boolean {
  const [hasHydrated, setHasHydrated] = useState(() => useAuthStore.persist?.hasHydrated?.() ?? false);

  useEffect(() => {
    const unsub = useAuthStore.persist?.onFinishHydration?.(() => {
      setHasHydrated(true);
    });

    if (useAuthStore.persist?.hasHydrated?.()) {
      setHasHydrated(true);
    }

    return () => {
      unsub?.();
    };
  }, []);

  return hasHydrated;
}

function ProtectedRoute({ children }: GuardProps): JSX.Element {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthHydration();
  const location = useLocation();

  if (!hasHydrated) {
    return <RouteSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function PublicOnlyRoute({ children }: GuardProps): JSX.Element {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthHydration();

  if (!hasHydrated) {
    return <RouteSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<RouteSpinner />}>
          <DashboardShell />
        </Suspense>
      </ProtectedRoute>
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
      <PublicOnlyRoute>
        <Suspense fallback={<RouteSpinner />}>
          <LoginPage />
        </Suspense>
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicOnlyRoute>
        <Suspense fallback={<RouteSpinner />}>
          <RegisterPage />
        </Suspense>
      </PublicOnlyRoute>
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
