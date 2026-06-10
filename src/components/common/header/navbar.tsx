import { Code2 } from "lucide-react";
import { ThemeToggle } from "./themeToggle";
import { Link } from "react-router-dom";
import CustomNavLink from "./customNavLink";

export function Navbar() {
  return (
    <header className="sticky top-3 z-30 px-3 sm:px-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-3 rounded-full border border-border/70 bg-background/70 px-3 py-2 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.35)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
          <Link to="/" className="group flex items-center gap-2 pl-1.5">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-linear-to-br from-primary to-primary/70 text-primary-foreground shadow-[0_4px_12px_-2px_color-mix(in_oklab,var(--primary)_50%,transparent)]">
              <Code2 className="h-4 w-4" />
            </div>
            <span className="font-semibold text-[15px] tracking-tight">
              Coderoom
            </span>
          </Link>

          <nav className="flex items-center gap-0.5">
            <CustomNavLink to="/pen">Web Pen</CustomNavLink>
            <span className="hidden sm:inline">
              <CustomNavLink to="/playground">Playground</CustomNavLink>
            </span>
            <span className="hidden sm:inline">
              <CustomNavLink to="/json">JSON Tools</CustomNavLink>
            </span>
            {/* {user && <NavLink to="/dashboard">Rooms</NavLink>} */}
          </nav>

          <div className="flex items-center gap-1">
            {/* {user ? (
              <>
                <span className="text-xs text-muted-foreground hidden md:inline max-w-[160px] truncate">
                  {user.email}
                </span>
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-label="Sign out"
                  onClick={async () => { await signOut(); nav({ to: "/" }); }}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : ( */}
            <>
              <ThemeToggle />
              <Link
                to="/auth"
                className="ml-1 inline-flex items-center rounded-full bg-primary text-primary-foreground text-sm font-medium px-4 py-1.5 shadow-[0_4px_14px_-4px_color-mix(in_oklab,var(--primary)_60%,transparent)] hover:opacity-95 transition"
              >
                Sign in
              </Link>
            </>
            {/* )} */}
          </div>
        </div>
      </div>
    </header>
  );
}
