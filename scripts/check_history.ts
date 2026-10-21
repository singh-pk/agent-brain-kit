import { existsSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { parseArgs } from "node:util";
import { readConfig } from "./config";
import {
  type Doc,
  field,
  headingAnchors,
  isProblem,
  listField,
  type Problem,
  readDoc,
  readText,
} from "./markdown";

const ROOT = repoRoot();
const ADR_DIR = join(ROOT, "docs", "decisions");
const CHANGELOG = "CHANGELOG.md";
const CONFIG = readConfig(ROOT);

const STATUSES = [
  "accepted",
  "proposed",
  "rejected",
  "superseded",
  "deprecated",
];
const REQUIRED_FIELDS = [
  "id",
  "title",
  "status",
  "date",
  "areas",
  "superseded-by",
  "related",
  "design",
];
const REFERENCE_FIELDS = ["superseded-by", "related"];
const ADR_FILE = /^(\d{4})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
const NEW_ADR_PATH = /^docs\/decisions\/(\d{4})-.*\.md$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const LINK = /\[[^\]\n]*\]\(([^)\s]+)\)/g;
const CODE = /```[\s\S]*?```|`[^`\n]*`/g;
const BARE_ADR = /(?<![[\w/-])ADR-\d{4}(?![\w\]])/g;
const USAGE = `Checks the ADRs and the changelog.

  bun scripts/check_history.ts              check every ADR
  bun scripts/check_history.ts --staged     also check staged changes are in the changelog
  bun scripts/check_history.ts --since REF  also check commits REF..HEAD are in the changelog`;

type Change = { status: string; path: string };

function repoRoot(): string {
  const result = Bun.spawnSync(["git", "rev-parse", "--show-toplevel"], {
    cwd: import.meta.dir,
  });
  if (!result.success) throw new Error("not inside a git repository");
  return result.stdout.toString().trim();
}

function git(...args: string[]): string {
  const result = Bun.spawnSync(["git", ...args], {
    cwd: ROOT,
    stderr: "inherit",
  });
  if (!result.success) throw new Error(`git ${args.join(" ")} failed`);
  return result.stdout.toString();
}

function changedFiles(...diffArgs: string[]): Change[] {
  return git("diff", "--name-status", ...diffArgs)
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const columns = line.split("\t");
      return { status: line.charAt(0), path: columns.at(-1) ?? "" };
    });
}

function* checkAdr(id: string, adr: Doc): Generator<Problem> {
  const { path } = adr;

  for (const key of REQUIRED_FIELDS) {
    if (!(key in adr.meta)) yield { path, message: `missing '${key}'` };
  }

  if (field(adr, "id") !== id) {
    yield { path, message: `id must be ${id}, as the file name says` };
  }

  if (!STATUSES.includes(field(adr, "status"))) {
    yield { path, message: `status must be one of ${STATUSES.join(", ")}` };
  }

  if (!DATE.test(field(adr, "date"))) {
    yield { path, message: "date must be YYYY-MM-DD" };
  }

  const areas = listField(adr, "areas");
  if (areas.length === 0) yield { path, message: "areas is empty" };

  for (const area of areas.filter((area) => !CONFIG.areas.includes(area))) {
    yield {
      path,
      message: `unknown area '${area}' (allowed in process.json: ${CONFIG.areas.join(", ")})`,
    };
  }

  const heading = `# ${id}: ${field(adr, "title")}`;

  if (!adr.body.trimStart().startsWith(heading)) {
    yield { path, message: `first heading must be '${heading}'` };
  }

  const isSuperseded = field(adr, "status") === "superseded";
  const hasReplacement = listField(adr, "superseded-by").length > 0;

  if (isSuperseded !== hasReplacement) {
    const message =
      "status 'superseded' and a non-empty superseded-by must go together";
    yield { path, message };
  }
}

