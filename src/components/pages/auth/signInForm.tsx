import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface SignInFormProps {
  onForgotPasswordClick: () => void;
}

export default function SignInForm({ onForgotPasswordClick }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const { login, isLoggingIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
    } catch (err) {
      // handled by mutation toast
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="h-10 rounded-lg"
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-xs">
            Password
          </Label>
          <button
            type="button"
            onClick={onForgotPasswordClick}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Forgot?
          </button>
        </div>
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

      <Button
        type="submit"
        disabled={isLoggingIn}
        className="w-full h-10 rounded-lg bg-linear-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white border-0 shadow-[0_10px_30px_-10px_rgba(139,92,246,0.55)] hover:shadow-[0_14px_40px_-10px_rgba(139,92,246,0.7)] hover:opacity-95 transition"
      >
        {isLoggingIn ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Please wait…
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
