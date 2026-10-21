---
name: build-module
description: The project's fixed process for building any part of the product — plan page, build, test review page, pull request — one module at a time. Use whenever the user asks to start, continue, build, plan, test or ship a module or piece of the build plan (PLAN.md), or says "next module" or "let's build X". Finds which stage the module is at and runs that stage through the right skill.
---

# Build a module

The rules are in `docs/building.md` ([ADR-0002](../../../docs/decisions/0002-build-each-module-through-an-agreed-plan-page-then-an-agreed-test-review-page-then-one-pull-request.md)). Read it first if you haven't this session. This skill finds where a module is and runs the next step.

## 1. Pick the module

- If the user named one, use it. Otherwise take the first unticked box in `PLAN.md`, and the module that covers it.
- Module id: what it builds, in lowercase words joined by hyphens, such as `billing-engine`. No two modules share an id. If the work is large, propose a split into modules in the plan page's summary, and don't invent the split silently.
- Check `docs/modules/` and the open branches (`git branch -a --list '*module/*'`) for the id before using it.

## 2. Find the stage

| What exists | Stage | Do |
|---|---|---|
| No `docs/modules/<id>/plan.html` | 1, plan | `git switch -c module/<id> main`, then run the `module-plan` skill |
| `plan.html` not marked **Agreed** | 1, plan (discussion loop) | Follow the round steps in the `module-plan` skill, then give the path |
| Plan agreed, code not finished or tests failing | 2, build | Build to the plan (below) |
| Code done, no `review.html` or not **Ready to ship** | 3, test review | Run the `module-review` skill |
| Review marked **Ready to ship** | 4, ship | Run the `ship-module` skill |

## 3. Gates

- Plan gate: the user clearly approves the plan page ("agreed", "approved"). Quote their words in the review log, set the status chip to `Agreed` (class `chip good`), accept each proposed ADR with the `record-decision` skill, and commit on `module/<id>`.
- Review gate: the user clearly approves the review page ("ship it"). Quote their words, then set the status to `Ready to ship` (class `chip good`).
- Merge: needs its own approval, or an earlier "merge when CI is green".
- Never take a gate from silence, from an earlier module, or from a yes to a single question.
- Going back: if the user won't approve the review, return to stage 2 for code or test problems, or reopen the plan (stage 1) if a decision must change.

## 4. Stage 2, build

1. `git switch module/<id>` (created in stage 1).
2. Follow `docs/writing-code.md` and the order in `docs/building.md` (Stage 2). Build only what the agreed plan lists.
3. **SDK first.** Write each package's SDK exactly as the plan agreed it: the public names, their doc comments and a runnable example, with empty bodies.
4. **Spec tests, by a fresh author.** Run the `spec-writer` agent with the module id. It writes one test per test ID, in files named by `specTestFile` in `process.json`, from the plan and the SDK alone. If it reports that the plan and SDK disagree, take that to the user as a plan round. Check the tests fail.
5. **Lock them.** `bun run spec:lock <id>`, then commit the spec tests with `docs/modules/<id>/spec.lock`.
6. **Build** until the spec tests pass. Never edit a locked spec test. If one looks wrong, stop and reopen the plan page for a new round, saying why the test is wrong rather than the code. The user decides. If they agree, run the `spec-writer` agent again on the changed plan, then `spec:lock`; the hook asks the user first.
7. If the code can't follow an agreed decision, **stop**. Reopen the plan page for a new round explaining what you found. Write a new `proposed` ADR that supersedes the old one, and wait for the user to agree again before going on.
8. Run `{{CHECK_CMD}}` and `{{TEST_CMD}}` until they pass.
9. Stage the diff and run the `code-reviewer` agent on it, with one line on the module. Fix what it finds, or record why not for the review page.
10. Move to stage 3.

## 5. Each reply to the user

- Give the page's path and the command to open it: `open docs/modules/<id>/plan.html`.
- Keep the reply short: what's on the page, which ids need an answer, and your recommendation for each. The detail belongs on the page.
- Never publish a page as a hosted page or artifact.
