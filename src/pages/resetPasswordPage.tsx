import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Code2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPasswordRequest } from "@/api/auth";
import { toast } from "react-hot-toast";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Password reset token is missing. Please request a new link.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      await resetPasswordRequest(token, password);
      toast.success("Password reset successfully! Please sign in.");
      navigate("/auth");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password. Link may be expired.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 py-10 overflow-hidden">
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-112 w-md rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-112 w-md rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative w-full max-w-105">
        {/* Card */}
        <div className="rounded-2xl border border-border/70 bg-card/70 backdrop-blur-xl p-7 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col items-center text-center">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-linear-to-br from-primary to-primary/70 text-primary-foreground shadow-[0_10px_30px_-12px_color-mix(in_oklab,var(--primary)_70%,transparent)]">
              <Code2 className="h-5 w-5" />
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight">
              Reset Your Password
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {!token ? "Missing Token" : "Enter your new password below"}
            </p>
          </div>

          {!token ? (
            <div className="mt-6 text-center space-y-4">
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
                The password reset token is invalid or missing from the URL. Please trigger a new reset link.
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 rounded-lg"
                onClick={() => navigate("/auth")}
              >
                Go to Sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="h-10 rounded-lg pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute inset-y-0 right-0 grid place-items-center px-3 text-muted-foreground hover:text-foreground"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="h-10 rounded-lg"
                />
              </div>

              <Button
                type="submit"
                disabled={busy}
                className="w-full h-10 mt-2 rounded-lg bg-linear-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white border-0 shadow-[0_10px_30px_-10px_rgba(139,92,246,0.55)] hover:shadow-[0_14px_40px_-10px_rgba(139,92,246,0.7)] hover:opacity-95 transition"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating…
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
