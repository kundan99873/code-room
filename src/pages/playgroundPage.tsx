import { CodeRunner } from "@/components/pages/codeRunner/codeRunner";
import { starter } from "@/lib/languages";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function PlaygroundPage() {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(starter("javascript"));

  const onLang = (l: string) => {
    setLanguage(l);
    setCode(starter(l));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <CodeRunner
        value={code}
        language={language}
        onChange={setCode}
        onLanguageChange={onLang}
        header={
          <div className="text-sm">
            <span className="font-semibold">Playground</span>
            <span className="text-muted-foreground ml-2">
              — no login needed.{" "}
              <Link to="/auth" className="text-primary hover:underline">
                Sign in
              </Link>{" "}
              to create a room.
            </span>
          </div>
        }
        heightClass="h-[calc(100vh-3.5rem)]"
      />
    </div>
  );
}
