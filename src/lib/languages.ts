export type Lang = {
  id: string; // monaco language id
  label: string;
  piston?: string; // piston runtime name (omit if not runnable on server)
  version?: string; // piston version
  codex?: string; // jaagrav codex language id (py, cpp, c, js, java, go)
  wandbox?: string; // wandbox compiler id
  ext: string;
  runMode: "web" | "browser" | "server" | "none";
};

export const LANGUAGES: Lang[] = [
  {
    id: "javascript",
    label: "JavaScript",
    ext: "js",
    runMode: "browser",
    codex: "js",
  },
  { id: "typescript", label: "TypeScript", ext: "ts", runMode: "browser" },
  {
    id: "python",
    label: "Python",
    piston: "python",
    version: "3.10.0",
    ext: "py",
    codex: "py",
    wandbox: "cpython-head",
    runMode: "server",
  },
  {
    id: "go",
    label: "Go",
    piston: "go",
    version: "1.16.2",
    ext: "go",
    codex: "go",
    wandbox: "go-1.23.2",
    runMode: "server",
  },
  {
    id: "rust",
    label: "Rust",
    piston: "rust",
    version: "1.68.2",
    ext: "rs",
    wandbox: "rust-1.82.0",
    runMode: "server",
  },
  {
    id: "java",
    label: "Java",
    piston: "java",
    version: "15.0.2",
    ext: "java",
    codex: "java",
    wandbox: "openjdk-jdk-22+36",
    runMode: "server",
  },
  {
    id: "cpp",
    label: "C++",
    piston: "c++",
    version: "10.2.0",
    ext: "cpp",
    codex: "cpp",
    wandbox: "gcc-head",
    runMode: "server",
  },
  {
    id: "csharp",
    label: "C#",
    piston: "csharp",
    version: "6.12.0",
    ext: "cs",
    wandbox: "mono-6.12.0.199",
    runMode: "server",
  },
  {
    id: "php",
    label: "PHP",
    piston: "php",
    version: "8.2.3",
    ext: "php",
    wandbox: "php-8.3.12",
    runMode: "server",
  },
  {
    id: "ruby",
    label: "Ruby",
    piston: "ruby",
    version: "3.0.1",
    ext: "rb",
    wandbox: "ruby-4.0.2",
    runMode: "server",
  },
  {
    id: "bash",
    label: "Bash",
    piston: "bash",
    version: "5.2.0",
    ext: "sh",
    wandbox: "bash",
    runMode: "server",
  },
];

export const LANG_BY_ID: Record<string, Lang> = {
  ...Object.fromEntries(LANGUAGES.map((l) => [l.id, l])),
  js: LANGUAGES.find((l) => l.id === "javascript")!,
  ts: LANGUAGES.find((l) => l.id === "typescript")!,
  py: LANGUAGES.find((l) => l.id === "python")!,
  "c++": LANGUAGES.find((l) => l.id === "cpp")!,
};

const PISTON_ENDPOINT_KEY = "piston_endpoint";
export function getPistonEndpoint(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(PISTON_ENDPOINT_KEY) || "";
}
export function setPistonEndpoint(url: string) {
  if (typeof window === "undefined") return;
  if (url) localStorage.setItem(PISTON_ENDPOINT_KEY, url);
  else localStorage.removeItem(PISTON_ENDPOINT_KEY);
}

export type RunResult = {
  stdout: string;
  stderr: string;
  output: string;
  ok: boolean;
  provider: "piston" | "codex" | "wandbox" | "pyodide" | "php-wasm" | "none";
  timeMs?: number;
};

let pyodideRuntimePromise: Promise<any> | null = null;
// let phpRuntimePromise: Promise<any> | null = null;

async function getPyodideRuntime() {
  if (!pyodideRuntimePromise) {
    pyodideRuntimePromise = import("pyodide").then(({ loadPyodide }) =>
      loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.29.4/full/",
        fullStdLib: false,
      }),
    );
  }
  return pyodideRuntimePromise;
}

