# Agent brain kit

A ready-made way of working for building software with AI coding agents. Your repo keeps the memory, people make the decisions, and agents do the work without marking their own homework.

You install it by asking your agent to follow one file, [`SETUP.md`](SETUP.md). The agent explains the process, asks about six short questions about your project, stack and brand, and then installs and customises everything, including a theme for the review pages.

## Quick start

In your project (new or existing), open Claude Code and say:

```
Follow https://github.com/singh-pk/agent-brain-kit/blob/main/SETUP.md
```

Or click **Use this template** on GitHub to start a new repo from the kit, clone it, open Claude Code in it and say `Follow SETUP.md`.

Other agents that read `AGENTS.md` (Codex, Cursor and others) follow the same rules once it's installed. The skills, review agents and spec-lock hook are wired for Claude Code; other tools can follow the same files by hand.

## How it works

```
                ┌──────────────────────────────────────────────┐
                │  REPO = THE BRAIN   (every agent reads first)│
                │  AGENTS.md · decisions (ADRs) · CHANGELOG    │
                │  DESIGN.md · PLAN.md (test IDs like T0013)   │
                └───────────────────────┬──────────────────────┘
                                        │ context
                                        ▼
 ┌─────────────┐   gate 1    ┌──────────────────────────────┐   gate 2    ┌─────────────┐
 │ 1. PLAN     │──"agreed"──▶│ 2. BUILD                     │──"ship it"─▶│ 4. SHIP     │
 │ plan.html   │             │ a. SDK signatures (empty)    │             │ one PR,     │
 │ decision    │             │ b. fresh agent writes spec   │             │ CI green,   │
 │ cards D1..  │             │    tests → LOCKED (hook)     │             │ you merge   │
 │ proposed ADR│             │ c. code until tests pass     │             └──────┬──────┘
 └─────▲───────┘             │ d. checks + fresh            │                    │
       │                     │    code-reviewer agent       │                    │
       │ plan can't hold     └──────────────┬───────────────┘                    │
       └────────────────────────────────────┤                                    │
                                            ▼                                    │
                                   ┌──────────────────┐                          │
                                   │ 3. TEST REVIEW   │                          │
                                   │ review.html      │                          │
                                   └──────────────────┘                          │
                                                                                 ▼
                         ADRs + CHANGELOG + checks land in the same commit ──▶ next module
```

Each piece of work is a **module**. It stops twice for you: a plan page before any code, and a test review page before it merges. Both are local HTML pages with lettered options and a reply box. You click your picks, copy the reply into the chat, and say "agreed" or "ship it".

## Why it works with AI agents

- **Memory lives in the repo, not the chat.** A new session or a different tool reads `AGENTS.md` and the decision records and has the full context in minutes. Rejected ideas get records too, with "reopen only if" conditions, so agents stop proposing them again.
- **You decide; agents do the work.** Your time goes on two short pages per module, not on reading every diff.
- **Agents can't mark their own homework.** A separate agent writes the tests from the agreed plan before any code exists, and a hook locks them. The builder can't weaken a test to make it pass; it has to meet what you agreed, or reopen the plan.
- **Fresh eyes review everything.** The `code-reviewer` and `cold-reader` agents start with a clean context, so they don't share the author's blind spots.
- **Small, safe pieces.** Every package is used only through its agreed public names (its SDK), so agents can work on one module without breaking others.
- **Machines check the rules.** One check command, a pre-commit hook and CI check the decision records, the test locks and your own linters on every change.

## Why it's fast

Agents move fast. What usually slows teams down is redoing work and going back over the same arguments. This kit moves the expensive mistakes to the plan page, where fixing one means editing a paragraph rather than rewriting a module. After that, the agent builds without supervision until the next gate.

## What gets installed

```
AGENTS.md             the rules every agent reads (CLAUDE.md imports it)
CHANGELOG.md          every change, newest first, linked to decisions
DESIGN.md, PLAN.md    how it works; what gets built, with test IDs
process.json          what the checks read: design files, ADR areas, spec-test file name
docs/building.md      the four-stage module process
docs/writing-code.md  the bar for code; docs/writing-docs.md, the bar for docs
docs/decisions/       one ADR per decision, a template, and five starter ADRs recording this process
docs/modules/templates/  plan.html, review.html, and the theme (module.css) and behaviour (module.js) they share
scripts/              Bun checks: decision records and changelog; the spec-test lock and its hook
.agents/skills/       build-module, module-plan, module-review, ship-module, record-decision
.claude/agents/       code-reviewer, cold-reader, spec-writer
.claude/settings.json the hook that refuses edits to locked spec tests
.githooks/, .github/  pre-commit hook and CI
```

The kit works with any language. `SETUP.md` has presets for TypeScript, Python, Go and Rust, and asks about anything else. The process checks need [Bun](https://bun.sh).

## Theme

The review pages take their look from one block of colour and font tokens in `docs/modules/templates/module.css`, in light and dark. During setup the agent builds a palette from your brand, website or a direction you pick, checks the contrast, and shows you the result before going on. To try the default, open `docs/modules/templates/plan.html` in a browser.

## Licence

[MIT](LICENSE).
