import { YAML } from "bun";
import { readFileSync } from "node:fs";

export type Doc = { path: string; meta: Record<string, unknown>; body: string };
export type Problem = { path: string; message: string };

const FRONT_MATTER = /^---\n([\s\S]*?)\n---\n/;
const HEADING = /^#{1,6}\s+(.*)$/;

export function readText(path: string): string {
  return readFileSync(path, "utf8").replaceAll("\r\n", "\n");
}

export function readDoc(path: string): Doc | Problem {
  const text = readText(path);
  const match = FRONT_MATTER.exec(text);

  if (!match) {
    return { path, message: "missing front matter between --- lines" };
  }

  try {
    const meta: unknown = YAML.parse(match[1] ?? "");

    const isKeyValues =
      typeof meta === "object" && meta !== null && !Array.isArray(meta);

    if (!isKeyValues) {
      return { path, message: "front matter isn't a set of key: value lines" };
    }

    return {
      path,
      meta: Object.fromEntries(Object.entries(meta)),
      body: text.slice(match[0].length),
    };
  } catch (error) {
    return { path, message: `front matter isn't valid YAML: ${String(error)}` };
  }
}

export function isProblem(value: Doc | Problem): value is Problem {
  return "message" in value;
}

export function field(doc: Doc, key: string): string {
  const value = doc.meta[key];
  return typeof value === "string" ? value : "";
}

export function listField(doc: Doc, key: string): string[] {
  const value = doc.meta[key];
  if (Array.isArray(value)) return value.map(String);
  return field(doc, key) ? [field(doc, key)] : [];
}

export function headingAnchors(text: string): Set<string> {
  const anchors = new Set<string>();
  const seen = new Map<string, number>();
  let inCode = false;

  for (const line of text.split("\n")) {
    if (line.startsWith("```")) inCode = !inCode;
    const heading = inCode ? null : HEADING.exec(line);
    if (!heading) continue;

    const slug = (heading[1] ?? "")
      .trim()
      .toLowerCase()
      .replaceAll(/[^\p{L}\p{M}\p{N}_\- ]/gu, "")
      .replaceAll(" ", "-");
    const repeats = seen.get(slug) ?? 0;
    anchors.add(repeats === 0 ? slug : `${slug}-${repeats}`);
    seen.set(slug, repeats + 1);
  }

  return anchors;
}