function* checkBodyLinks(adr: Doc): Generator<Problem> {
  const prose = adr.body
    .trimStart()
    .replace(/^#[^\n]*\n/, "")
    .replaceAll(CODE, "");

  for (const bare of prose.match(BARE_ADR) ?? []) {
    yield {
      path: adr.path,
      message: `cite ${bare} as a link, such as [${bare}](NNNN-title.md)`,
    };
  }

  for (const match of prose.matchAll(LINK)) {
    const target = match[1] ?? "";
    if (/^[a-z]+:/.test(target) || target.startsWith("#")) continue;
    const file = resolve(dirname(adr.path), target.split("#", 1)[0] ?? "");
    if (!existsSync(file)) {
      yield { path: adr.path, message: `link to missing file '${target}'` };
    }
  }
}

function loadAdrs(): { adrs: Map<string, Doc>; problems: Problem[] } {
  const adrs = new Map<string, Doc>();
  const problems: Problem[] = [];
  const skip = new Set(["README.md", "template.md"]);
  const names = readdirSync(ADR_DIR).filter(
    (name) => name.endsWith(".md") && !skip.has(name),
  );

  for (const name of names.toSorted()) {
    const path = join(ADR_DIR, name);
    const number = ADR_FILE.exec(name)?.[1];

    if (!number) {
      const message = "file name must be NNNN-lowercase-title-with-dashes.md";
      problems.push({ path, message });
      continue;
    }

    const doc = readDoc(path);

    if (isProblem(doc)) {
      problems.push(doc);
      continue;
    }

    const id = `ADR-${number}`;
    if (adrs.has(id)) problems.push({ path, message: `duplicate ${id}` });
    problems.push(...checkAdr(id, doc), ...checkBodyLinks(doc));
    adrs.set(id, doc);
  }

  return { adrs, problems };
}

function* checkReferences(adrs: Map<string, Doc>): Generator<Problem> {
  for (const [id, adr] of adrs) {
    for (const key of REFERENCE_FIELDS) {
      for (const other of listField(adr, key)) {
        if (!adrs.has(other)) {
          yield { path: adr.path, message: `${key} names missing ${other}` };
        } else if (other === id) {
          yield { path: adr.path, message: `${key} names itself` };
        }
      }
    }
  }
}

function* checkDesignLinks(adrs: Map<string, Doc>): Generator<Problem> {
  const anchorsByFile = new Map(
    CONFIG.designFiles
      .filter((name) => existsSync(join(ROOT, name)))
      .map((name) => [name, headingAnchors(readText(join(ROOT, name)))]),
  );

  for (const adr of adrs.values()) {
    for (const link of listField(adr, "design")) {
      const [file = "", anchor] = link.split("#", 2);
      const anchors = anchorsByFile.get(file);

      if (!anchors) {
        const message = `design link '${link}' must point into ${CONFIG.designFiles.join(" or ")}`;
        yield { path: adr.path, message };
      } else if (anchor && !anchors.has(anchor)) {
        yield {
          path: adr.path,
          message: `design link '${link}': no such heading`,
        };
      }
    }
  }
}

function* checkChangelog(
  changes: Change[],
  changelog: string,
): Generator<Problem> {
  const paths = new Set(changes.map((change) => change.path));
  const needsEntry = [...paths].filter(
    (path) => CONFIG.designFiles.includes(path) || path.startsWith("docs/"),
  );

  if (needsEntry.length && !paths.has(CHANGELOG)) {
    const message = `changed without a changelog entry: ${needsEntry.toSorted().join(", ")}`;
    yield { path: CHANGELOG, message };
  }

  for (const change of changes) {
    const number = NEW_ADR_PATH.exec(change.path)?.[1];
    const isNewAdr = change.status === "A" && number !== undefined;

    if (isNewAdr && !changelog.includes(`ADR-${number}`)) {
      yield { path: CHANGELOG, message: `new ADR-${number} isn't mentioned` };
    }
  }
}

function checkStagedChanges(): Generator<Problem> {
  const changes = changedFiles("--cached");
  const changelogStaged = changes.some((change) => change.path === CHANGELOG);
  const changelog = changelogStaged ? git("show", `:${CHANGELOG}`) : "";
  return checkChangelog(changes, changelog);
}

function checkChangesSince(ref: string): Generator<Problem> {
  const changelogPath = join(ROOT, CHANGELOG);
  const changelog = existsSync(changelogPath) ? readText(changelogPath) : "";
  return checkChangelog(changedFiles(`${ref}..HEAD`), changelog);
}

const { values: options } = parseArgs({
  options: {
    staged: { type: "boolean", default: false },
    since: { type: "string" },
    help: { type: "boolean", short: "h", default: false },
  },
});

if (options.help) {
  console.log(USAGE);
  process.exit(0);
}

const { adrs, problems } = loadAdrs();
problems.push(...checkReferences(adrs), ...checkDesignLinks(adrs));
if (options.staged) problems.push(...checkStagedChanges());
if (options.since) problems.push(...checkChangesSince(options.since));

if (problems.length) {
  const lines = problems.map(
    ({ path, message }) => `${relative(ROOT, resolve(ROOT, path))}: ${message}`,
  );
  console.error(`History checks failed:\n  ${lines.join("\n  ")}`);
  process.exit(1);
}

console.log(`History checks passed (${adrs.size} ADRs).`);
