# Building a module

**In one line:** every piece of {{PROJECT}} is built the same way: an agreed plan, then the code, then an agreed test review, then one pull request. Each stage is written down as an HTML page in the repo.

**Read this if:** you're about to start building any part of {{PROJECT}}, as a person or an AI agent.

---

## Why a fixed process

AI agents write code fast. What costs time is a wrong choice found late, and re-arguing choices already made. The cheapest time to catch a wrong choice is before the code exists. The next cheapest is before it merges. So each module stops twice for the user to judge it in writing: once on the plan, once on the tests and impact. An **ADR** (architecture decision record) is a short file in [`docs/decisions/`](decisions/README.md) that records one decision, the options turned down and why. The reasons for this process, and the options turned down, are in [ADR-0002](decisions/0002-build-each-module-through-an-agreed-plan-page-then-an-agreed-test-review-page-then-one-pull-request.md).

In this page, **the user** is the person who owns {{PROJECT}}'s product decisions and signs off each gate ({{OWNER}}). **The agent** is whoever does the work, an AI agent or a person.

## What a module is

The [build plan](../PLAN.md) lists the work as checkboxes, called **build-plan boxes**, and the tests as **test IDs** such as `T0013`. Each ID is a permanent number, never reused. A **module** is a group of those boxes that ships as one pull request. Each plan page lists the boxes and test IDs its module covers. Before claiming a box, the agent checks that no other plan page lists it, on `main` or on any unmerged branch: `git grep -l "<the box's first words>" $(git branch -a --format='%(refname:short)' --list '*module/*') main -- docs/modules`.

A module's id names what it builds, in lowercase words joined by hyphens, such as `billing-engine`. No two modules share an id. Its branch is `module/<id>`, and its pages live in `docs/modules/<id>/`.

## One module, start to finish

