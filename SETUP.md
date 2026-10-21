# SETUP: install the agent brain in a project

**You are an AI coding agent (Claude Code or similar), and the user asked you to follow this file.** Work through the steps in order. Don't skip the explanation or the interview, and don't make choices the user should make. Where this file says *ask*, use your question tool if you have one (it lets the user pick from options), or ask in plain text.

Placeholders look like `{{NAME}}`. When you finish, no placeholder may remain anywhere in the user's project.

---

## Step 0. Find the kit and the target

- **The kit** is the repository this file lives in. If its files aren't in the working directory, clone it to a temporary folder: `git clone --depth 1 https://github.com/singh-pk/agent-brain-kit "$(mktemp -d)/kit"`, and read from there.
- **The target** is the user's project: the working directory, unless the user named another. If the working directory *is* a fresh clone of the kit (the user made a new repo from it), the target is the same folder, and you'll replace the kit's own `README.md` and remove `SETUP.md` at the end.
- Note whether the target is **new** (empty or nearly) or **existing** (has code). Run `git status` there. If it isn't a git repository, ask before running `git init`.

## Step 1. Explain the process to the user

Before asking anything, explain what they're getting, in your own words and briefly. Cover these points and show this diagram:

```
         ┌───────────────────────────────────────────────┐
         │ THE REPO IS THE BRAIN  (every agent reads it)  │
         │ AGENTS.md · decisions (ADRs) · CHANGELOG       │
         │ DESIGN.md (how it works) · PLAN.md (test IDs)  │
         └───────────────────────┬───────────────────────┘
                                 ▼
 ┌──────────┐ "agreed" ┌───────────────────────────┐ "ship it" ┌──────────┐
 │ 1. PLAN  │─────────▶│ 2. BUILD                  │──────────▶│ 4. SHIP  │
 │ plan.html│          │ SDK → fresh agent writes  │           │ one PR,  │
 │ D1, Q1…  │          │ spec tests → LOCKED →     │           │ CI green │
 │ ADRs     │          │ code → checks → fresh     │           │ you merge│
 └────▲─────┘          │ code-reviewer agent       │           └──────────┘
      │ plan can't hold└────────────┬──────────────┘
      └─────────────────────────────┤        3. TEST REVIEW (review.html)
```

1. **The repo is the memory.** Agents forget between sessions. `AGENTS.md`, one decision record (ADR) per decision, and a changelog mean any new session, or any AI tool, knows what's settled in minutes. Rejected ideas are recorded too, with "reopen only if" conditions, so they stop coming back.
2. **People decide; agents do the work.** Each piece of work, a *module*, stops twice for the user: a plan page before code, and a test review page before merge. Both are local HTML pages with lettered options and a reply box, so judging one takes minutes.
3. **Agents can't mark their own homework.** A separate agent writes the tests from the agreed plan before the code exists, and a hook locks them. The builder must make the code fit what was agreed, or reopen the plan.
4. **Fresh eyes review everything.** A `code-reviewer` agent and a `cold-reader` agent start with a clean context, so they don't share the author's blind spots.
5. **Machines check the rules.** One check command, a pre-commit hook and CI enforce the records, the test locks and the project's own linters.

Then say what happens next: about eight questions, then the agent installs and customises everything, including a theme for the HTML pages, runs the checks, and shows the result. Ask whether to go ahead.

## Step 2. Learn the project

If the target has code, read it before asking: the main language, the package manager, the test runner, linters, CI, and any existing `AGENTS.md`, `CLAUDE.md`, `README.md`, `package.json` and git hooks setup. Use what you find to pre-fill recommendations in step 3, so the user mostly confirms.

## Step 3. Interview

Ask these, a few at a time, each with a recommended answer first. Skip any the code already answers, but say what you found.

