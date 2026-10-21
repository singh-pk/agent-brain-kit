---
name: module-plan
description: Research and write a module's plan page (docs/modules/<id>/plan.html): a concise, top-to-bottom page with one diagram, a worked example, the SDK each package exposes, decision cards whose options are the alternatives, why it holds, an engineering check, exact impact and the test list, plus a proposed ADR per new decision. Use at stage 1 of building a module, or when the user asks for a plan or design of a module before code.
---

# Write a module's plan page

Stage 1 of `docs/building.md`. The output is a page the user can read top to bottom in about ten minutes and decide from. **Concise but complete:** every fact the user needs is on the page once, and nothing else is.

## 1. Research before writing

Do all of this before filling the page. Delegate wide searches to a search agent so the reading stays out of your context.

1. **The build plan:** the module's boxes and test IDs in `PLAN.md`.
2. **The decisions:** `docs/decisions/README.md`, then `grep -ril "<topic>" docs/decisions/` for each topic the module touches. Note every accepted ADR that binds it and every rejected option it must not re-propose.
3. **The design:** the `DESIGN.md` sections the module builds.
4. **The code:** what earlier modules built that this one uses or changes. Read it, don't guess.
5. **Libraries:** for each job, look for a standard-library answer first, then a well-kept library. Check the latest version, licence, last release, maintainers and known security issues on the web or with the package manager, not from memory.
6. **The toolchain:** confirm the versions the module needs exist and work together. Try anything uncertain in a throwaway folder (`mktemp -d`).

## 2. Sort what you found

| Bin | Test | Goes on the page as |
|---|---|---|
| **Decision card** (D1…) | A later person could reasonably choose differently, and undoing it costs real work | A card, and a proposed ADR |
| **Small choice** | Worth knowing, cheap to change later | One line under "Small choices". No ADR; agreeing the plan accepts it |
| **Already decided** | An accepted ADR covers it | A link under "Already decided". Never re-argued |

**Questions** (Q1…) are only for what the agent can't settle: the user's preference, something only they can do (an account, a purchase), or missing facts.

## 3. Fill the page

1. `mkdir -p docs/modules/<id>` and copy `docs/modules/templates/plan.html` to `docs/modules/<id>/plan.html`.
2. Replace `MODULE-ID`, the title and the date. Leave `data-round="1"` and `data-gate="agreed"` on `<body>`.
3. Fill each section in order, following its dashed hint, then **delete the hint**.

| Section | Holds | Limit |
|---|---|---|
| Summary box | Builds, why now, covers (test-ID chips), leaves out, you decide | 100 words |
| How it works | One paragraph, one diagram with its legend, one worked example as numbered steps | About 250 words of prose |
| The SDK | Per package: purpose, public signatures with doc comments, a usage example, errors, concurrency, what's private, who uses it | Only the public names. No implementation |
| Your calls | Decision cards, question cards, "Already decided", "Small choices" | Per card: context 2 sentences, option 1 line, details 120 words |
| Why it holds | One table row per promise: because, fails when → then | — |
| Engineering check | Three rows, always: borrow before build, simplest and cheapest shape, boundaries kept | One line per row outside details |
| What it touches | File tree (+ new, ~ changed, − removed) and a who-notices table | — |
| How we'll prove it | One row per test ID: proves, runs in, command | — |
| Review log | One row per round | — |

### Writing rules

- **Top to bottom.** Define each term the first time it appears. No section depends on a later one.
- **Each fact once.** If the diagram shows it, the prose doesn't repeat it. If a card decides it, other sections link to the card (`<a href="#D2">D2</a>`).
- **Real before rule.** The worked example uses real names, paths and values from this module.
- **Alternatives live in the cards.** Each option is a radio choice: a name, then `<span class="pro">` for its main strength and `<span class="con">` for its main cost. The recommended option has `data-rec checked` and the `recommended` tag. Deeper reasoning goes in the card's details block.
- **A card ends with its record:** the proposed ADR it becomes, linked.
- **Questions** carry a recommendation. An empty answer means the user accepts it.
- Follow the house rules in `AGENTS.md`. Invent no numbers: a budget comes from `PLAN.md` or is marked as to be measured.

### Diagrams

Use Mermaid in `<figure class="diagram"><pre class="mermaid">`. Give each node one class, matching the legend: `part` (our logic), `adapter` (talks to the outside), `test` (test-only, drawn dashed), `store` (data at rest), `external` (outside the project), `blocked` (refused path). Keep the legend to the classes used. Don't hard-code colours: the page themes them for light and dark.

- **Readable at page width.** Prefer `flowchart TB`, at most about eight nodes, and short labels.
- **Line breaks:** write `&lt;br&gt;`, never `<br>`, inside `<pre>`.

### The SDK

Follow section 9 of `docs/writing-code.md` ([ADR-0003](../../../docs/decisions/0003-use-every-package-only-through-its-agreed-sdk.md)). Write the signatures as real code that would compile, with doc comments. Write the usage example from a caller's side. Expose the least the callers need. A choice between two SDK shapes a caller would notice is a decision card.

## 4. Record the decisions

Write each decision card as an ADR with `status: proposed`, using the `record-decision` skill, and link it from the card.

## 5. Check the page

- No hint is left: `grep -c 'class="hint"' docs/modules/<id>/plan.html` prints 0.
- The header's read-time chip says about 10 minutes or less. If more, cut repetition before substance.
- It renders in a browser, light and dark, at desktop and phone width; the diagrams draw, and the reply box reads "agreed" with nothing changed.

## 6. Hand it over

Reply with the path, `open docs/modules/<id>/plan.html`, one line per card with your recommendation, and the question ids. Loop until the user says the plan is agreed.

### Each later round

1. Apply the user's answers. Change only what they touch.
2. Bump `data-round` on `<body>` and the round in the header.
3. Put `data-changed="<round>"` on each card, row or section that changed. Remove the attribute from earlier rounds' changes.
4. Add a review-log row saying what changed.
