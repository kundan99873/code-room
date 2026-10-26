import { memo } from "react";
import { LogIn, X, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language: string;
}

export const LoginRequiredModal = memo(function LoginRequiredModal({
  isOpen,
  onClose,
  code,
  language,
}: LoginRequiredModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSignIn = () => {
    // Preserve current code and language in sessionStorage
    sessionStorage.setItem("codesroom_preload_code", code);
    sessionStorage.setItem("codesroom_preload_lang", language);
    sessionStorage.setItem("codesroom_auto_share", "true");

    const returnUrl = window.location.pathname + window.location.search || "/online-compiler";
    sessionStorage.setItem("codesroom_oauth_redirect", returnUrl);

    // Redirect to auth page with return parameter
    navigate(`/auth?redirect=${encodeURIComponent(returnUrl)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 text-center space-y-5">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary grid place-items-center mx-auto">
          <LogIn className="h-7 w-7" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-foreground flex items-center justify-center gap-1.5">
            Sign In to Share Snippets <Sparkles className="h-4 w-4 text-primary" />
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Please sign in to generate shareable links and embed widgets.
            Your code will be saved automatically and you will return directly to this snippet right after logging in.
          </p>
        </div>

        <div className="p-3 bg-muted/40 rounded-xl border border-border/60 text-left flex items-start gap-2.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>
            Zero work lost: Your code snippet and chosen language (<span className="text-foreground font-mono font-semibold">{language}</span>) are saved for your session.
          </span>
        </div>

        <div className="flex items-center gap-2.5 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex-1 text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSignIn}
            className="flex-1 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 shadow-md"
          >
            <LogIn className="h-3.5 w-3.5" /> Sign In to Share
          </Button>
        </div>
      </div>
    </div>
  );
});