async function runPythonInBrowser(
  source: string,
  stdin: string,
  allFiles: { name: string; content: string }[] = [],
  activeFileName = "",
): Promise<RunResult> {
  const pyodide = await getPyodideRuntime();
  
  // Write other workspace files to Pyodide virtual filesystem
  if (allFiles.length > 0) {
    allFiles.forEach((f) => {
      if (f.name !== activeFileName) {
        try {
          pyodide.FS.writeFile(f.name, f.content);
        } catch (fsErr) {
          console.error("Pyodide FS error writing file:", f.name, fsErr);
        }
      }
    });
  }

  const stdout: string[] = [];
  const stderr: string[] = [];
  const inputLines = stdin.length
    ? stdin.replace(/\r\n/g, "\n").split("\n")
    : [];
  let inputIndex = 0;

  pyodide.setStdout({ batched: (text: string) => stdout.push(text) });
  pyodide.setStderr({ batched: (text: string) => stderr.push(text) });
  pyodide.setStdin({
    stdin: () =>
      inputIndex < inputLines.length ? inputLines[inputIndex++] : null,
    autoEOF: true,
  });

  try {
    await pyodide.runPythonAsync(source, { filename: activeFileName || "main.py" });
    const out = stdout.join("\n");
    const err = stderr.join("\n");
    return {
      stdout: out,
      stderr: err,
      output: out + err,
      ok: !err,
      provider: "pyodide",
    };
  } catch (error: any) {
    const err = stderr.concat(error?.message ?? String(error)).join("\n");
    return {
      stdout: stdout.join("\n"),
      stderr: err,
      output: stdout.join("\n") + err,
      ok: false,
      provider: "pyodide",
    };
  }
}

// async function getPhpRuntime() {
//   if (!phpRuntimePromise) {
//     phpRuntimePromise = Promise.all([
//       import("@php-wasm/universal"),
//       import("@php-wasm/web-8-5"),
//     ]).then(async ([{ PHP, loadPHPRuntime }, { getPHPLoaderModule }]) => {
//       const loader = await getPHPLoaderModule();
//       return new PHP(await loadPHPRuntime(loader));
//     });
//   }
//   return phpRuntimePromise;
// }

// async function runPhpInBrowser(
//   source: string,
//   stdin: string,
// ): Promise<RunResult> {
//   const php = await getPhpRuntime();
//   const code = source.trimStart().startsWith("<?")
//     ? source
//     : `<?php\n${source}`;
//   php.writeFile("/main.php", code);
//   const response = await php.run({
//     scriptPath: "/main.php",
//     method: "POST",
//     body: stdin,
//   });
//   const stdout = response.text ?? "";
//   const stderr = response.errors ?? "";
//   return {
//     stdout,
//     stderr,
//     output: stderr ? stdout + stderr : stdout,
//     ok: response.exitCode === 0 && !stderr,
//     provider: "php-wasm",
//   };
// }

// const PUBLIC_PISTON = "https://emkc.org/api/v2/piston/execute";

async function runOnPistonAt(
  endpoint: string,
  langId: string,
  source: string,
  stdin: string,
  allFiles: { name: string; content: string }[] = [],
  activeFileName = "",
): Promise<RunResult | null> {
  const lang = LANG_BY_ID[langId];
  if (!lang?.piston) return null;

  const filesPayload = allFiles.length > 0 && activeFileName
    ? [
        { name: activeFileName, content: source },
        ...allFiles.filter((f) => f.name !== activeFileName).map((f) => ({ name: f.name, content: f.content }))
      ]
    : [{ name: `main.${lang.ext}`, content: source }];

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: lang.piston,
      version: lang.version ?? "*",
      files: filesPayload,
      stdin,
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    return {
      stdout: "",
      stderr: `Runner error (${res.status}): ${txt}`,
      output: "",
      ok: false,
      provider: "piston",
    };
  }
  const data = await res.json();
  const stdout: string = data.run?.stdout ?? "";
  const stderr: string = data.run?.stderr ?? data.compile?.stderr ?? "";
  return {
    stdout,
    stderr,
    output: data.run?.output ?? stdout + stderr,
    ok: !stderr,
    provider: "piston",
  };
}

async function runOnWandbox(
  langId: string,
  source: string,
  stdin: string,
  allFiles: { name: string; content: string }[] = [],
  activeFileName = "",
): Promise<RunResult | null> {
  const lang = LANG_BY_ID[langId];
  if (!lang?.wandbox) return null;
  try {
    const codes = allFiles.length > 0 && activeFileName
      ? allFiles.filter((f) => f.name !== activeFileName).map((f) => ({ file: f.name, code: f.content }))
      : [];

    const res = await fetch("https://wandbox.org/api/compile.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        compiler: lang.wandbox,
        code: source,
        codes,
        stdin,
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      return {
        stdout: "",
        stderr: `Runner error (${res.status}): ${txt}`,
        output: "",
        ok: false,
        provider: "wandbox",
      };
    }
    const data = await res.json();
    const stdout: string = data.program_output ?? "";
    const compileErr: string = data.compiler_error ?? "";
    const runErr: string = data.program_error ?? "";
    const stderr = [compileErr, runErr].filter(Boolean).join("\n");
    const ok = data.status === "0" && !stderr;
    return {
      stdout,
      stderr,
      output: stdout + (stderr ? (stdout ? "\n" : "") + stderr : ""),
      ok,
      provider: "wandbox",
    };
  } catch (e: any) {
    return {
      stdout: "",
      stderr: `Wandbox network error: ${e?.message ?? e}`,
      output: "",
      ok: false,
      provider: "wandbox",
    };
  }
}

