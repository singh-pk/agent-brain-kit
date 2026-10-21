# Writing code

**In one line:** the bar every line of {{PROJECT}} code must meet, whoever writes it: simple, fast, readable by a stranger, and changed only as much as the task needs.

**Read this if:** you're about to write or change code here, as a person or an AI agent.

---

## The bar

Code is good enough when **a stranger can review it in one sitting, understand why each part exists, and change it without fear.** That is the bar a well-run open-source project sets for outside contributions, and it's the bar here too ([ADR-0005](decisions/0005-check-code-and-docs-with-linters-repo-checks-and-fresh-context-reviews.md)).

Working code that misses the bar isn't finished. "It passes the tests" is where the review starts, not where it ends.

## 1. Think before you type

Most unreadable code comes from starting to type before the shape is clear, then patching until the tests pass. So before writing anything, write down the plan in a few lines:

- **The data:** what comes in, what goes out, and where it lives in between.
- **The steps:** the functions or files, each with one job, and what calls what.
- **The cost:** how many passes over the data, what's read from disk or the network, and what's held in memory.
- **Why this shape is the simplest one** that does the job. Name the simpler shape you considered, and why it doesn't work.

For anything beyond a small fix, show this plan and get a yes before writing the code. Read the code around the change first, and match how it already does things.

## 2. Change only what the task needs

A reviewer should see the task in the diff, and nothing else.

- Don't rewrite, reorder or reformat code that works. Don't rename things on the way past.
- Don't fix unrelated problems in the same change. Mention them, and fix them separately.
- The exception is when the task *is* the rewrite, and the plan in step 1 said so.

## 3. Choose the simplest structure

Simple means the fewest ideas a reader has to hold at once, not the fewest characters.

- **Plain functions and plain data** before interfaces, generics and patterns. Add an abstraction when a second real caller needs it, not before.
- **Build nothing for later.** No options, flags, config or hooks for a need nobody has yet.
- **Standard library first.** A dependency must save real work, and it needs an ADR.
- **Flat, not nested.** Return early instead of nesting `if` inside `if`. Each function does one job you can name in a few words.
- **Clear over clever.** A three-line loop beats a one-liner the reader has to decode.
- **Limits the linters enforce:** {{LINT_LIMITS}}

## 4. Performance is part of correctness

Know the cost of every loop you write, and do each piece of work once:

- **Look things up, don't search for them.** Checking membership inside a loop means a map or set, never a scan of a list. A scan inside a loop turns *n* into *n²*.
- **Compute once, outside the loop.** Compile regexes, build sets and read files once.
- **One pass where one pass will do.** Group items in a single walk, instead of filtering the whole list once per group.
- **Don't copy what you can reuse.** No copying a whole list or string to add one item inside a loop.
- **Keep input and output out of hot loops.** Batch reads and writes. Never call the network or disk per item when one call can serve them all.

Don't trade clarity for speed you haven't measured. The simple version with the right data structure is almost always fast enough. When speed truly needs something less obvious, the comment says why and cites the measurement.

## 5. Say each thing once

When two places compute the same thing, one of them will drift. Put it in one function and call it from both. But don't merge code that only looks alike and changes for different reasons: two similar lines are cheaper than a wrong abstraction.

## 6. Names, errors and dead code

- **Names say what a thing is or does**, not how it works. `overdueInvoices`, not `list2`. Only the usual short names (`i`, `n`, `err`, `ctx`) are abbreviated.
- **Every error is handled,** with what was being done added to it. Don't silence the type checker; handle the missing case.
- **No dead code.** No unused functions or parameters, and no code left commented out. Git keeps the old version.

## 7. Comments say why, never what or what changed

The code says *what* it does. Git, the ADRs and the [changelog](../CHANGELOG.md) say *what changed* and why the design is the way it is. A comment is only for what none of those can say.

| Write a comment for | Don't write a comment for |
|---|---|
| A reason the code can't show: `// The provider rate-limits at 10/s, so batch.` | What the next line does: `// loop over the files` |
| A decision, by id: `// ADR-0012: retry twice, then fail.` | What changed: `// added cache`, `// fixed bug` |
| A trap for the next person | Code that was removed or might come back |
| Doc comments on public names, which tools read | Thanks, notes to self, or restating the function name |