1. **Name and one line.** The project's name, and one sentence on what it is and who it's for.
2. **Owner.** Who signs off the gates: the user's name or role, such as "the founder" or "the tech lead".
3. **Stack.** The main language, and the commands that run its tests and linters. Offer the presets in [Stack presets](#stack-presets). For a mixed stack, pick the language the modules will mostly be written in.
4. **The check command.** One command that runs everything before a commit. Recommend `bun run check`, which runs the kit's process checks plus the project's own lint and test commands, wired in step 5.
5. **Spelling.** British or American English for docs.
6. **Decision areas.** Five to ten short labels for ADRs, such as `api`, `billing`, `auth`, `data`, `ui`, `infra`, plus `process`, `testing`, `architecture`, `tooling`, `design-system` and `scope`, which the starter ADRs use. Propose them from the code or the one-line description.
7. **Theme for the HTML pages.** Offer:
   - *Derive it from my brand:* the user gives a website URL, a logo or brand colours, and you build the palette and pick fonts to match.
   - *I'll give colours and fonts:* an accent colour, and heading, body and code fonts from Google Fonts.
   - *Pick one for me:* offer three named directions, each with its accent, background and fonts. For example, **Paper** (warm off-white, ink blue, IBM Plex Sans and Bricolage Grotesque, the kit's default), **Terminal** (cool grey, green accent, Inter and JetBrains Mono), and **Studio** (cream, deep red accent, Source Serif 4 headings and Source Sans 3 body).
   Also ask the corner radius: sharp (4px), soft (10px, default) or round (16px).
8. **Extras.** Ask: a GitHub Actions workflow that runs the check command on each push and pull request (recommend yes, if they use GitHub)? And what to put in `DESIGN.md` and `PLAN.md` now: drafted from the existing code and README (existing projects), drafted from a short description (new projects), or left as stubs.

Sum up the answers in a short list and ask for a yes before writing anything.

## Step 4. Install the files

Copy these from the kit into the target, keeping their paths. **Never overwrite an existing file without asking.** For each clash, merge as the last column says.

| Path | If it already exists in the target |
|---|---|
| `AGENTS.md` | Merge: keep the user's rules, add the kit's sections, and remove duplicates. Ask if two rules conflict |
| `CLAUDE.md` | Make sure its first line is `@AGENTS.md`; keep the rest |
| `CHANGELOG.md` | Add the kit's dated entry at the top; keep the history |
| `DESIGN.md`, `PLAN.md` | Ask: use the existing file as the design (and point `designFiles` in `process.json` at it), or add these alongside |
| `process.json`, `tsconfig.json` | `tsconfig.json`: if the project has one, rename the kit's to `tsconfig.scripts.json` and change `tsc -p .` in `package.json` to `tsc -p tsconfig.scripts.json` |
| `package.json` | Merge: add the kit's `scripts` and `devDependencies`; keep everything else. If a `check` script exists, keep it and append `&& bun run check:process` |
| `docs/building.md`, `docs/writing-code.md`, `docs/writing-docs.md` | Rename the kit's, such as `docs/process/…`, and fix the links |
| `docs/decisions/` (`README.md`, `template.md`, `0001`–`0005`) | If the project already keeps ADRs, renumber the kit's to follow them and fix every link |
| `docs/modules/templates/` (`plan.html`, `review.html`, `module.css`, `module.js`) | — |
| `docs/evidence/.gitkeep` | — |
| `scripts/` (`check_history.ts`, `spec_lock.ts`, `spec_lock.test.ts`, `config.ts`, `markdown.ts`) | Put them in `scripts/agent-brain/` and fix the paths in `package.json`, `.claude/settings.json` and `.githooks/pre-commit` |
| `.agents/skills/` (five folders) | — |
| `.claude/skills/` | Symlinks to `.agents/skills/<name>`. Recreate them with `ln -s ../../.agents/skills/<name> .claude/skills/<name>` |
| `.claude/agents/` (three files) | Keep the user's agents; ask about a name clash |
| `.claude/settings.json` | Merge the `PreToolUse` hook into the existing `hooks` |
| `.githooks/pre-commit` | If the project uses another hook manager (husky, lefthook, pre-commit), add the two commands there instead and drop the `prepare` script |
| `.github/workflows/check.yml` | Only if the user said yes to CI in step 3. If a workflow already runs checks, add its two steps there instead |
| `.gitignore` | Add `node_modules/` if missing |

Don't copy `SETUP.md`, the kit's `README.md` or its `LICENSE`.

The process checks run on [Bun](https://bun.sh). If `bun --version` fails, tell the user and offer the install command from bun.sh. Don't run an install script without their yes.

## Step 5. Customise

### 5a. Fill the placeholders

| Placeholder | Fill with |
|---|---|
| `{{PROJECT}}` | The project's name |
| `{{ONE_LINE}}` | The one-line description |
| `{{OWNER}}` | Who signs off the gates |
| `{{SPELLING}}` | `British` or `American` |
| `{{LANGUAGE}}` | The main language |
| `{{CHECK_CMD}}` | The check command, such as `bun run check` |
| `{{TEST_CMD}}` | The command that runs every test |
| `{{MUTATION_TOOL}}` | The mutation-testing tool's name, from the preset |
| `{{MUTATION_CMD}}` | Its command for one package |
| `{{API_LISTING_CMD}}` | A command that prints a package's public names and doc comments |
| `{{SPEC_FILE_EXAMPLE}}` | `specTestFile` with `{module}` replaced by `billing_engine` |
| `{{SDK_MECHANISM}}` | One or two sentences: how the language marks names public, and how private code is kept private. From the preset |
| `{{LINT_LIMITS}}` | The complexity, nesting and function-length limits the project's linters enforce, in one sentence. If none, recommend rules for its linter and ask before turning them on |
| `{{SETUP_STEPS}}` | Anything else a new clone needs, such as installing the linter. Or delete the placeholder |
| `{{CLASSDEFS}}` | Four Mermaid `classDef` lines built from the theme (5c) |
| `{{DESIGN_OVERVIEW}}`, `{{PLAN_ITEMS}}` | From step 3, question 8. A stub says what goes there in one sentence |

Then set `process.json`: `specTestFile` from the preset, `areas` from question 6, and `designFiles` as step 4 decided.

Wire the project's own checks into `package.json`: `check` runs `check:process` and then the project's lint and test commands, so `{{CHECK_CMD}}` covers everything.

### 5b. Stack presets

| Language | `specTestFile` | Test | Mutation tool and command | Public names and how private code stays private | API listing |
|---|---|---|---|---|---|
| TypeScript / JavaScript | `spec_{module}.test.ts` | `bun test`, `npx vitest run` or `npx jest` | Stryker: `npx stryker run --mutate "src/<package>/**/*.ts"` | A package's public names are what its `index.ts` exports. Other files are private, and a lint rule (`no-restricted-imports` or `eslint-plugin-boundaries`) stops imports that bypass `index.ts` | `npx tsc --declaration --emitDeclarationOnly --outDir "$(mktemp -d)"` and read the package's `index.d.ts` |
| Python | `test_spec_{module}.py` | `pytest` | mutmut: `mutmut run --paths-to-mutate src/<package>/` | A package's public names are listed in `__all__` in its `__init__.py`. Private names start with `_`, and import-linter stops imports of private modules | `python -m pydoc <package>` |
| Go | `spec_{module}_test.go` | `go test ./...` | gremlins: `go tool gremlins unleash ./<package>/` | Exported names start with a capital letter. Private code sits in the package's own `internal/` folder, which the compiler hides from other packages | `go doc -all ./<package>` |
| Rust | `spec_{module}.rs` (in `tests/`) | `cargo test` | cargo-mutants: `cargo mutants -p <crate>` | Public names are marked `pub`. Everything else is private to its module, and `pub(crate)` keeps shared helpers inside the crate | `cargo doc --no-deps -p <crate>`, or `cargo public-api` |
| Other | Ask | Ask | Search for the language's maintained mutation tool, and check it as `docs/building.md` checks libraries | Ask how the language marks names public | Ask |

### 5c. Theme the pages

The look of every module page comes from the token blocks at the top of `docs/modules/templates/module.css`: a light block (`:root`), a dark block for system dark mode, and a matching forced-dark block (`:root[data-theme="dark"]`). Rewrite their values; keep every token name, and keep the two dark blocks identical.

1. **Build the palette** from the answer to question 7.
   - `--accent` is the brand colour, adjusted until it passes contrast. `--accent-soft` is a pale tint of it in light mode and a deep shade in dark mode.
   - `--bg`, `--surface` and `--sunk` are three close neutrals tinted towards the brand. `--surface` sits lightest in light mode and slightly raised from `--bg` in dark mode.
   - `--ink`, `--ink-2` and `--ink-3` are text, from strongest to faintest. `--line` and `--line-strong` are borders.
   - `--good`, `--warn` and `--bad` stay recognisably green, amber and red, shifted towards the palette's temperature. `--violet` and `--teal` are two more hues for diagram nodes, distinct from the accent and from each other. Each has a `-soft` partner.
   - `--grid` is the accent at about 6% opacity. `--radius` comes from the corner answer. `--shadow` is subtle in light mode and `none` in dark mode.
2. **Set the fonts.** Put the chosen families in `--font-text`, `--font-head` and `--font-mono`, each with a system fallback. Replace the Google Fonts `<link href>` in both `plan.html` and `review.html` with one URL that loads exactly those families and weights: 400, 500 and 600 for text, 600 for headings, 400 to 600 for code.
3. **Check contrast** in both modes. Every text token must reach 4.5:1 on `--bg`, `--surface` and its own `-soft` background, and `--ink-3` at least 4.5:1 on `--surface`. Run this, filling in the pairs, and adjust any colour that fails:

   ```sh
   bun -e 'const l=h=>{const c=h.match(/\w\w/g).map(x=>parseInt(x,16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]};const r=(a,b)=>{const[x,y]=[l(a),l(b)].sort((m,n)=>n-m);return (x+.05)/(y+.05)};for(const[a,b]of [["#16191d","#f6f5f1"]])console.log(a,b,r(a,b).toFixed(2))'
   ```

4. **Diagrams in Markdown.** Fill `{{CLASSDEFS}}` in `docs/writing-docs.md` with four lines from the light palette: `part` (accent-soft fill, accent stroke, ink text), `blocked` (bad-soft, bad), `ok` (good-soft, good), `ext` (sunk, ink-3). For example: `classDef part fill:#e7eefa,stroke:#1f5fbf,color:#16191d`.
5. **Show it.** Open `docs/modules/templates/plan.html` in a browser (`open` on macOS, `xdg-open` on Linux), in light and dark with the page's theme button. If you can take screenshots, check both at desktop width and at 390px. Ask the user whether they like it, and adjust until they do.

### 5d. Dates

Set the `date` of ADR-0001 to ADR-0005, and the changelog's date heading, to today.

## Step 6. Verify

Run all of these in the target and fix what fails:

1. No placeholder is left: `grep -rnE '\{\{[A-Z_]+\}\}' --exclude-dir=node_modules --exclude-dir=.git --exclude=SETUP.md .` prints nothing.
2. `bun install` (this also turns on the commit hook through the `prepare` script).
3. `{{CHECK_CMD}}` passes: the type check, the spec-lock tests, the spec-lock check, the history check and the project's own checks.
4. The hook works: check `.claude/settings.json` is valid JSON, and that `echo '{"tool_name":"Read","tool_input":{}}' | bun scripts/spec_lock.ts guard` exits 0 and prints nothing.
5. Both templates open, with the theme, and their diagrams draw.

## Step 7. Commit and hand over

1. If the target was a clone of the kit, replace its `README.md` with a short one for the project that links `AGENTS.md`, and delete `SETUP.md`.
2. Show the user `git status` and a one-line summary per area: brain, process docs, templates and theme, skills, agents, checks.
3. Commit on a new branch, such as `agent-brain`, with a message whose first line says what changed, ending `Decision: ADR-0001, ADR-0002, ADR-0003, ADR-0004, ADR-0005`. Ask before pushing or opening a pull request.
4. Tell the user how to start working:
   - "Add work to `PLAN.md` as checkboxes with test IDs, then say **let's build &lt;the first box&gt;**. The agent writes the plan page and gives you its path."
   - "Answer on the page, copy the reply box into the chat, and say **agreed** when it's right. Later, say **ship it** on the review page."
   - "Any decision you make in chat, say **record that**, and it becomes an ADR."