async function runOnCodex(
  langId: string,
  source: string,
  stdin: string,
): Promise<RunResult | null> {
  const lang = LANG_BY_ID[langId];
  if (!lang?.codex) return null;
  // Retry once on 5xx (the free service is often briefly down).
  let lastErr = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch("https://api.codex.jaagrav.in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: source,
          language: lang.codex,
          input: stdin,
        }),
      });
      if (res.status >= 500) {
        lastErr = `Codex ${res.status}: free public runner is temporarily unavailable.`;
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 800));
          continue;
        }
        return {
          stdout: "",
          stderr: `${lastErr}\n\nWorkaround: add a self-hosted Piston endpoint in Runner settings (gear icon).`,
          output: "",
          ok: false,
          provider: "codex",
        };
      }
      if (!res.ok) {
        const txt = await res.text();
        return {
          stdout: "",
          stderr: `Codex error (${res.status}): ${txt}`,
          output: "",
          ok: false,
          provider: "codex",
        };
      }
      const data = await res.json();
      const stdout: string = data.output ?? "";
      const stderr: string = data.error ?? "";
      const output = stderr ? stderr : stdout;
      return {
        stdout,
        stderr,
        output: output || "(no output)",
        ok: !stderr,
        provider: "codex",
      };
    } catch (e: any) {
      lastErr = e?.message ?? String(e);
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 800));
        continue;
      }
      return {
        stdout: "",
        stderr: `Codex network error: ${lastErr}\n\nWorkaround: add a self-hosted Piston endpoint in Runner settings.`,
        output: "",
        ok: false,
        provider: "codex",
      };
    }
  }
  return null;
}

function isSystemExecutionError(r: RunResult | null): boolean {
  if (!r) return true;
  if (r.ok) return false;
  const errText = (r.stderr || "").toLowerCase();
  return (
    errText.includes("oci runtime error") ||
    errText.includes("crun:") ||
    errText.includes("runc:") ||
    errText.includes("resource temporarily unavailable") ||
    errText.includes("failed to create container") ||
    errText.includes("pids limit reached") ||
    errText.includes("clone: resource temporarily unavailable")
  );
}

export async function runOnPiston(
  langId: string,
  source: string,
  allFiles: { name: string; content: string }[] = [],
  activeFileName = "",
  stdin = "",
): Promise<RunResult> {
  const lang = LANG_BY_ID[langId];
  if (!lang) {
    return {
      stdout: "",
      stderr: `Unknown language: ${langId}`,
      output: "",
      ok: false,
      provider: "none",
    };
  }
  const t0 = performance.now();
  try {
    // Python runs locally through Pyodide.
    if (langId === "python") {
      const py = await runPythonInBrowser(source, stdin, allFiles, activeFileName);
      return { ...py, timeMs: Math.round(performance.now() - t0) };
    }

    // PHP runs locally through WebAssembly.
    // if (langId === "php") {
    //   const php = await runPhpInBrowser(source, stdin);
    //   return { ...php, timeMs: Math.round(performance.now() - t0) };
    // }

    // Prefer self-hosted Piston if the user configured one.
    const custom = getPistonEndpoint();
    if (custom) {
      const piston = await runOnPistonAt(custom, langId, source, stdin, allFiles, activeFileName);
      if (piston && (piston.ok || piston.stdout || piston.stderr)) {
        if (!isSystemExecutionError(piston)) {
          return { ...piston, timeMs: Math.round(performance.now() - t0) };
        }
      }
    }

    // Primary public runner: Wandbox (Rust, Go, Java, C++, C#, Ruby, Bash, etc.).
    const wb = await runOnWandbox(langId, source, stdin, allFiles, activeFileName);
    if (wb && (wb.ok || wb.stdout || wb.stderr)) {
      if (!isSystemExecutionError(wb)) {
        return { ...wb, timeMs: Math.round(performance.now() - t0) };
      }
    }

    // Codex fallback (py, js, java, cpp, c, go) if Wandbox returned nothing.
    let codexResult: RunResult | null = null;
    if (lang.codex) {
      const codex = await runOnCodex(langId, source, stdin);
      if (codex && (codex.ok || codex.stdout || codex.stderr)) {
        if (!isSystemExecutionError(codex)) {
          return { ...codex, timeMs: Math.round(performance.now() - t0) };
        }
        codexResult = codex;
      }
    }

    // If everything failed or returned system/OCI errors, return the best available response.
    const finalResult = codexResult || wb || {
      stdout: "",
      stderr: `${lang.label} could not be executed. The public execution sandboxes are currently overloaded or down. Please try again, or configure a self-hosted Piston endpoint in the Runner settings (gear icon) for reliable execution.`,
      output: "",
      ok: false,
      provider: "none",
    };

    return {
      ...finalResult,
      timeMs: Math.round(performance.now() - t0),
    };
  } catch (e: any) {
    return {
      stdout: "",
      stderr: `Network error: ${e?.message ?? e}\n\nTry again, or configure a Piston endpoint in Runner settings.`,
      output: "",
      ok: false,
      provider: "none",
      timeMs: Math.round(performance.now() - t0),
    };
  }
}

