import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {
  lazy,
  Suspense,
  type JSX,
} from "react";

import { Spinner } from "@/components/ui/spinner";

const LoginPage = lazy(() =>
  import("@/features/auth/pages/LoginPage").then((module) => ({
    default: module.LoginPage,
  })),
);

const RegisterPage = lazy(() =>
  import("@/features/auth/pages/RegisterPage").then((module) => ({
    default: module.RegisterPage,
  })),
);

const ReviewsMobileShell = lazy(() =>
  import("@/features/reviews/layouts/ReviewsMobileShell").then((module) => ({
    default: module.ReviewsMobileShell,
  })),
);

const ReviewsPage = lazy(() =>
  import("@/features/reviews/pages/ReviewsPage").then((module) => ({
    default: module.ReviewsPage,
  })),
);

const SuggestMealPage = lazy(() =>
  import("@/features/reviews/pages/SuggestMealPage").then((module) => ({
    default: module.SuggestMealPage,
  })),
);

function RouteSpinner(): JSX.Element {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Spinner />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<RouteSpinner />}>
        <ReviewsMobileShell />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<RouteSpinner />}>
            <ReviewsPage />
          </Suspense>
        ),
      },
      {
        path: "suggest",
        element: (
          <Suspense fallback={<RouteSpinner />}>
            <SuggestMealPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={<RouteSpinner />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: "/register",
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
