import Footer from "@/components/common/footer";
import { Navbar } from "@/components/common/header/navbar";
import { Outlet, useLocation } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "react-hot-toast";

export default function RootLayout() {
  const location = useLocation();

  // Hide global navbar and footer on full-screen workspace pages
  const isWorkspace =
    location.pathname.startsWith("/room/") ||
    location.pathname === "/pen" ||
    location.pathname === "/playground" ||
    location.pathname === "/json";

  return (
    <AuthProvider>
      {!isWorkspace && <Navbar />}
      <Outlet />
      {!isWorkspace && <Footer />}
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
