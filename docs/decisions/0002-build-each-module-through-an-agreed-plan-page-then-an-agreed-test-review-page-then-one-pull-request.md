---
id: ADR-0002
title: Build each module through an agreed plan page, then an agreed test review page, then one pull request
status: accepted
date: 2026-10-22
areas: [process]
superseded-by: []
related: [ADR-0001, ADR-0003, ADR-0004]
design: []
---

# ADR-0002: Build each module through an agreed plan page, then an agreed test review page, then one pull request

## Context and problem

Agents can write a whole feature in one session. The expensive mistakes are a wrong choice found after the code exists, and tests that check the wrong things. The person who owns product decisions needs to judge each piece twice, briefly: before the code, and before it merges. Those judgements must be recorded where the next session can find them.

## Decision drivers

- Catch wrong choices when changing them is cheapest.
- The user's time goes on judgement, not on reading diffs line by line.
- Every sign-off is written down, in the repo.

## Considered options

1. **Two local HTML pages per module, each closed by a gate in the user's words, then one pull request.** Recurring steps are written as skills.
2. **Plan in chat:** show the plan and wait for a yes.
3. **Plan and review as Markdown pages.**
4. **Plan in the pull request description.**
5. **A plan gate only, with CI as the test sign-off.**

## Decision

Chosen: **option 1**. A module is a group of build-plan boxes that ships as one pull request, on the branch `module/<id>`. Stage 1 writes `docs/modules/<id>/plan.html`, with decision cards (D1…) and questions (Q1…), and a proposed ADR per decision; it ends when the user says "agreed". Stage 2 builds to the plan. Stage 3 writes `docs/modules/<id>/review.html` from real test runs; it ends when the user says "ship it". Stage 4 raises one pull request and merges on the user's approval. The rules are in [`docs/building.md`](../building.md), and the skills in `.agents/skills/` run each stage.

### Why not the others

- **Option 2**: chat scrollback is gone after the session, and nothing shows later what was agreed.
- **Option 3**: HTML shows decision cards, a reply box, wide tables and diagrams in any browser, and lets the user answer by clicking.
- **Option 4**: the pull request comes after the code, but decisions must be agreed before it.
- **Option 5**: CI proves the tests pass, not that they test the right things.

### Consequences

- Good: every module has a written, agreed plan and test review in git, next to its code.
- Good: any agent can follow the process from `docs/building.md` and the skills.
- Bad (accepted): two review rounds per module add calendar time. Small modules have short pages.
- Bad (accepted): the Mermaid diagrams need the network to render. Offline, a reader sees the source text.

## Reopen only if

- Gates regularly pass with no change, so the pages cost time without catching anything.
- The team grows to where pull-request review by people replaces the user's sign-off.

## More information

Templates: `docs/modules/templates/plan.html` and `review.html`.
