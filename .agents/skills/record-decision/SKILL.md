---
name: record-decision
description: Write, accept, reject or supersede an ADR in docs/decisions/, with every record that must land in the same commit (DESIGN.md, PLAN.md, CHANGELOG, history check). Use whenever a design, build, tooling or process choice is made or turned down, when a plan's proposed ADR is agreed, or when the user asks to record a decision.
---

# Record a decision

The rules are in `AGENTS.md` sections 2–3 and `docs/decisions/README.md`. This is the procedure.

## 1. Is it a decision, and is it new?

- A decision is anything a later person could reasonably choose differently, and that would cost real work to undo: a mechanism, a boundary, a default, a trade-off, a dependency, or something ruled out of scope. Typos, rewording and diagrams are changes, not decisions.
- Search first: `ls docs/decisions/` and `grep -ril "<topic>" docs/decisions/`.
  - An accepted ADR covers it: follow it, and cite it as a link.
  - A rejected ADR covers it: don't re-propose it unless one of its "Reopen only if" conditions now holds. Name the condition and the evidence.
  - Two ADRs conflict: stop and tell the user.

## 2. Write a new ADR

1. Number: the highest `NNNN` across `docs/decisions/` **and** any open branch, plus one. Check with `git log --all --name-only --format= -- docs/decisions | grep -o '^docs/decisions/[0-9]\{4\}' | sort -u | tail -1`.
2. File: `docs/decisions/NNNN-<the-decision-as-a-lowercase-sentence>.md`, copied from `template.md`.
3. Front matter: `status` (`proposed` while under discussion; `accepted` or `rejected` once the user decides), `date` (the day the status last changed), `areas` from `process.json`, and `related` ADR ids.
4. Body: the context in 2–5 sentences naming the real mechanism, then the drivers, **every** option considered, the choice, why each other option lost, the good and bad consequences, "Reopen only if" conditions, and the evidence.
5. Cite other ADRs as links: `[ADR-0012](0012-title.md)`.
6. A rejected idea gets its own ADR with `status: rejected`, so nobody proposes it again.

## 3. Change an ADR's status

- **proposed → accepted:** set `status` and `date`. Bring `DESIGN.md` in line if the design changes, and `PLAN.md` if the build changes.
- **Superseded:** write the new ADR, naming the old one in its context. In the old one, change only `status: superseded`, `superseded-by: [ADR-NNNN]` and `date`.
- An accepted or rejected ADR is append-only. Change only its status, `superseded-by`, date, a typo, or an id turned into a link.

## 4. Records in the same commit

1. `CHANGELOG.md`: a line under the newest date's `### Decided` heading (add today's date heading if missing). Say what was chosen, what was turned down, and link the ADR.
2. `bun run history`, then `{{CHECK_CMD}}`.
3. Commit message trailer: `Decision: ADR-NNNN`.
