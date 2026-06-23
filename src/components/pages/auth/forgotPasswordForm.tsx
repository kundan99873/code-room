import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { forgotPasswordRequest } from "@/api/auth";
import { toast } from "react-hot-toast";

interface ForgotPasswordFormProps {
  onBackToSignIn: () => void;
}

export default function ForgotPasswordForm({ onBackToSignIn }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await forgotPasswordRequest(email);
      toast.success("Password reset link sent to your email!");
      onBackToSignIn();
      setEmail("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset link.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
      <div className="space-y-1.5">
        <Label htmlFor="forgot-email" className="text-xs">
          Email Address
        </Label>
        <Input
          id="forgot-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="h-10 rounded-lg"
        />
      </div>

      <Button
        type="submit"
        disabled={busy}
        className="w-full h-10 rounded-lg bg-linear-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white border-0 shadow-[0_10px_30px_-10px_rgba(139,92,246,0.55)] hover:shadow-[0_14px_40px_-10px_rgba(139,92,246,0.7)] hover:opacity-95 transition"
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending link…
          </>
        ) : (
          "Send Reset Link"
        )}
      </Button>

      <button
        type="button"
        onClick={onBackToSignIn}
        className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition mt-4 block cursor-pointer"
      >
        Back to Sign In
      </button>
    </form>
  );
}
