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
        title="Online Code Playground & Compiler"
        description="Write, execute, and compile code instantly in your browser in Python, JavaScript, C++, Java, and 15+ other programming languages."
        keywords="online IDE, online code runner, online compiler, python online editor, javascript playground, codesroom playground"
      />
      <CodeRunner
        value={code}
        language={language}
        onChange={setCode}
        onLanguageChange={onLang}
        header={
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-background text-muted-foreground transition hover:text-foreground hover:border-primary/40"
              title="Back to Home"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Playground
              </h1>
            </div>
          </div>
        }
        heightClass="h-full flex-1"
      />
    </div>
  );
}
