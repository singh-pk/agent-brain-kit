# {{PROJECT}}: guide for AI agents (and humans)

{{ONE_LINE}}

This file is the project's "brain". Read it before you touch anything. Every AI tool reads this file: Claude Code through `CLAUDE.md`, and others directly. Keep project rules here, so they all follow the same ones.

## 1. Read before you act

Read these in order. They are the project's memory.

| File | What it holds | Answers |
|---|---|---|
| [`docs/decisions/README.md`](docs/decisions/README.md) | **Every decision taken**, with its status and areas | *Has this already been decided? What was rejected?* |
| [`CHANGELOG.md`](CHANGELOG.md) | **Every change made**, newest first, linked to decisions | *What changed recently, and why?* |
| [`DESIGN.md`](DESIGN.md) | The design. **Source of truth** for how {{PROJECT}} works | *How does it work, exactly?* |
| [`PLAN.md`](PLAN.md) | The build plan: tasks as checkboxes, and test IDs (`T0001`) | *What gets built when, and how is it proven?* |

Git history is the final record: `git log --follow -p <file>` shows exactly what changed and when.

## 2. Before you propose or change anything in the design

1. **Search the decisions first.** List `docs/decisions/` (each file name states the decision), then run `grep -ril "<topic>" docs/decisions/`.
2. **If an accepted ADR covers it, follow it.** Don't re-argue it.
3. **Don't re-propose a rejected option.** Each ADR lists the options it turned down and a **"Reopen only if"** section. Raise a rejected option again only if one of those conditions now holds. Name the condition and the evidence.
4. **If you still think a decision is wrong,** write a new ADR with `status: proposed` that names the old one in its context. Ask the user. Never quietly edit `DESIGN.md` to contradict an accepted ADR.
5. **If two ADRs seem to conflict,** stop and tell the user. Don't pick one yourself.

## 3. Recording: every decision and every change

A change is **complete** only when all of these land in the **same commit**:

| You did… | You must also… |
|---|---|
| Made or changed a decision | Add `docs/decisions/NNNN-title.md` from [`template.md`](docs/decisions/template.md), using the next free number |
| Replaced an earlier decision | Set the old ADR's `status: superseded` and `superseded-by`. Leave the rest of the old file alone |
| Changed anything in the design, plan or docs | Add a line under the newest date in `CHANGELOG.md`, citing ADR links and test IDs |
| Anything above | Run `bun run history`, which checks ADR fields, links and the changelog |

**What counts as a decision:** anything a later person could reasonably choose differently, and that would cost real work to undo. That covers a mechanism, a boundary, a default, a trade-off, a dependency, or something ruled out of scope. Typos, rewording and new diagrams are changes, not decisions.

**ADRs are append-only.** Once an ADR is `accepted` or `rejected`, change only its `status`, `superseded-by` and `date`, fix a typo, or turn a cited id into a link. To change the substance, write a new ADR.

**Rejected ideas get ADRs too.** When an idea is discussed and turned down, record it with `status: rejected`. That stops the next agent from proposing it again.

**Commit messages** say what changed on the first line. End with trailers:

```
Decision: ADR-0012, ADR-0013
Refs: T0004
```

## 4. Writing code and docs

Working code and correct pages aren't finished until they meet the bar ([ADR-0005](docs/decisions/0005-check-code-and-docs-with-linters-repo-checks-and-fresh-context-reviews.md)). Code must be something a stranger can review and safely change. Docs must be something a newcomer can learn from alone. The rules have one home each: [`docs/writing-code.md`](docs/writing-code.md) and [`docs/writing-docs.md`](docs/writing-docs.md). Read the one you need before you start.

**Building the product:** every piece of the build plan is built as a **module**, in four stages with two gates: an agreed plan page, the code, an agreed test review page, then one pull request ([ADR-0002](docs/decisions/0002-build-each-module-through-an-agreed-plan-page-then-an-agreed-test-review-page-then-one-pull-request.md)). The rules are in [`docs/building.md`](docs/building.md), and the `build-module` skill runs them. The pages are local HTML files in `docs/modules/<id>/`, never hosted pages. Every package is used only through its agreed public names, its **SDK** ([ADR-0003](docs/decisions/0003-use-every-package-only-through-its-agreed-sdk.md)). A module's **spec tests**, one per test ID, are written by a fresh agent from the agreed plan before the code exists, then locked. Never edit one to make code pass; reopen the plan instead ([ADR-0004](docs/decisions/0004-lock-spec-tests-written-from-the-plan-by-a-fresh-agent.md)).

**Writing code:**

1. **Plan first.** Before writing code, set out the data, the steps, the cost (passes over the data, disk and network calls, memory) and why this is the simplest shape. For a module, the plan is its plan page. For anything else beyond a small fix, show the plan and wait for a yes.
2. **Change only what the task needs.** No rewrites, renames or reformatting of working code on the way past.
3. **Simple and fast.** Plain functions and data; nothing built for later. Do each piece of work once: no scans inside loops, no repeated work per iteration, no copies in loops.
4. **Comments say why, never what or what changed.** Git, the ADRs and the changelog hold the history.
5. **Before committing,** run `{{CHECK_CMD}}`, then have the [`code-reviewer`](.claude/agents/code-reviewer.md) agent review the staged diff with a fresh context. Fix what it finds.

**Writing docs:**

1. **Explanation pages follow [the page shape](docs/writing-docs.md#the-shape-of-an-explanation-page):** the problem, the idea, a worked example, how it works, limits and trade-offs, changing this safely.
2. **Explain each thing before using it, show a real case before the rule, and use prose for reasoning.**
3. **Cite decisions as links,** such as `[ADR-0012](docs/decisions/0012-title.md)`, never as a bare id. The history check enforces this inside ADRs.
4. **Before committing,** run `{{CHECK_CMD}}`, then have the [`cold-reader`](.claude/agents/cold-reader.md) agent read each new or rewritten page. Fix what it finds until it passes.

## 5. House rules

- **{{SPELLING}} spelling**, short plain sentences, and jargon defined on first use.
- **Use the design's names.** Each part has one name, defined in `DESIGN.md`. Don't invent synonyms.
- **Be honest about status.** Never claim something is shipped, measured or used by customers unless `docs/evidence/` proves it.
- **Invent no numbers.** No market sizes, benchmarks or customer names that aren't in the repo.
- **Process must not slow developers down.** A rule that adds friction to normal work needs an ADR explaining why.

## 6. Repository map

```
AGENTS.md             this file: how to work here (CLAUDE.md imports it)
CHANGELOG.md          every change, newest first
DESIGN.md             the design (source of truth)
PLAN.md               the build plan and test IDs
process.json          settings the checks read: design files, ADR areas, the spec-test file name
docs/building.md      the four-stage module process
docs/writing-code.md  the bar for code
docs/writing-docs.md  the bar for docs
docs/decisions/       ADRs: one decision per file; README.md says how to find them
docs/modules/         one folder per module: plan.html, review.html, spec.lock; templates/ holds the blanks and the theme
docs/evidence/        proof gathered while building
scripts/              Bun checks: check_history.ts (ADRs, changelog), spec_lock.ts (the spec-test lock and its hook)
.claude/agents/       fresh-context agents: code-reviewer, cold-reader, spec-writer
.claude/settings.json the hook that refuses edits to locked spec tests and asks before shell writes to them
.agents/skills/       skills any AI tool can follow, linked from .claude/skills/
.githooks/pre-commit  runs the checks before each commit
```
