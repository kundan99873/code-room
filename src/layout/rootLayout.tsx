import Footer from "@/components/common/footer";
import { Navbar } from "@/components/common/header/navbar";
import { Outlet, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Toaster, toast } from "react-hot-toast";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";

function GlobalSocketListener() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const socketUrl = import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? "http://localhost:3000" : window.location.origin);
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("Global socket connected for user:", user.email);
    });

    socket.on("room-invited", (data: { roomId: string; roomName: string }) => {
      toast.success(`You have been invited to room "${data.roomName}"!`, {
        icon: "🎉",
        duration: 5000,
      });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    });

    socket.on("join-request-handled", (data: { roomId: string; status: "approved" | "rejected" }) => {
      if (data.status === "approved") {
        toast.success("Your join request was approved!", {
          icon: "✅",
          duration: 5000,
        });
        queryClient.invalidateQueries({ queryKey: ["rooms"] });
      }
    });

    socket.on("room-removed", () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    });

    return () => {
      socket.disconnect();
    };
  }, [user, queryClient]);

  return null;
}

export default function RootLayout() {
  const location = useLocation();

  // Normalize the pathname by removing any trailing slash (except for just "/")
  const path = location.pathname.endsWith("/") && location.pathname.length > 1
    ? location.pathname.slice(0, -1)
    : location.pathname;

  // Hide global navbar and footer on full-screen workspace pages
  const isWorkspace =
    path.startsWith("/room/") ||
    path === "/web-pen" ||
    path === "/online-compiler" ||
    path === "/json-formatter";

  return (
    <AuthProvider>
      <GoogleAnalytics />
      <GlobalSocketListener />
      {!isWorkspace && <Navbar />}
      <Outlet />
      {!isWorkspace && <Footer />}
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
