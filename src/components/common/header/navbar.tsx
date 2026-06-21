import { useState } from "react";
import { Code2, LogOut, Menu, X } from "lucide-react";
import { ThemeToggle } from "./themeToggle";
import { Link } from "react-router-dom";
import CustomNavLink from "./customNavLink";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "motion/react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

          <nav className="hidden md:flex items-center gap-0.5">
            <CustomNavLink to="/pen">Web Pen</CustomNavLink>
            <CustomNavLink to="/playground">Playground</CustomNavLink>
            <CustomNavLink to="/json">JSON Tools</CustomNavLink>
            {user && <CustomNavLink to="/dashboard">Rooms</CustomNavLink>}
          </nav>

          <div className="flex items-center gap-1">
            {user ? (
              <>
                <span className="text-xs text-muted-foreground hidden lg:inline max-w-[160px] truncate mr-2">
                  {user.email}
                </span>
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full cursor-pointer hover:bg-accent hidden md:inline-flex"
                  aria-label="Sign out"
                  onClick={async () => {
                    await logout();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link
                  to="/auth"
                  className="ml-1 hidden md:inline-flex items-center rounded-full bg-primary text-primary-foreground text-sm font-medium px-4 py-1.5 shadow-[0_4px_14px_-4px_color-mix(in_oklab,var(--primary)_60%,transparent)] hover:opacity-95 transition"
                >
                  Sign in
                </Link>
              </>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full cursor-pointer hover:bg-accent md:hidden"
              aria-label="Toggle menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="mt-3 flex flex-col gap-1.5 rounded-2xl border border-border/70 bg-background/95 p-3 shadow-lg backdrop-blur-xl md:hidden overflow-hidden"
            >
              {user && (
                <div className="px-4 py-2 border-b border-border/50 mb-1">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Signed in as</p>
                  <p className="text-xs font-medium text-foreground truncate mt-0.5">{user.email}</p>
                </div>
              )}
              
              <Link
                to="/pen"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center px-4 py-2 text-sm font-medium rounded-lg hover:bg-accent transition"
              >
                Web Pen
              </Link>
              <Link
                to="/playground"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center px-4 py-2 text-sm font-medium rounded-lg hover:bg-accent transition"
              >
                Playground
              </Link>
              <Link
                to="/json"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center px-4 py-2 text-sm font-medium rounded-lg hover:bg-accent transition"
              >
                JSON Tools
              </Link>
              {user && (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center px-4 py-2 text-sm font-medium rounded-lg hover:bg-accent transition"
                >
                  Rooms
                </Link>
              )}
              
              {user ? (
                <button
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await logout();
                  }}
                  className="mt-2 flex w-full items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg hover:bg-destructive/10 text-destructive hover:text-destructive transition cursor-pointer"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium px-4 py-2 mt-2 shadow-sm hover:opacity-95 transition"
                >
                  Sign in
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
