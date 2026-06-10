import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CustomNavLinkProps {
  to: string;
  children: React.ReactNode;
}

function CustomNavLink({ to, children }: CustomNavLinkProps) {
  const { pathname } = useLocation();

  const active =
    pathname === to || (to !== "/" && pathname.startsWith(to));

  return (
    <Link
      to={to}
      className={cn(
        "relative text-sm px-3 py-1.5 rounded-full transition-colors",
        active
          ? "text-foreground bg-accent/60"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
      )}
    >
      {children}
    </Link>
  );
}

export default CustomNavLink;