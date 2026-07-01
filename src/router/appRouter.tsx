import RootLayout from "@/layout/rootLayout";
import AuthPage from "@/pages/authPage";
import HomePage from "@/pages/homePage";
import JsonPage from "@/pages/jsonPage";
import PenPage from "@/pages/penPage";
import PlaygroundPage from "@/pages/playgroundPage";
import DashboardPage from "@/pages/dashboardPage";
import RoomPage from "@/pages/roomPage";
import ResetPasswordPage from "@/pages/resetPasswordPage";
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
        path: "/playground",
        element: <PlaygroundPage />,
      },
      {
        path: "/json",
        element: <JsonPage />,
      },
      {
        path: "/pen",
        element: <PenPage />,
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
]);

export default router;