If a comment is needed to explain *what* a block does, rename things or split the function first.

## 8. Tests

Tests check behaviour, not internals, so the code can be restructured without rewriting them. There are two kinds of test, and they are treated differently ([ADR-0004](decisions/0004-lock-spec-tests-written-from-the-plan-by-a-fresh-agent.md)):

- A **spec test** proves one of the build plan's test IDs and is named after it, such as `T0003 refunds never exceed the charge`. It tests only through the package's SDK (section 9), and lives in its module's own file, named by `specTestFile` in `process.json` (`{{SPEC_FILE_EXAMPLE}}` for the module `billing-engine`). A fresh agent writes it from the agreed plan before the code exists, and its file is then **locked**: the checks fail if the file changes. If a spec test turns out to be wrong, stop and reopen the plan, as [going back](building.md#going-back) describes. Never edit it to make code pass.
- A **working test** is any other test, such as a unit test of a helper. Add, change or delete it as the code changes.

The split exists because a test the code's author can freely change no longer checks that author. Editing a failing test is the most common way coding agents cheat, and locking the tests that state what was agreed stops it without slowing down the rest.

## 9. Every package is an SDK

Every caller outside a package uses it only through its **public names**, the ones the package chooses to expose. Those names are its **SDK** (software development kit): the whole contract between the package and its callers ([ADR-0003](decisions/0003-use-every-package-only-through-its-agreed-sdk.md)). In {{LANGUAGE}}, {{SDK_MECHANISM}}

The SDK is decided before the code. Each module's plan page shows the SDK: the public names, their signatures and a usage example. The user agrees that page before any code is written. The code is then written to fit the SDK, not the other way round.

| Do | Because, without it |
|---|---|
| Expose only what a caller needs. Keep the rest private | Every public name is something a caller can depend on. Extra names tie callers to code we meant to keep changing |
| Give every public name a doc comment that states its contract: what it returns, its errors, and whether it is safe to use concurrently | A caller has to read the code to know what it may rely on |
| Give each package at least one runnable example | Usage gets guessed from tests |
| Return errors callers can tell apart by type or value, not by message text | A caller matching error text breaks when the wording changes |
| Keep state in values the caller creates, never in module-level globals | Two callers would share and overwrite each other's state, and tests can't run in parallel |
| Test through the SDK. Test private code directly only when the SDK can't reach a case | Tests tied to internals break on every refactor |

These rules don't conflict with "build nothing for later". Agreeing an SDK means choosing the *least* to expose for the callers that exist now.

**When the code needs a different SDK:** an agreed SDK is part of the agreed plan. If the code needs a different one, the agent stops and reopens the plan page, as [going back](building.md#going-back) describes. Adding, removing or renaming a public name, changing a signature, or changing a stated contract all count.

## How the bar is enforced

Rules on a page drift out of an agent's attention during a long session. So the bar is enforced in four layers, cheapest first ([ADR-0005](decisions/0005-check-code-and-docs-with-linters-repo-checks-and-fresh-context-reviews.md)):

| Layer | What it catches | How |
|---|---|---|
| 1. This page | Everything, if it's read | [`AGENTS.md`](../AGENTS.md) sends every agent here before it writes code |
| 2. The plan first | A wrong or overcomplicated shape, before any code exists | Step 1 above, and the plan page for a module |
| 3. Checks on every commit | Formatting, complexity, dead code, unsafe types, unhandled errors, changed spec tests, broken ADRs | `{{CHECK_CMD}}`, run by the pre-commit hook and CI |
| 4. A fresh-context review | What checks can't judge: whether the shape is the simplest, whether the diff does more than the task | The [`code-reviewer`](../.claude/agents/code-reviewer.md) agent reads only the diff and this page. Then a person reviews |

**Setup, once per clone:** `bun install`, which also turns on the commit hook. {{SETUP_STEPS}}

The checks are a floor, not the bar. Code can pass every linter and still be the wrong shape. That's what layers 2 and 4 are for.
