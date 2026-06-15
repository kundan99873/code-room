import { Code2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
            <Code2 className="h-3.5 w-3.5" />
          </div>
          <span>
            © {new Date().getFullYear()} Coderoom
          </span>
        </div>
        <nav className="flex items-center gap-5 text-sm text-muted-foreground">
          <Link to="/playground" className="hover:text-foreground">
            Playground
          </Link>
          <Link to="/json" className="hover:text-foreground">
            JSON Tools
          </Link>
          <Link to="/auth" className="hover:text-foreground">
            Sign in
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
