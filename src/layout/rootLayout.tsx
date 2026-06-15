import Footer from "@/components/common/footer";
import { Navbar } from "@/components/common/header/navbar";
import { Outlet } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "react-hot-toast";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Navbar />
      <Outlet />
      <Footer />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
