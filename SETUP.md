# SETUP: install the agent brain in a project

**You are an AI coding agent (Claude Code or similar), and the user asked you to follow this file.** Work through the steps in order. Don't skip the explanation or the interview, and don't make choices the user should make. Where this file says *ask*, use your question tool if you have one (it lets the user pick from options), or ask in plain text.

Placeholders look like `{{NAME}}`. When you finish, no placeholder may remain anywhere in the user's project.

---

## Step 0. Find the kit and the target

- **The kit** is the repository this file lives in. If its files aren't in the working directory, clone it to a temporary folder: `git clone --depth 1 https://github.com/singh-pk/agent-brain-kit "$(mktemp -d)/kit"`, and read from there.
- **The target** is the user's project: the working directory, unless the user named another. If the working directory *is* a fresh clone of the kit (the user made a new repo from it), the target is the same folder, and you'll replace the kit's own `README.md` and remove `SETUP.md` at the end.
- Note whether the target is **new** (empty or nearly) or **existing** (has code). Run `git status` there. If it isn't a git repository, ask before running `git init`.

## Step 1. Explain the process to the user

Before asking anything, explain what they're getting, briefly and in plain words. The user may not be an engineer: define every term the first time you use it, in one short clause. Say what you found in step 0 (for example, "an empty repository" or "an existing TypeScript project"). Cover these points and show this diagram; you may reword its labels, but keep its flow:

```
  THE REPO IS THE MEMORY: rules, decisions, changelog, design, plan
  (every agent reads these first)
                │
                ▼
  1. PLAN ──"agreed"──▶ 2. BUILD ──▶ 3. TEST REVIEW ──"ship it"──▶ 4. SHIP
  a page with           tests written     a page with the           one pull
  options for you       first by a        results, for you          request,
  to pick               separate agent,   to approve                you merge
                        then locked;
                        code until they
                        pass; fresh review
       ▲                     │
       └── back to you if the plan must change
```

