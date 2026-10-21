---
id: ADR-0004
title: Lock spec tests written from the plan by a fresh agent
status: accepted
date: 2026-10-22
areas: [testing]
superseded-by: []
related: [ADR-0002, ADR-0003]
design: []
---

# ADR-0004: Lock spec tests written from the plan by a fresh agent

## Context and problem

A coding agent that can edit its own tests can make any test pass by weakening it. That is the most common way coding agents cheat. A reviewer reading afterwards sees only what the diff makes obvious. The tests that state what the user agreed must be written by someone other than the builder, and must not change without the user's say-so.

## Decision drivers

- What the user agreed in the plan is what the tests check.
- Changing an agreed test needs a plan round, not the builder's judgement.
- Refactors stay cheap: only agreed tests are locked.

## Considered options

1. **Spec tests written by a fresh agent from the plan and SDK, locked by hash, with a hook and a way out, and mutation scores on the review page.**
2. **Option 1, plus a person reads every spec test before it is locked.**
3. **The builder writes and edits every test; review catches weakened ones.**
4. **Hidden tests the builder can't see.**

## Decision

Chosen: **option 1**. Stage 2 writes the SDK with empty bodies. The `spec-writer` agent, with no memory of the work, writes one test per test ID from the plan page and the SDK alone, and the tests must fail. `bun run spec:lock <id>` records each spec file's hash in `docs/modules/<id>/spec.lock`. The checks fail if a spec file changes, and a Claude Code hook refuses edits to one and asks the user before a relock. A wrong spec test reopens the plan. At stage 3, mutation testing measures how many planted bugs the tests catch. Every other test is a working test, free to change.

### Why not the others

- **Option 2**: a human gate on test code for every module, when mutation scores already show weak tests.
- **Option 3**: it leaves the commonest cheat open.
- **Option 4**: the repo is fully readable by any agent working in it, so nothing stays hidden.

### Consequences

- Good: the review page's claims about tests are measured.
- Bad (accepted): a fresh agent can share the builder's blind spots. Mutation scores catch some; neither catches a behaviour the plan never named.
- Bad (accepted): the hook can't see every shell command. The lock check then fails, so a change is visible and deliberate, not impossible.

## Reopen only if

- Mutation scores show spec tests regularly missing what the plan meant, so option 2's human read is worth its cost.
