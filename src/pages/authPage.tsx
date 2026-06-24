import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Code2 } from "lucide-react";
import SignInForm from "@/components/pages/auth/signInForm";
import SignUpForm from "@/components/pages/auth/signUpForm";
import ForgotPasswordForm from "@/components/pages/auth/forgotPasswordForm";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");

  const google = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  const isSignin = mode === "signin";
  const isForgot = mode === "forgot";

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
              {isForgot
                ? "Reset your password"
                : isSignin
                  ? "Welcome back"
                  : "Create your account"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isForgot
                ? "We'll email you a link to reset your password"
                : isSignin
                  ? "Sign in to continue to Coderoom"
                  : "Start collaborating in seconds"}
            </p>
          </div>

          {/* Tabs */}
          {!isForgot && (
            <div className="mt-6 grid grid-cols-2 rounded-full bg-muted/70 p-1 text-sm">
              {(["signin", "signup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`h-8 rounded-full transition font-medium ${mode === m
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {m === "signin" ? "Sign in" : "Sign up"}
                </button>
              ))}
            </div>
          )}

          {!isForgot && (
            <>
              <Button
                type="button"
                variant="outline"
                className="mt-5 w-full h-10 rounded-lg bg-background hover:bg-accent font-medium"
                onClick={google}
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M21.35 11.1H12v3.2h5.35c-.23 1.4-1.65 4.1-5.35 4.1-3.2 0-5.85-2.65-5.85-5.9s2.65-5.9 5.85-5.9c1.85 0 3.05.78 3.75 1.45l2.55-2.45C16.6 4.05 14.5 3 12 3 6.95 3 2.9 7.05 2.9 12s4.05 9 9.1 9c5.25 0 8.7-3.7 8.7-8.9 0-.6-.05-1.05-.15-1.5z"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="flex items-center gap-3 my-5">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-[0.18em]">
                  or with email
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
            </>
          )}

          {mode === "signin" && (
            <SignInForm onForgotPasswordClick={() => setMode("forgot")} />
          )}
          {mode === "signup" && (
            <SignUpForm onSuccess={() => setMode("signin")} />
          )}
          {mode === "forgot" && (
            <ForgotPasswordForm onBackToSignIn={() => setMode("signin")} />
          )}
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms & Privacy Policy.
        </p>
      </div>
    </div>
  );
}