export function starter(lang: string): string {
  const map: Record<string, string> = {
    javascript: `// JavaScript — runs in browser sandbox
console.log("Printing numbers from 1 to 10:");
for (let i = 1; i <= 10; i++) {
  console.log(i);
}
`,
    typescript: `// TypeScript — types are stripped, then run in browser
console.log("Printing numbers from 1 to 10:");
const numbers: number[] = Array.from({ length: 10 }, (_, i) => i + 1);
numbers.forEach((num: number) => {
  console.log(num);
});
`,
    python: `# Python — runs locally in your browser via Pyodide
print("Printing numbers from 1 to 10:")
for i in range(1, 11):
    print(i)
`,
    rust: `fn main() {
    println!("Printing numbers from 1 to 10:");
    for i in 1..=10 {
        println!("{}", i);
    }
}
`,
    go: `package main

import "fmt"

func main() {
    fmt.Println("Printing numbers from 1 to 10:")
    for i := 1; i <= 10; i++ {
        fmt.Println(i)
    }
}
`,
    java: `class Main {
    public static void main(String[] args) {
        System.out.println("Printing numbers from 1 to 10:");
        for (int i = 1; i <= 10; i++) {
            System.out.println(i);
        }
    }
}
`,
    cpp: `#include <iostream>

int main() {
    std::cout << "Printing numbers from 1 to 10:\\n";
    for (int i = 1; i <= 10; ++i) {
        std::cout << i << "\\n";
    }
    return 0;
}
`,
    csharp: `using System;

class Program {
    static void Main() {
        Console.WriteLine("Printing numbers from 1 to 10:");
        for (int i = 1; i <= 10; i++) {
            Console.WriteLine(i);
        }
    }
}
`,
    php: `<?php
echo "Printing numbers from 1 to 10:\\n";
for ($i = 1; $i <= 10; $i++) {
    echo $i . "\\n";
}
`,
    ruby: `puts "Printing numbers from 1 to 10:"
(1..10).each do |i|
  puts i
end
`,
    bash: `#!/usr/bin/env bash
echo "Printing numbers from 1 to 10:"
for i in {1..10}; do
  echo "$i"
done
`,
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Playground</title>
</head>
<body>
  <h1>Numbers from 1 to 10:</h1>
  <ul id="numbers"></ul>
  <script>
    const ul = document.getElementById('numbers');
    for (let i = 1; i <= 10; i++) {
      const li = document.createElement('li');
      li.textContent = i;
      ul.appendChild(li);
    }
  </script>
</body>
</html>
`,
    css: `:root {
  --bg: #0f172a;
  --fg: #e2e8f0;
  --accent: #6366f1;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: 'Inter', system-ui, sans-serif;
  background: var(--bg);
  color: var(--fg);
  display: grid;
  place-items: center;
  min-height: 100vh;
}

.btn {
  padding: 0.6rem 1.2rem;
  border: 0;
  border-radius: 0.6rem;
  background: var(--accent);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: transform .15s ease, box-shadow .15s ease;
}
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -10px var(--accent);
}
`,
    sql: `-- SQL sample
CREATE TABLE numbers (
  val INTEGER
);

INSERT INTO numbers (val) VALUES
  (1), (2), (3), (4), (5), (6), (7), (8), (9), (10);

SELECT val FROM numbers;
`,
    json: `[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
`,
  };
  return map[lang] ?? "";
}
