---
id: ADR-0001
title: Record every decision as an ADR with reopen-only-if conditions
status: accepted
date: 2026-10-22
areas: [process]
superseded-by: []
related: [ADR-0002]
design: []
---

# ADR-0001: Record every decision as an ADR with reopen-only-if conditions

## Context and problem

AI agents start each session with no memory. Without a written record, a new session re-proposes options already turned down, and re-argues choices already made. Chat history and personal memory files are invisible to the next tool or person. The project needs one place, in the repo, where every decision and its reasons live.

## Decision drivers

- Any agent or person can find out, in minutes, whether something is already decided.
- Rejected ideas stay rejected unless something real has changed.
- The record lives in git, next to the code, and is checked by a machine.

## Considered options

1. **One ADR per decision in `docs/decisions/`, with front matter, rejected options and a "Reopen only if" section, checked by a script.**
2. **A single decisions log file.**
3. **Decisions in chat, issues or a wiki.**

## Decision

Chosen: **option 1**. Each decision is one Markdown file named after the choice made. Rejected ideas get their own ADR with `status: rejected`. Accepted ADRs are append-only: a change of substance is a new ADR that supersedes the old one. `CHANGELOG.md` gets a line for every change, citing the ADR. `scripts/check_history.ts` checks the fields, ids, links and changelog on every commit.

### Why not the others

- **Option 2**: one file grows without limit, merges conflict, and a decision can't be linked or superseded on its own.
- **Option 3**: it lives outside the repo, isn't read by every agent, and can't be checked.

### Consequences

- Good: an agent reads `AGENTS.md`, lists `docs/decisions/` and knows what's settled.
- Good: "Reopen only if" stops the same debate coming back with no new evidence.
- Bad (accepted): writing an ADR takes a few minutes per decision.

## Reopen only if

- Agents routinely ignore the ADRs even when `AGENTS.md` points to them.
- The number of ADRs makes `ls` and `grep` too slow to find one.

## More information

The format is based on [MADR](https://adr.github.io/madr/).
