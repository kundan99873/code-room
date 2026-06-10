import Footer from "@/components/common/footer";
import { Navbar } from "@/components/common/header/navbar";
import { Outlet } from "react-router-dom";

export default function RootLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}
