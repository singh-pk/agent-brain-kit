import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  checkLocks,
  findSpecFiles,
  guard,
  lockModule,
  parseHookInput,
  specFileName,
} from "./spec_lock";

const TEMPLATE = "spec_{module}_test.ts";
const tmp = { root: "" };

function write(path: string, text: string): void {
  const full = join(tmp.root, path);
  mkdirSync(join(full, ".."), { recursive: true });
  writeFileSync(full, text);
}

beforeEach(() => {
  tmp.root = mkdtempSync(join(tmpdir(), "spec-lock-"));
  write("docs/modules/billing-engine/plan.html", "");
  write("src/billing/spec_billing_engine_test.ts", "a\n");
  write("src/billing/tax/spec_billing_engine_test.ts", "b\n");
  write("src/billing/billing_test.ts", "working test\n");
  write("node_modules/x/spec_billing_engine_test.ts", "ignored\n");
});

afterEach(() => {
  rmSync(tmp.root, { recursive: true, force: true });
});

describe("spec lock", () => {
  test("finds only spec files, skipping dependency folders", () => {
    expect(findSpecFiles(tmp.root, TEMPLATE)).toEqual([
      "src/billing/spec_billing_engine_test.ts",
      "src/billing/tax/spec_billing_engine_test.ts",
    ]);
  });

  test("follows the file name template for any language", () => {
    write("tests/test_spec_billing_engine.py", "c\n");
    expect(findSpecFiles(tmp.root, "test_spec_{module}.py")).toEqual([
      "tests/test_spec_billing_engine.py",
    ]);
  });

  test("a locked, unchanged module passes the check", () => {
    lockModule(tmp.root, TEMPLATE, "billing-engine");
    expect(checkLocks(tmp.root, TEMPLATE)).toEqual([]);
  });

  test("a changed spec file fails the check", () => {
    lockModule(tmp.root, TEMPLATE, "billing-engine");
    write("src/billing/spec_billing_engine_test.ts", "a, weakened\n");
    expect(checkLocks(tmp.root, TEMPLATE)).toEqual([
      { path: "src/billing/spec_billing_engine_test.ts", kind: "changed" },
    ]);
  });

  test("an unlisted spec file fails the check", () => {
    lockModule(tmp.root, TEMPLATE, "billing-engine");
    write("src/other/spec_other_test.ts", "d\n");
    expect(checkLocks(tmp.root, TEMPLATE)).toEqual([
      { path: "src/other/spec_other_test.ts", kind: "unlisted" },
    ]);
  });

  test("a deleted spec file fails the check", () => {
    lockModule(tmp.root, TEMPLATE, "billing-engine");
    rmSync(join(tmp.root, "src/billing/tax/spec_billing_engine_test.ts"));
    expect(checkLocks(tmp.root, TEMPLATE)).toEqual([
      { path: "src/billing/tax/spec_billing_engine_test.ts", kind: "missing" },
    ]);
  });

  test("module ids must be lowercase words joined by hyphens", () => {
    expect(specFileName(TEMPLATE, "billing-engine")).toBe(
      "spec_billing_engine_test.ts",
    );
    expect(() => specFileName(TEMPLATE, "Billing_Engine")).toThrow();
  });

  test("the hook refuses edits to a locked spec file", () => {
    lockModule(tmp.root, TEMPLATE, "billing-engine");
    const input = parseHookInput({
      tool_name: "Edit",
      tool_input: {
        file_path: join(tmp.root, "src/billing/spec_billing_engine_test.ts"),
      },
    });
    expect(input && guard(tmp.root, input)?.decision).toBe("deny");
  });

  test("the hook leaves working tests alone", () => {
    lockModule(tmp.root, TEMPLATE, "billing-engine");
    const input = parseHookInput({
      tool_name: "Write",
      tool_input: { file_path: "src/billing/billing_test.ts" },
    });
    expect(input && guard(tmp.root, input)).toBeNull();
  });

  test("the hook asks the user before a relock", () => {
    const input = parseHookInput({
      tool_name: "Bash",
      tool_input: { command: "bun run spec:lock billing-engine" },
    });
    expect(input && guard(tmp.root, input)?.decision).toBe("ask");
  });
});
