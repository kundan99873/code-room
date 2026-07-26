export const SAMPLE = `{
  "name": "coderoom",
  "version": "1.0.0",
  "active": true,
  "tags": ["editor", "runner", "rooms"],
  "author": { "name": "You", "email": "you@example.com" }
}`;

export type Status = { ok: boolean; message: string };

export function validate(src: string): Status {
  try {
    JSON.parse(src);
    return { ok: true, message: "Valid JSON" };
  } catch (e: any) {
    return { ok: false, message: e.message };
  }
}

export function toYaml(obj: any, indent = 0): string {
  const pad = " ".repeat(indent);
  if (obj === null) return "null";
  if (typeof obj !== "object")
    return typeof obj === "string" ? JSON.stringify(obj) : String(obj);
  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    return obj
      .map(
        (v) =>
          `${pad}- ${typeof v === "object" && v !== null ? "\n" + toYaml(v, indent + 2) : toYaml(v)}`,
      )
      .join("\n");
  }
  const entries = Object.entries(obj);
  if (entries.length === 0) return "{}";
  return entries
    .map(([k, v]) => {
      if (v !== null && typeof v === "object")
        return `${pad}${k}:\n${toYaml(v, indent + 2)}`;
      return `${pad}${k}: ${toYaml(v)}`;
    })
    .join("\n");
}

export function toXml(obj: any, name = "root", indent = 0): string {
  const pad = "  ".repeat(indent);
  if (obj === null || obj === undefined) return `${pad}<${name}/>`;
  if (typeof obj !== "object") {
    return `${pad}<${name}>${String(obj).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]!)}</${name}>`;
  }
  if (Array.isArray(obj)) {
    return obj.map((v) => toXml(v, name, indent)).join("\n");
  }
  const inner = Object.entries(obj)
    .map(([k, v]) => toXml(v, k, indent + 1))
    .join("\n");
  return `${pad}<${name}>\n${inner}\n${pad}</${name}>`;
}
