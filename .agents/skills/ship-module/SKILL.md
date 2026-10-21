---
name: ship-module
description: Ship a module whose test review the user approved — finish the records, run every check, commit with trailers, push, raise one pull request linking the plan and review pages, and merge once CI is green and the user approves. Use at stage 4 of building a module, or when the user says "ship it", "raise the PR" or "merge it" for a module.
---

# Ship a module

Stage 4 of `docs/building.md`. Start only when `docs/modules/<id>/review.html` says **Ready to ship** because the user said so.

## 1. Records

Each line must be true on the branch before you push:

- [ ] Every ADR from the plan is `accepted` (or `rejected`), and its date is set (`record-decision` skill).
- [ ] `DESIGN.md` describes what was built.
- [ ] `PLAN.md`: the module's boxes are ticked.
- [ ] `CHANGELOG.md`: lines under today's date, citing ADR links and test IDs.
- [ ] `docs/evidence/<id>/` has the measurements and any manual run output.
- [ ] Both pages are committed: `plan.html` marked Agreed, `review.html` marked Ready to ship.

## 2. Checks

1. `{{CHECK_CMD}}`
2. `{{TEST_CMD}}`
3. If the code changed since the review page's commit, re-run the `code-reviewer` agent on the new part, and update the page's commit and results.

## 3. Commit and push

- Commit on `module/<id>`. The first line says what changed. End with trailers:

  ```
  Decision: ADR-NNNN, ADR-NNNN
  Refs: T0009, T0010
  ```

- Ask the user before pushing, unless they already said to raise the PR.
- `git push -u origin module/<id>`

## 4. Pull request

`gh pr create --base main --head module/<id>` with:

- **Title:** `<id>: <what the module adds>`
- **Body:** a summary in two or three lines; the plan and review pages, with how to open them locally; the test IDs closed and how to verify them; the ADRs; behaviour changes, or "None".

## 5. Merge and move on

- Wait for CI to go green. If it fails, fix the cause, push, and note it on the review page if it changes a result.
- Merge only when the user approves (or has said to merge on green). Use the repo's usual merge style.
- After the merge, `git switch main && git pull`. Tell the user the module is done and name the next one from `PLAN.md`.
