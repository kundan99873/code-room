import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import BrandLogo from "./brandLogo";

export default function Footer() {
  const { user } = useAuth();
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-8 w-32 overflow-hidden">
            <BrandLogo className="h-full w-full object-contain" />
          </div>
          <span>
            © {new Date().getFullYear()} Coderoom
          </span>
        </div>
        <nav className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground" aria-label="Footer Navigation">
          <Link to="/online-compiler" className="hover:text-foreground">
            Online Compiler
          </Link>
          <Link to="/web-pen" className="hover:text-foreground">
            Web Pen
          </Link>
          <Link to="/json-formatter" className="hover:text-foreground">
            JSON Tools
          </Link>
          {user ? (
            <Link to="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
          ) : (
            <Link to="/auth" className="hover:text-foreground">
              Sign in
            </Link>
          )}
          <Link to="/privacy-policy" className="hover:text-foreground">
            Privacy Policy
          </Link>
          {/* <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground inline-flex items-center gap-1"
          >
            <Github className="h-4 w-4" /> GitHub
          </a>
          <a
            href="https://www.lovable.dev"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground inline-flex items-center gap-1"
          >
            <Globe2 className="h-4 w-4" /> Lovable
          </a> */}
        </nav>
      </div>
    </footer>
  );
}
