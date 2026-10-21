import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, isAbsolute, join, relative, sep } from "node:path";
import { readConfig } from "./config";

const MODULE_ID = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const SKIPPED_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "target",
  ".venv",
  "vendor",
]);
const LEDGER = "spec.lock";
const MODULES_DIR = join("docs", "modules");
const GOING_BACK = "docs/building.md#going-back";
const FILE_TOOLS = new Set(["Edit", "Write", "MultiEdit", "NotebookEdit"]);
const RELOCK = /\bspec:lock\b|spec_lock\.ts\s+lock\b/;

export type Problem = {
  path: string;
  kind: "unlisted" | "changed" | "missing";
};

export type HookInput = {
  tool_name?: string;
  tool_input?: { file_path?: string; notebook_path?: string; command?: string };
};

export type HookDecision = { decision: "deny" | "ask"; reason: string } | null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function text(
  record: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

export function parseHookInput(raw: unknown): HookInput | null {
  if (!isRecord(raw)) return null;
  const toolInput = isRecord(raw.tool_input) ? raw.tool_input : {};
  return {
    tool_name: text(raw, "tool_name"),
    tool_input: {
      file_path: text(toolInput, "file_path"),
      notebook_path: text(toolInput, "notebook_path"),
      command: text(toolInput, "command"),
    },
  };
}

function escapeRegex(value: string): string {
  return value.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function specFilePattern(template: string): RegExp {
  const [before = "", after = ""] = template.split("{module}", 2);
  return new RegExp(
    `^${escapeRegex(before)}[a-z0-9_]+${escapeRegex(after)}$`,
  );
}

function hashFile(root: string, path: string): string {
  return createHash("sha256")
    .update(readFileSync(join(root, path)))
    .digest("hex");
}

export function findSpecFiles(root: string, template: string): string[] {
  const pattern = specFilePattern(template);
  const found: string[] = [];

  const walk = (dir: string): void => {
    for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
      const path = dir === "" ? entry.name : `${dir}/${entry.name}`;
      if (entry.isDirectory() && !SKIPPED_DIRS.has(entry.name)) walk(path);
      if (entry.isFile() && pattern.test(entry.name)) found.push(path);
    }
  };

  walk("");
  return found.toSorted();
}

export function specFileName(template: string, moduleId: string): string {
  if (!MODULE_ID.test(moduleId)) {
    throw new Error(
      `module id ${moduleId} must be lowercase words joined by hyphens, such as billing-engine`,
    );
  }

  return template.replace("{module}", moduleId.replaceAll("-", "_"));
}

function readLedgers(root: string): Map<string, string> {
  const hashes = new Map<string, string>();
  const modulesDir = join(root, MODULES_DIR);
  if (!existsSync(modulesDir)) return hashes;

  for (const entry of readdirSync(modulesDir, { withFileTypes: true })) {
    const ledger = join(modulesDir, entry.name, LEDGER);
    if (!entry.isDirectory() || !existsSync(ledger)) continue;

    for (const line of readFileSync(ledger, "utf8").split("\n")) {
      const [hash, path] = line.split("  ");
      if (hash && path) hashes.set(path, hash);
    }
  }

  return hashes;
}

export function lockModule(
  root: string,
  template: string,
  moduleId: string,
): string[] {
  const name = specFileName(template, moduleId);
  const files = findSpecFiles(root, template).filter(
    (path) => path === name || path.endsWith(`/${name}`),
  );

  if (files.length === 0) {
    throw new Error(`no ${name} files to lock for ${moduleId}`);
  }

  const lines = files.map((path) => `${hashFile(root, path)}  ${path}`);
  mkdirSync(join(root, MODULES_DIR, moduleId), { recursive: true });
  writeFileSync(
    join(root, MODULES_DIR, moduleId, LEDGER),
    `${lines.join("\n")}\n`,
  );
  return files;
}

export function checkLocks(root: string, template: string): Problem[] {
  const locked = readLedgers(root);
  const problems: Problem[] = [];
  const onDisk = new Set(findSpecFiles(root, template));

  for (const path of onDisk) {
    const hash = locked.get(path);
    if (hash === undefined) problems.push({ path, kind: "unlisted" });
    else if (hash !== hashFile(root, path))
      problems.push({ path, kind: "changed" });
  }

  for (const path of locked.keys()) {
    if (!onDisk.has(path)) problems.push({ path, kind: "missing" });
  }

  return problems;
}

function realPath(path: string): string {
  if (existsSync(path)) return realpathSync(path);
  const parent = dirname(path);
  return parent === path ? path : join(realPath(parent), basename(path));
}

function repoPath(root: string, path: string): string {
  const full = isAbsolute(path) ? path : join(root, path);
  return relative(realPath(root), realPath(full)).split(sep).join("/");
}

export function guard(root: string, input: HookInput): HookDecision {
  const tool = input.tool_name ?? "";
  const command = input.tool_input?.command ?? "";

  if (tool === "Bash" && RELOCK.test(command)) {
    return {
      decision: "ask",
      reason:
        "This rewrites a spec.lock. Approve only if the user agreed the spec test change in a plan round.",
    };
  }

  const target = input.tool_input?.file_path ?? input.tool_input?.notebook_path;
  if (!FILE_TOOLS.has(tool) || target === undefined) return null;
  const path = repoPath(root, target);
  if (!readLedgers(root).has(path)) return null;
  return {
    decision: "deny",
    reason: `${path} is a locked spec test. If it is wrong, stop and reopen the plan for a new round (${GOING_BACK}); never edit it to make code pass.`,
  };
}

function describe(problem: Problem): string {
  const why = {
    unlisted: "is in no spec.lock: run bun run spec:lock <module-id>",
    changed:
      "differs from its spec.lock: a spec test changes only after a plan round",
    missing: "is listed in a spec.lock but doesn't exist",
  };
  return `${problem.path} ${why[problem.kind]}`;
}

function runCheck(root: string, template: string): number {
  const problems = checkLocks(root, template);
  for (const problem of problems) console.error(describe(problem));
  if (problems.length > 0) return 1;
  console.log("ok   spec tests match their locks");
  return 0;
}

function runLock(
  root: string,
  template: string,
  moduleId: string | undefined,
): number {
  if (moduleId === undefined) {
    console.error("usage: bun run spec:lock <module-id>");
    return 2;
  }

  for (const path of lockModule(root, template, moduleId)) {
    console.log(`locked ${path}`);
  }
  return 0;
}

async function runGuard(root: string): Promise<number> {
  const raw: unknown = await Bun.stdin.json();
  const input = parseHookInput(raw);
  if (input === null) return 0;
  const result = guard(root, input);
  if (result === null) return 0;
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: result.decision,
        permissionDecisionReason: result.reason,
      },
    }),
  );
  return 0;
}

async function main(): Promise<number> {
  const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
  const [command, argument] = process.argv.slice(2);
  if (command === "guard") return runGuard(root);
  const template = readConfig(root).specTestFile;
  if (command === "check") return runCheck(root, template);
  if (command === "lock") return runLock(root, template, argument);
  console.error(
    "usage: bun scripts/spec_lock.ts check | lock <module-id> | guard",
  );
  return 2;
}

if (import.meta.main) {
  const code = await main();
  process.exit(code);
}