1. The agent creates `module/audit-log` and writes `docs/modules/audit-log/plan.html`. The page explains the audit log, where each line carries a hash of the one before. It offers two ways to handle a last line left half-written by a crash, as **decision card** D1: a choice for the user, with its options side by side ([Stage 1](#stage-1-the-plan-page)). A proposed ADR goes in `docs/decisions/`.
2. The user reads it, replies "D1: B" and answers Q1. The agent updates the page and adds a review-log row. The user replies "agreed".
3. The agent marks the ADR accepted and commits the plan. A fresh agent writes the spec tests from the plan, they are locked, and then the code is written to pass them.
4. Midway, the chosen file-sync call turns out not to work as planned. The agent stops, reopens the plan page for a new round, and writes a proposed ADR to supersede the old one. It waits for the user's "agreed" again.
5. With all tests passing and the code reviewer satisfied, the agent writes `review.html`. It covers how to run the tests, their results, the impact on existing code, and the behaviour changes.
6. The user asks for one more test. The agent adds it and re-runs everything. The user replies "ship it".
7. The agent raises the pull request. CI goes green, the user approves, and it merges. The next module starts at step 1.

## The four stages

| Stage | What happens | Written in | Leaves the stage when |
|---|---|---|---|
| 1. Plan | Write the plan: how the module works and why, every decision with its alternatives, the libraries, the cost and the exact impact. Discuss it round by round | `docs/modules/<id>/plan.html`, and a `proposed` ADR in `docs/decisions/` for each new decision | The user says the plan is agreed |
| 2. Build | Write the SDK, then the locked spec tests, then the code, to the agreed plan and the [code bar](writing-code.md) ([Stage 2](#stage-2-the-build)). Run `{{CHECK_CMD}}` and the [`code-reviewer`](../.claude/agents/code-reviewer.md) agent, and fix what they find | Code, on `module/<id>` | All tests pass and the reviewer has no open findings |
| 3. Test review | Show how to test the module, the results, the impact on existing code and any change in behaviour. Discuss it round by round | `docs/modules/<id>/review.html` | The user says "ship it" |
| 4. Ship | Finish the records, raise the pull request, wait for green CI and the user's approval to merge | The pull request | Merged into `main` |

### Gates

Stages 1 and 3 end only on the user's words, and stage 4 ends only on their approval of the merge. Stage 2 ends on the checks alone, because stage 3 is where the user judges its result.

- **Any clear approval of that page counts**, such as "agreed", "approved" or "ship it". The agent quotes the words in the page's review log. A yes to one question, or silence, is not a gate. Neither is approval given for an earlier module.
- **At the plan gate,** the agent sets the plan page's status to **Agreed** and marks each proposed ADR `accepted`, then commits both on `module/<id>`. From then on the ADR is the decision.
- **At the review gate,** the agent sets the review page's status to **Ready to ship**.
- **The merge** needs its own approval: the user merges, or tells the agent to. The user may say "merge when CI is green" in advance.

### Going back

- **The code can't follow the agreed plan.** The agent stops building and reopens the plan page for a new round explaining what was found. This applies to any change to a decision card, the SDK, a library choice, the module's scope (its boxes and test IDs) or behaviour people will notice. A smaller change, such as a different file name or an extra helper function, only needs listing on the review page. A changed decision gets a new ADR with `status: proposed` that supersedes the old one. Until the user agrees again, the old ADR stays accepted and in force, and the code doesn't go past it.
- **The user doesn't approve the test review.** If the problem is in the code or tests, the module returns to stage 2, and stage 3 runs again on the new commit. If it needs a different decision, it returns to stage 1, as above.
- **The user drops the module.** The agent sets the module's proposed ADRs to `rejected` and its accepted ones to `deprecated`, on `main` with a changelog line, then deletes the branch. Its boxes are free for another module.

## Stage 1: the plan page

Copy [`templates/plan.html`](modules/templates/plan.html) to `docs/modules/<id>/plan.html` and fill in every section. Each section carries a dashed box of guidance, which is deleted once the section is written.

The page is **concise but complete**: it reads top to bottom in about ten minutes, defines each term before using it, and says each fact once. It answers these questions, in this order:

- **What is it, in short?** A summary box: what it builds, why now, the test IDs it covers, what it leaves out and what the user must decide.
- **How does it work?** One diagram of the parts, then one worked example from start to finish, with real names and values.
- **What does it expose?** The **SDK**: for each package, its public names with their signatures, a usage example, its errors and what stays private ([ADR-0003](decisions/0003-use-every-package-only-through-its-agreed-sdk.md)). Agreeing the plan agrees the SDK.
- **What did we choose, and what did we turn down?** One card per decision: a choice a later person could reasonably make differently, at real cost to undo. Each option is lettered A, B… with its main strength and its main cost, and the recommended one is preselected. The deeper reasoning opens on a click. Each card becomes one proposed ADR.
- **What does the user need to tell us?** Questions, numbered Q1, Q2…, for what only the user knows or can do. Each carries a recommendation.
- **What is decided already, or too small for a card?** One line under "Already decided" for each accepted ADR that settles something here, cited and not re-argued. One line under "Small choices" for each choice that is cheap to change later. Small choices get no ADR: agreeing the plan accepts them.
- **Why does it hold?** Each promise the module makes, what it rests on, and when it fails and what happens then.
- **Is it well engineered?** The **engineering check**, three rows, each with a verdict (pass, concern or fail) and its evidence:
  - *Borrow before build:* for each job, the standard library, an existing library, or our own code, and why. A library is acceptable if it is maintained (released in the last year, more than one maintainer), its licence fits, and it has no unfixed security issues.
  - *Simplest, cheapest shape:* the simpler shape considered and why it fails, and the cost in passes over the data, disk, network and memory.
  - *Boundaries kept:* which parts are our logic and which are **adapters** that talk to the outside (network, disk, vendors, the operating system). Logic reaches the outside only through an adapter, so it can be tested and moved.
- **What does it touch?** Every file to be created or changed, and who notices what.
- **How will we prove it?** Each test ID, what it proves and its command. The test review settles the final list.

## Stage 2: the build

The build turns the agreed plan into code in a fixed order, so the tests check what the user agreed rather than what the code happens to do ([ADR-0004](decisions/0004-lock-spec-tests-written-from-the-plan-by-a-fresh-agent.md)):

1. **The SDK first.** Each package's public names, doc comments and a runnable example, exactly as the plan agreed them, with empty bodies.
2. **The spec tests, by a fresh author.** A separate [`spec-writer`](../.claude/agents/spec-writer.md) agent, with no memory of the work so far, writes one test per test ID in the plan. It reads only the plan page and the SDK's signatures and doc comments. If the plan and the SDK can't agree on a test, it reports that instead of guessing. The tests must fail: a test that passes against empty bodies proves nothing.
3. **Lock them.** `bun run spec:lock <id>` records a hash of each spec test file in `docs/modules/<id>/spec.lock`, committed with the tests. From then on the checks fail if a spec test changes, and a Claude Code hook refuses an agent's edits to one.
4. **Build the code** until the spec tests pass. Working tests, the agent's own unit tests, can change freely.
5. **Check it:** `{{CHECK_CMD}}` and the `code-reviewer` agent, fixing what they find.

A spec test that looks wrong is a plan change, and the agent doesn't get to decide that alone. It stops, reopens the plan as [Going back](#going-back) describes, and says on the page why the test is wrong rather than its code. The user decides. If they agree, the `spec-writer` agent rewrites the test from the changed plan, never the agent that built the code, and the agent runs `spec:lock` again; the hook asks the user to approve that run.

## Stage 3: the test review page

Copy [`templates/review.html`](modules/templates/review.html) to `docs/modules/<id>/review.html`. Every result on it comes from a run on the commit the page names. It covers, in this order:

- **The headline:** how many tests pass, what changed from the plan, and what the user must decide.
- **Try it yourself:** commands a person can run on a clean clone, and what they should see.
- **Results** for each test ID, and the earlier modules' tests re-run. Raw output goes in `docs/evidence/<id>/`.
- **Spec tests changed since the lock,** worked out from `git diff` and the module's `spec.lock`, each naming the plan round that agreed it. Usually none.
- **Mutation scores:** mutation testing ({{MUTATION_TOOL}}) makes small deliberate bugs in the code, one at a time, and counts how many the tests catch. Each bug no test caught gets a new test or a reason it can't matter.
- **Changes from the plan:** every difference, small ones included.
- **Impact and behaviour,** from the real diff: what changed, and who notices.
- **The engineering check** from the plan, now judged on the code, with the SDK checked against the one agreed and the code reviewer's findings.
- **Records:** what the pull request must carry, ticked as each lands.

## The discussion loop

Stages 1 and 3 are discussions, not hand-offs. Each round goes like this:

1. The agent writes or updates the page and gives the user its path. The user opens it locally with `open docs/modules/<id>/plan.html`.
2. The user answers by id ("D2: B", "Q3: yes") or raises something new. The page's **reply box** builds this answer from the choices made on the page, ready to copy into the chat. With every recommendation kept and nothing added, the reply reads just the gate word, "agreed" or "ship it". A reply that changes anything starts another round; only a plain approval passes the gate.
3. The agent updates the page, and any proposed ADR the answer changes. The round number goes up by one, each changed part is highlighted for that round, and the **review log** at the bottom gets a row saying what changed.

## Where the pages live, and what they are not

- Pages are local HTML files, committed on `module/<id>` as each gate passes. They are never published as hosted pages.
- They share [`templates/module.css`](modules/templates/module.css) for the look, light and dark, and [`templates/module.js`](modules/templates/module.js) for the contents list, the reply box, copy buttons and diagrams. Diagrams are drawn with Mermaid. Offline, a diagram shows its source text.
- **The pages record the review. They are not the design.** Decisions live in their ADRs, the design in [`DESIGN.md`](../DESIGN.md) and the build in [`PLAN.md`](../PLAN.md). After the merge, a page is never changed again.

## What ships in the pull request

One pull request per module, from `module/<id>` into `main`. It carries the code and its tests with the module's `spec.lock`; both pages, with the plan **Agreed** and the review **Ready to ship**; the module's ADRs, `accepted`; `DESIGN.md` and `PLAN.md` (boxes ticked) brought in line; a [changelog](../CHANGELOG.md) line citing the ADRs and test IDs; and the evidence in `docs/evidence/<id>/`.

## Skills

A **skill** is a written procedure an agent follows step by step, so recurring work is done the same way each time. Skills live in `.agents/skills/<name>/SKILL.md`, where any AI tool can read them. Each has a link in `.claude/skills/`, so Claude Code loads it.

| Skill | Use it to |
|---|---|
| [`build-module`](../.agents/skills/build-module/SKILL.md) | Find which stage a module is at, and run that stage |
| [`module-plan`](../.agents/skills/module-plan/SKILL.md) | Research and write a plan page |
| [`module-review`](../.agents/skills/module-review/SKILL.md) | Run the tests and write the test review page |
| [`record-decision`](../.agents/skills/record-decision/SKILL.md) | Write, accept, reject or supersede an ADR with every record that goes with it |
| [`ship-module`](../.agents/skills/ship-module/SKILL.md) | Finish the records and raise the pull request |

**When to add a skill:** when the same kind of task comes up a second time and follows the same steps both times. Write it from the steps that worked, and add it to the table above in the same commit.