1. **The repo is the memory.** AI agents forget everything between sessions. So the project keeps its memory in files: `AGENTS.md` (the rules every agent reads), one short file per decision, called an **ADR** (architecture decision record), saying what was chosen and what was turned down, and a changelog. Any new session, or any AI tool, catches up in minutes, and rejected ideas stop coming back.
2. **You decide; agents do the work.** Work is split into **modules**, pieces you could describe in a sentence, such as "send an invoice". Each module pauses twice for your approval, at a plan page before any code and a test review page before it's merged. These pauses are the **gates**. Both pages open in your browser, with options to click and a reply to copy back, so each takes a few minutes.
3. **Agents can't mark their own homework.** Before any code exists, a separate agent writes the tests from the plan you agreed. The tests are then locked, so the builder can't quietly change them to make its code pass.
4. **Fresh eyes review everything.** Two review agents start with no memory of the work, so they don't share the author's blind spots: one checks code, the other checks that docs make sense to a newcomer.
5. **Machines check the rules.** One command runs every check. It runs automatically before each commit, and on GitHub after each push (that's **CI**, continuous integration).

Then say what happens next: about six short questions in two or three rounds, most with a recommended answer to accept; then you install and customise everything, including a colour theme for the pages, run the checks and show the result. Nothing is written or installed until they confirm one summary. Ask whether to go ahead.

## Step 2. Learn the project

If the target has code, read it before asking: the main language, the package manager, the test runner, linters, CI, and any existing `AGENTS.md`, `CLAUDE.md`, `README.md`, `package.json` and git hooks setup. Use what you find to pre-fill recommendations in step 3, so the user mostly confirms.

## Step 3. Interview

Ask in rounds of up to four questions. Use free text for names, sentences and links, and multiple choice for the rest, with a recommended option first. Ask follow-ups only when an answer needs them. Where this list names no recommendation, recommend the kit's default.

**Round 1, free text:**

1. **Name and one line.** The project's name, and one sentence on what it is and who it's for, such as "A mobile app that helps dog walkers schedule and bill clients". In an existing project, propose both from the README and ask for a yes.

**Round 2, multiple choice:**

2. **Stack.** The main language. Offer the presets in [Stack presets](#stack-presets), with the one the code uses (or TypeScript on Bun for a new project) recommended. For a mixed stack, pick the language most modules will be written in.
3. **Linter and mutation testing.** Offer, recommended: "Yes, set up the preset's linter with limits on complexity and function length, and its mutation-testing tool (it plants small bugs to check the tests catch them)". Other options: linter only; neither for now (a first `PLAN.md` box will set them up). In an existing project with a linter, keep it and ask only about limits and mutation testing.
4. **Theme for the pages.** Offer:
   - *Derive it from my brand:* follow up in free text for a website, logo or brand colours. If the reference isn't the user's own brand, say so in the summary. Where its fonts aren't on Google Fonts, pick the closest free match.
   - *Pick one for me:* follow up with three named looks, each with its accent, background and fonts. **Paper** (warm off-white, ink blue; headings Bricolage Grotesque, body IBM Plex Sans, code JetBrains Mono; the kit's default), **Terminal** (cool grey, green accent; headings and body Inter, code JetBrains Mono), and **Studio** (cream, deep red accent; headings Source Serif 4, body Source Sans 3, code Source Code Pro).
   - *I'll give colours and fonts:* follow up in free text for an accent colour and heading, body and code fonts from Google Fonts.
   Corners default to soft (10px); offer sharp (4px) or round (16px) during the preview in step 5c, not as a question here.
5. **Spelling.** British or American English for the docs. Recommend British only if the user writes British spelling; the kit's docs are British, and step 5d converts them.

**Round 3, multiple choice:**

6. **Extras.** Two questions: a GitHub Actions workflow that runs the checks on each push and pull request (recommend yes, if they use GitHub); and what to put in `DESIGN.md` and `PLAN.md` now: drafted from the existing code and README (existing projects), drafted from the one-line description (new projects), or left as stubs.

**Defaults, stated rather than asked:**

- **Who approves the gates.** In a one-person project, the user; write "the founder" or the role they gave. Ask only if they mention a team.
- **The check command:** `bun run check`, which runs the kit's process checks plus the project's own lint and test commands, wired in step 5. If the project already has a check command, keep it and say so.
- **Decision areas:** tags that let you find related decisions later. Propose five to ten from the one-line description, such as `invoicing`, `payments`, `auth`, `ui`, plus the six the starter ADRs use: `process`, `testing`, `architecture`, `tooling`, `design-system` and `scope`.
- **Test and mutation commands,** from the preset.

**The summary.** List every answer and every default above, including what will be installed (Bun if missing, the linter, the mutation tool) and the decision areas, and invite edits. Ask for one yes that covers everything steps 4 and 5 will do. Don't ask further questions after it, except to approve the theme in step 5c and to resolve a file clash in step 4.

## Step 4. Install the files

Copy these from the kit into the target, keeping their paths. **Never overwrite an existing file without asking.** For each clash, merge as the last column says.

| Path | If it already exists in the target |
|---|---|
| `AGENTS.md` | Merge: keep the user's rules, add the kit's sections, and remove duplicates. Ask if two rules conflict |
| `CLAUDE.md` | Make sure its first line is `@AGENTS.md`; keep the rest |
| `CHANGELOG.md` | Install only the kit's header and its `Decided` and `Added` lines, under today's date; drop the kit's own `Fixed` lines. If the project has a changelog, add that entry at the top and keep its history |
| `DESIGN.md`, `PLAN.md` | Ask: use the existing file as the design (and point `designFiles` in `process.json` at it), or add these alongside |
| `process.json`, `tsconfig.json` | If the project is TypeScript with no tsconfig of its own, add its source folders, such as `"src/**/*.ts"`, to the kit's `include`, so `tsc` checks the product code too. The `include` also covers any of the project's own files in `scripts/`; if those don't type-check, tell the user and ask whether to fix them or narrow `include` to the kit's scripts. If the project has one, rename the kit's to `tsconfig.scripts.json` and, in the `check:process` script only, change `tsc -p .` to `tsc -p tsconfig.scripts.json` |
| `package.json` | Merge: add the kit's `scripts` and `devDependencies`; keep everything else. If a `check` script exists, keep it and append `&& bun run check:process`. If none exists, step 5a writes one |
| `docs/building.md`, `docs/writing-code.md`, `docs/writing-docs.md` | Rename the kit's, such as `docs/process/…`, and fix the links |
| `docs/decisions/` (`README.md`, `template.md`, `0001`–`0005`) | If the project already keeps ADRs, renumber the kit's to follow them and fix every link |
| `docs/modules/templates/` (`plan.html`, `review.html`, `module.css`, `module.js`) | — |
| `docs/evidence/.gitkeep` | — |
| `scripts/` (`check_history.ts`, `spec_lock.ts`, `spec_lock.test.ts`, `config.ts`, `markdown.ts`) | If `scripts/` already holds files, put these five in `scripts/agent-brain/` and change every path to these five files to `scripts/agent-brain/`: run `grep -rn 'scripts/' --exclude-dir=node_modules --exclude-dir=.git .` over the installed files and fix each hit that names a kit script, including `bun test scripts` in `package.json`, `.claude/settings.json`, `.githooks/pre-commit`, the CI workflow, the `AGENTS.md` repo map, ADR-0001 and ADR-0005, the scripts' usage text, and step 6 below. Editing the starter ADRs here is fine: they aren't committed yet. The history check finds the repo root through git, and the spec lock uses the folder `bun run` starts in, the package root, so both work from either folder. If the project's own test command already runs `scripts/**/*.test.ts`, drop `bun test scripts` from `check:process` so the tests don't run twice |
| `bun.lock` | Keep the project's; `bun install` in step 6 adds the kit's two dev dependencies |
| `.agents/skills/` (five folders) | — |
| `.claude/skills/` | Symlinks to `.agents/skills/<name>`. Recreate them with `ln -s ../../.agents/skills/<name> .claude/skills/<name>` |
| `.claude/agents/` (three files) | Keep the user's agents; ask about a name clash |
| `.claude/settings.json` | Merge the `PreToolUse` hook into the existing `hooks` |
| `.githooks/pre-commit` | If the project uses another hook manager (husky, lefthook, pre-commit), add the two commands there instead and drop the `prepare` script |
| `.github/workflows/check.yml` | Only if the user said yes to CI in step 3. If a workflow already runs checks, add its two steps there instead |
| `.gitignore` | Add `node_modules/` and the mutation tool's output folders (`.stryker-tmp/` and `reports/mutation/` for Stryker, `mutants/` for mutmut, `mutants.out*/` for cargo-mutants) if missing |

Don't copy the kit's top-level `SETUP.md`, `README.md` or `LICENSE`. Do copy `docs/decisions/README.md`: it is the decisions index, not the kit's README.

The process checks run on [Bun](https://bun.sh). If `bun --version` fails, tell the user and offer the install command from bun.sh. Don't run an install script without their yes.

## Step 5. Customise

### 5a. Fill the placeholders

| Placeholder | Fill with |
|---|---|
| `{{PROJECT}}` | The project's name |
| `{{ONE_LINE}}` | The one-line description |
| `{{OWNER}}` | Who signs off the gates |
| `{{SPELLING}}` | `British` or `American` |
| `{{CHECK_CMD}}` | The check command, such as `bun run check` |
| `{{TEST_CMD}}` | The command that runs every test, including spec tests wherever they live (for Bun, `bun test` rather than a script limited to one folder) |
| `{{MUTATION_TOOL}}` | The mutation-testing tool's name, from the preset |
| `{{MUTATION_CMD}}` | Its command for one package |
| `{{API_LISTING_CMD}}` | A command that prints a package's public names and doc comments |
| `{{SPEC_FILE_EXAMPLE}}` | `specTestFile` with `{module}` replaced by `billing_engine` |
| `{{SPEC_NAME_EXAMPLE}}` | The preset's spec test name, in code format |
| `{{SDK_MECHANISM}}` | One or two sentences, starting with the language's name: how it marks names public, and how private code is kept private. From the preset |
| `{{COMMIT_CHECKS}}` | What the check command really catches, no more: what the project's linter and type checker check (for example "formatting, complexity and unused code (ruff); types (mypy)"), then "failing tests, changed spec tests and broken ADRs". With no linter, say so |
| `{{LINT_LIMITS}}` | The complexity, nesting and function-length limits the project's linters enforce, in one sentence. If step 3 agreed a linter, its limits. If the user declined one, write that there are none yet and the `code-reviewer` agent judges shape and nesting instead |
| `{{SETUP_STEPS}}` | Anything else a new clone needs, such as installing the linter. Or delete the placeholder |
| `{{CLASSDEFS}}` | Six Mermaid `classDef` lines built from the theme (5c) |
| `{{DESIGN_OVERVIEW}}`, `{{PLAN_ITEMS}}` | From step 3, question 6. A stub says what goes there in one sentence |

If the user's linter can't enforce the SDK rule in `{{SDK_MECHANISM}}`, say so in that sentence and that the `code-reviewer` agent checks it instead.

The mutation tool and linter are dev dependencies, agreed in step 3's question 3 and summary. Install them, then run each once to confirm its command works. ADR-0005 already covers them, so they need a line under Added in the changelog, not their own ADR. If the user chose to wait, add a first box to `PLAN.md` to set it up, and still fill `{{MUTATION_TOOL}}` and `{{MUTATION_CMD}}` from the preset, so the docs say what that box will install.

Then set `process.json`: `specTestFile` from the preset, `areas` from the decision areas in step 3's summary, and `designFiles` as step 4 decided.

Wire the project's own checks into `package.json`, so `{{CHECK_CMD}}` covers everything. In a new project, or an existing one with no `check` script: `"check": "bun run check:process && <lint command> && <test command>"`, leaving out the lint part if there's no linter. In an existing project, step 4 already appended `check:process` to its `check`.

### 5b. Stack presets

Run the project's tools through its own runner where it has one, such as `uv run pytest` or `npx vitest run`. Check each command below works in this project before writing it into a doc; if one fails, fix it and tell the user.

**Tests**

| Language | `specTestFile` | Spec test name | Test command | Mutation tool and command |
|---|---|---|---|---|
| TypeScript / JavaScript | `spec_{module}_test.ts` | `test("T0003 refunds never exceed the charge", …)` | `bun test`, `npx vitest run` or `npx jest` | Stryker (`@stryker-mutator/core`): `npx stryker run --mutate "src/<package>/**/*.ts"`. With `bun test`, set Stryker's `testRunner` to `command` and its command to `bun test` in `stryker.config.json` |
| Python | `test_spec_{module}.py`, in the tests folder | `def test_t0003_refunds_never_exceed_the_charge():`. pytest collects only names starting with `test`, so the ID goes after that prefix | `pytest`, with `testpaths = ["tests"]` in `[tool.pytest.ini_options]` so mutmut's copies in `mutants/` aren't collected | mutmut 3: set `[tool.mutmut] source_paths = ["src/"]` in `pyproject.toml`, then `mutmut run "<package>.*" && mutmut export-cicd-stats && cat mutants/mutmut-cicd-stats.json` for the score (`mutmut results` lists only survivors). Every test must pass first |
| Go | `spec_{module}_test.go` | `func TestT0003RefundsNeverExceedTheCharge(t *testing.T)` | `go test ./...` | gremlins, installed with `go get -tool github.com/go-gremlins/gremlins/cmd/gremlins@latest`: `GOFLAGS=-count=1 go tool gremlins unleash --timeout-coefficient 10 ./<package>/`. It works per package and needs passing tests |
| Rust | `spec_{module}.rs`, in `tests/` (integration tests reach only public names) | `fn t0003_refunds_never_exceed_the_charge()`, lowercase so the compiler doesn't warn | `cargo test --no-fail-fast` | cargo-mutants: `cargo mutants -f 'src/<module>.rs'` (or `'src/<module>/**'`) |
| Other | Ask | The ID first, after any prefix the test runner requires | Ask | Search for the language's maintained mutation tool, and check it as `docs/building.md` checks libraries |

**Code and CI**

| Language | Linter and limits to recommend | Public names and how private code stays private | API listing | CI steps, after `bun install` |
|---|---|---|---|---|
| TypeScript / JavaScript | oxlint or ESLint: `complexity` 10, `max-depth` 3, `max-lines-per-function` 60 | A package's public names are what its `index.ts` exports. Other files are private, and a lint rule (`no-restricted-imports` or `eslint-plugin-boundaries`) stops imports that bypass `index.ts` | `out=$(mktemp -d) && npx tsc -p . --noEmit false --declaration --emitDeclarationOnly --outDir "$out" && cat "$out/src/<package>/index.d.ts"` | `actions/setup-node` and `npm ci`, only if the project uses npm |
| Python | ruff: `C90` (`max-complexity = 10`), `PLR0912` and `PLR0915`. Its nesting rule is preview-only, so the `code-reviewer` agent judges nesting | A package's public names are listed in `__all__` in its `__init__.py`. Private names start with `_`. import-linter can stop imports of private modules; offer it as a second dependency, or leave the check to the `code-reviewer` agent | `PYTHONPATH=src python -m pydoc <package>` (drop `PYTHONPATH` without a `src/` folder) | `astral-sh/setup-uv` and `uv sync --locked`, or `actions/setup-python` and the project's install |
| Go | golangci-lint with `gocognit`, `nestif` and `funlen` | Exported names start with a capital letter; everything else is private to its package. Code in an `internal/` folder can be imported only from inside the folder that holds `internal/` | `go doc -all ./<package>` | `actions/setup-go` with `go-version-file: go.mod` |
| Rust | clippy with `cognitive_complexity`, `too_many_lines` and `excessive_nesting` (thresholds in `clippy.toml`) | Public names are marked `pub`. Everything else is private to its module, and `pub(crate)` keeps shared helpers inside the crate | `cargo +nightly public-api -p <crate>` if nightly is installed; otherwise `grep -rnE '^\s*pub ' src/<module>*` (`cargo doc` writes HTML, not text) | `dtolnay/rust-toolchain` with `components: clippy` |
| Other | Ask | Ask how the language marks names public | Ask | The language's official setup action |

Pin every action you add by its full commit SHA with the version as a comment, as the kit's workflow does; find the SHA with `git ls-remote https://github.com/<owner>/<action> refs/tags/<version>`. Commit the language's lockfile (`uv.lock`, `go.sum`, `Cargo.lock`) so CI installs the same versions. The test and mutation tools must be on the `PATH` that git hooks and Claude Code's hooks see; if one is installed somewhere else (such as `~/.cargo/bin`), say so in `{{SETUP_STEPS}}`.

### 5c. Theme the pages

The look of every module page comes from the token blocks at the top of `docs/modules/templates/module.css`: a light block (`:root`), a dark block for system dark mode, and a matching forced-dark block (`:root[data-theme="dark"]`). Rewrite their values; keep every token name, and keep the two dark blocks identical.

1. **Build the palette** from the answer to question 4.
   - `--accent` is the brand colour, adjusted until it passes contrast. `--accent-soft` is a pale tint of it in light mode and a deep shade in dark mode.
   - `--bg`, `--surface` and `--sunk` are three close neutrals tinted towards the brand. `--surface` sits lightest in light mode and slightly raised from `--bg` in dark mode.
   - `--ink`, `--ink-2` and `--ink-3` are text, from strongest to faintest. `--line` and `--line-strong` are borders.
   - `--good`, `--warn` and `--bad` stay recognisably green, amber and red, shifted towards the palette's temperature. `--adapter` and `--store` colour the adapter and stored-data nodes in diagrams: two more hues, distinct from the accent and from each other. Each has a `-soft` partner.
   - `--grid` is the accent at about 6% opacity. `--radius` is 10px unless the user picks sharp (4px) or round (16px) during the preview below. `--shadow` is subtle in light mode and `none` in dark mode.
2. **Set the fonts.** Put the chosen families in `--font-text`, `--font-head` and `--font-mono`, each with a system fallback. Replace the Google Fonts `<link href>` in both `plan.html` and `review.html` with one URL that loads exactly those families and weights: 400, 500 and 600 for text, 600 for headings, 400 to 600 for code.
3. **Check contrast** in both modes. Every text token must reach 4.5:1 on `--bg`, `--surface` and its own `-soft` background, and `--ink-3` at least 4.5:1 on `--surface`. Also check `--surface` on `--accent`, the colours of the primary button. Run this, filling in the pairs, and adjust any colour that fails:

   ```sh
   bun -e 'const l=h=>{const c=h.match(/\w\w/g).map(x=>parseInt(x,16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]};const r=(a,b)=>{const[x,y]=[l(a),l(b)].sort((m,n)=>n-m);return (x+.05)/(y+.05)};for(const[a,b]of [["#16191d","#f6f5f1"]])console.log(a,b,r(a,b).toFixed(2))'
   ```

4. **Diagrams in Markdown.** Fill `{{CLASSDEFS}}` in `docs/writing-docs.md` with six lines from the light palette, one per class the module pages use: `part` (accent-soft fill, accent stroke, ink text), `adapter` (adapter-soft, adapter), `test` (warn-soft, warn, plus `stroke-dasharray:5 3`), `store` (store-soft, store), `external` (sunk, ink-3) and `blocked` (bad-soft, bad). For example: `classDef part fill:#e7eefa,stroke:#1f5fbf,color:#16191d`.
5. **Language tag.** For American spelling, change `lang="en-GB"` to `lang="en-US"` in both templates.
6. **Show it.** Open `docs/modules/templates/plan.html` in a browser (`open` on macOS, `xdg-open` on Linux), in light and dark with the page's theme button. If you can take screenshots, check both at desktop width and at 390px. The page follows the system theme, so to capture each mode, screenshot a copy placed in a new folder next to `templates/`, such as `docs/modules/_preview/` (its `../templates/` links must resolve; delete the folder afterwards), with `data-theme="light"` or `data-theme="dark"` on `<html>`, never the template. Headless Chrome won't go below 500px wide, so for phone width put the copy in a 390px `<iframe>` on a wrapper page. Ask the user whether they like it, and whether to change the corners (sharp 4px, soft 10px, round 16px), and adjust until they do.

### 5d. Dates and spelling

Set the `date` of ADR-0001 to ADR-0005, and the changelog's date heading, to today.

The installed docs are written in British English. If the user chose American, convert every installed Markdown file and both templates (behaviour → behavior, organise/organisation → organize/organization, colour → color, licence → license, judgement → judgment, centre → center, catalogue → catalog, "the other way round" → "the other way around"; then grep for `-ise`, `-our` and `-ence` words to catch the rest), leaving code, commands and file names alone.

## Step 6. Verify

Run all of these in the target and fix what fails:

1. No placeholder is left: `grep -rnE '\{\{[A-Z_]+\}\}' --exclude-dir=node_modules --exclude-dir=.git --exclude=SETUP.md .` prints nothing.
2. `bun install` (this also turns on the commit hook through the `prepare` script).
3. `{{CHECK_CMD}}` passes: the type check, the spec-lock tests, the spec-lock check, the history check and the project's own checks.
4. The hook works: check `.claude/settings.json` is valid JSON, and that `echo '{"tool_name":"Read","tool_input":{}}' | bun scripts/spec_lock.ts guard` (or the path step 4 chose) exits 0 and prints nothing.
5. Both templates open, with the theme, and their diagrams draw.

## Step 7. Commit and hand over

1. If the target was a clone of the kit, replace its `README.md` with a short one for the project that links `AGENTS.md`, and delete `SETUP.md`.
2. Show the user `git status` and a one-line summary per area: brain, process docs, templates and theme, skills, agents, checks.
3. Commit on a new branch, such as `agent-brain`. In a new repository with no commits yet, commit on `main` instead, so later pull requests have a base. The commit message's first line says what changed and it ends with `Decision: ADR-0001, ADR-0002, ADR-0003, ADR-0004, ADR-0005`. Ask before pushing or opening a pull request.
4. Tell the user how to start working:
   - "Add work to `PLAN.md` as checkboxes with test IDs, then say **let's build &lt;the first box&gt;**. The agent writes the plan page and gives you its path."
   - "Answer on the page, copy the reply box into the chat, and say **agreed** when it's right. Later, say **ship it** on the review page."
   - "Any decision you make in chat, say **record that**, and it becomes an ADR."
