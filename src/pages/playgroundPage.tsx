import { CodeRunner } from "@/components/pages/codeRunner/codeRunner";
import { starter } from "@/lib/languages";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import SEO from "@/components/seo";

export default function PlaygroundPage() {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(starter("javascript"));

  const onLang = (l: string) => {
    setLanguage(l);
    setCode(starter(l));
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-background">
      <SEO
        title="Online Compiler & Code Editor (15+ Languages) | CodesRoom"
        description="Free online code compiler and IDE. Write, compile, and execute code instantly in Python, JavaScript, TypeScript, C++, Java, Go, Rust, and 15+ languages."
        keywords="online compiler, online code editor, python online compiler, c++ online compiler, java compiler, run code online, multi language compiler, codesroom"
        canonical="https://codesroom.in/online-compiler"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Online Compiler", url: "/online-compiler" },
        ]}
        structuredData={{
          "@type": "SoftwareApplication",
          "name": "CodesRoom Online Compiler",
          "url": "https://codesroom.in/online-compiler",
          "applicationCategory": "DeveloperApplication",
          "operatingSystem": "All",
          "description": "Run and compile code in Python, C++, Java, Go, Rust, and JavaScript directly in your browser.",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        }}
      />
      <CodeRunner
        value={code}
        language={language}
        onChange={setCode}
        onLanguageChange={onLang}
        header={
          <div className="flex items-center justify-between w-full pr-2">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-background text-muted-foreground transition hover:text-foreground hover:border-primary/40"
                title="Back to Home"
                aria-label="Back to Home"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Online Compiler
                </h1>
              </div>
            </div>
            <nav className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground" aria-label="Tool Navigation">
              <Link to="/web-pen" className="hover:text-foreground transition">Web Pen</Link>
              <span className="text-border">|</span>
              <Link to="/json-formatter" className="hover:text-foreground transition">JSON Tools</Link>
            </nav>
          </div>
        }
        heightClass="h-full flex-1"
      />
    </div>
  );
}
