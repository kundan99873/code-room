/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { lazy, Suspense } from "react";
import RootLayout from "@/layout/rootLayout";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";

function FullPageSkeleton() {
  return (
    <div className="min-h-screen bg-background flex flex-col p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="md:col-span-3 space-y-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

const Loadable = (Component: React.ComponentType<any>) => (props: any) => (
  <Suspense fallback={<FullPageSkeleton />}>
    <Component {...props} />
  </Suspense>
);

const AuthPage = Loadable(lazy(() => import("@/pages/authPage")));
const HomePage = Loadable(lazy(() => import("@/pages/homePage")));
const JsonPage = Loadable(lazy(() => import("@/pages/jsonPage")));
const PenPage = Loadable(lazy(() => import("@/pages/penPage")));
const PlaygroundPage = Loadable(lazy(() => import("@/pages/playgroundPage")));
const DashboardPage = Loadable(lazy(() => import("@/pages/dashboardPage")));
const RoomPage = Loadable(lazy(() => import("@/pages/roomPage")));
const ResetPasswordPage = Loadable(lazy(() => import("@/pages/resetPasswordPage")));
const SnippetPage = Loadable(lazy(() => import("@/pages/snippetPage")));
const SnippetEmbedPage = Loadable(lazy(() => import("@/pages/snippetEmbedPage")));

// Protected Route Guard
function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <FullPageSkeleton />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}

// Guest Route Guard (Redirects to dashboard if already logged in)
function GuestRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <FullPageSkeleton />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/online-compiler",
        element: <PlaygroundPage />,
      },
      {
        path: "/json-formatter",
        element: <JsonPage />,
      },
      {
        path: "/web-pen",
        element: <PenPage />,
      },
      // Public Shareable Code Snippet Routes
      {
        path: "/s/:id",
        element: <SnippetPage />,
      },
      {
        path: "/snippet/:id",
        element: <SnippetPage />,
      },
      // Legacy redirects for SEO
      {
        path: "/playground",
        element: <Navigate to="/online-compiler" replace />,
      },
      {
        path: "/json",
        element: <Navigate to="/json-formatter" replace />,
      },
      {
        path: "/pen",
        element: <Navigate to="/web-pen" replace />,
      },
      // Guest-only routes
      {
        element: <GuestRoute />,
        children: [
          {
            path: "/auth",
            element: <AuthPage />,
          },
          {
            path: "/reset-password",
            element: <ResetPasswordPage />,
          },
        ],
      },
      // Protected-only routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
          {
            path: "/room/:id",
            element: <RoomPage />,
          },
        ],
      },
      // Fallback route
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
  // Standalone embed route for blogs and documentation (no root layout shell)
  {
    path: "/embed/s/:id",
    element: <SnippetEmbedPage />,
  },
]);

export default router;
