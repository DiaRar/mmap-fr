import { createBrowserRouter, RouterProvider } from "react-router-dom";
import type { JSX } from "react";

import { LoginPage, RegisterPage } from "@/features/auth";
import {
  ReviewsMobileShell,
  ReviewsPage,
  SuggestMealPage,
} from "@/features/reviews";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ReviewsMobileShell />,
    children: [
      {
        index: true,
        element: <ReviewsPage />,
      },
      {
        path: "suggest",
        element: <SuggestMealPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
]);

/**
 * AppRoutes centralises every route definition for the application.
 * New feature routes should be added here so navigation remains consistent.
 */
export function AppRoutes(): JSX.Element {
  return <RouterProvider router={router} />;
}
