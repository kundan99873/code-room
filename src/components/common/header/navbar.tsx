import { useState } from "react";
import { LogOut, Menu, X, Key } from "lucide-react";
import { ThemeToggle } from "./themeToggle";
import { Link } from "react-router-dom";
import BrandLogo from "../brandLogo";
import CustomNavLink from "./customNavLink";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { changePasswordRequest } from "@/api/auth";
import { toast } from "react-hot-toast";

export function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [changePwOpen, setChangePwOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPw, setIsChangingPw] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setChangePwOpen(open);
    if (!open) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setIsChangingPw(true);
    try {
      await changePasswordRequest({
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success("Password changed successfully!");
      setChangePwOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setIsChangingPw(false);
    }
  };

  return (
    <header className="sticky top-3 z-30 px-3 sm:px-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-3 rounded-full border border-border/70 bg-background/70 px-3 py-2 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.35)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
          <Link to="/" className="group flex items-center gap-2 pl-1.5">
            <div className="h-10 w-40 overflow-hidden transition-transform duration-200 group-hover:scale-105">
              <BrandLogo className="h-full w-full object-contain rounded" />
            </div>
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
                <Dialog open={changePwOpen} onOpenChange={handleOpenChange}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full cursor-pointer hover:bg-accent hidden md:inline-flex"
                      aria-label="Change Password"
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[420px] border border-border bg-card/95 backdrop-blur-xl p-6 rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent flex items-center gap-2">
                        <Key className="h-5 w-5 text-indigo-400" /> Change Password
                      </DialogTitle>
                    </DialogHeader>
                    {user?.provider === "google" ? (
                      <div className="space-y-4 py-3 text-center">
                        <p className="text-sm text-muted-foreground">
                          Your account is authenticated via Google. You do not have a local password to change.
                        </p>
                        <div className="flex justify-end pt-2">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setChangePwOpen(false)}
                            className="h-10 px-5 hover:bg-muted"
                          >
                            Close
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleChangePassword} className="space-y-4 mt-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="current-pw" className="text-xs">Current Password</Label>
                          <Input
                            id="current-pw"
                            type="password"
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="new-pw" className="text-xs">New Password</Label>
                          <Input
                            id="new-pw"
                            type="password"
                            required
                            minLength={6}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="confirm-new-pw" className="text-xs">Confirm New Password</Label>
                          <Input
                            id="confirm-new-pw"
                            type="password"
                            required
                            minLength={6}
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="h-10"
                          />
                        </div>
                        <DialogFooter className="mt-6 flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setChangePwOpen(false)}
                            className="h-10 animate-none hover:bg-muted"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={isChangingPw}
                            className="h-10 px-5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white border-0 shadow-md hover:opacity-95 cursor-pointer font-medium"
                          >
                            {isChangingPw ? "Updating..." : "Update Password"}
                          </Button>
                        </DialogFooter>
                      </form>
                    )}
                  </DialogContent>
                </Dialog>
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
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setChangePwOpen(true);
                    }}
                    className="mt-2 flex w-full items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg hover:bg-accent transition cursor-pointer"
                  >
                    <Key className="h-4 w-4" /> Change password
                  </button>
                  <button
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await logout();
                    }}
                    className="mt-1 flex w-full items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg hover:bg-destructive/10 text-destructive hover:text-destructive transition cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </>
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
