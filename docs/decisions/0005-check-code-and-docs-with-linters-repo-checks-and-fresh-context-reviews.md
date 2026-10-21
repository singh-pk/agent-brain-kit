---
id: ADR-0005
title: Check code and docs with linters, repo checks and fresh-context reviews
status: accepted
date: 2026-10-22
areas: [tooling]
superseded-by: []
related: [ADR-0001, ADR-0004]
design: []
---

# ADR-0005: Check code and docs with linters, repo checks and fresh-context reviews

## Context and problem

Rules written on a page drift out of an agent's attention during a long session. Working code can still be the wrong shape, and a correct page can still fail to teach. Some of this a machine can check; some needs judgement from someone who hasn't seen how the work was done.

## Decision drivers

- Agent-written code and docs meet the bar a well-run open-source project sets for a stranger's contribution.
- Use standard tools wherever they fit; write our own checks only for what's specific to this repo.

## Considered options

1. **Standard linters, the repo's own history and spec-lock checks, and two fresh-context review agents.**
2. **Custom scripts for everything,** with regexes over the source text.
3. **Guides and linters only,** with no review agents.

## Decision

Chosen: **option 1**. The bar is [`docs/writing-code.md`](../writing-code.md) and [`docs/writing-docs.md`](../writing-docs.md). One entry point runs the checks; the pre-commit hook and CI run the same. `scripts/check_history.ts` and `scripts/spec_lock.ts` cover what no standard tool can. The `code-reviewer` agent reads only the diff and the code bar. The `cold-reader` agent reads only one page and must answer questions from it.

### Why not the others

- **Option 2**: regexes guessing at code and English give false positives and are hard to maintain. Standard tools do the same jobs better.
- **Option 3**: linters can't judge whether a shape is the simplest, or whether a page teaches.

### Consequences

- Good: the only custom code is what's specific to this process.
- Good: a review with a fresh context doesn't share the author's blind spots.
- Bad (accepted): long sentences and filler are caught only by the cold reader and by people.

## Reopen only if

- A standard tool appears that judges what the review agents judge today, reliably.
