---
id: ADR-0003
title: Use every package only through its agreed SDK
status: accepted
date: 2026-10-22
areas: [architecture]
superseded-by: []
related: [ADR-0002, ADR-0004]
design: []
---

# ADR-0003: Use every package only through its agreed SDK

## Context and problem

When agents build modules one after another, boundaries form by accident: one module reaches into another's internals, and a later change breaks it. The user also needs to see, before any code, what each module will expose to the rest. A package's public names are its contract, so that contract should be chosen on purpose.

## Decision drivers

- Agents can work on one module without breaking others.
- Spec tests need a stable surface to test against.
- The user agrees the boundary before the code.

## Considered options

1. **Each package's public names are an SDK, agreed on the plan page; callers use only those names.**
2. **No rules:** packages expose whatever is convenient.
3. **Separately versioned packages, published for outside use.**

## Decision

Chosen: **option 1**. Every caller, including our own programs and tests, uses a package only through its public names. Each plan page's SDK section lists them with signatures, a usage example, errors and concurrency safety. The review page checks the built SDK against the agreed one. Changing an agreed SDK is a plan change. The rules are in section 9 of [`docs/writing-code.md`](../writing-code.md).

### Why not the others

- **Option 2**: boundaries form by accident, and nothing shows the user what a module exposes before it is built.
- **Option 3**: version management costs real work, and every caller is in this repo.

### Consequences

- Good: each module's boundary is explicit and agreed, and spec tests test only through it.
- Good: internals can be rewritten freely without touching callers or spec tests.
- Bad (accepted): where the language can't hide private names, an SDK that exposes too much is caught by review, not the compiler.

## Reopen only if

- Other repositories need to import the packages, so a version promise is needed.

## More information

The SDK section of `docs/modules/templates/plan.html`.
