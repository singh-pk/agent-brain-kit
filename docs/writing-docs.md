# Writing docs

**In one line:** where the truth lives, what a page may say, and the bar every page must meet, so a newcomer can learn {{PROJECT}} from the docs alone.

**Read this if:** you're about to add or change a page in `docs/`, `DESIGN.md` or `PLAN.md`.

---

## Where the truth lives

| File | What it is |
|---|---|
| [`../DESIGN.md`](../DESIGN.md) | The **design**: how {{PROJECT}} works, with the exact detail |
| [`../PLAN.md`](../PLAN.md) | The **build plan**: tasks as checkboxes, and test IDs (`T0001`) |
| [`decisions/`](decisions/README.md) | The **why**: one record per decision, including rejected options and when to reopen them |
| [`../CHANGELOG.md`](../CHANGELOG.md) | The **history**: every change, newest first, linked to decisions |
| `evidence/` | Proof collected while building: test output, measurements, CI links |

**Rule:** if an explanation page and `DESIGN.md` disagree, `DESIGN.md` wins. Fix the page in the same change. An explanation page never makes a decision on its own.

## The shape of an explanation page

A page that explains one part of {{PROJECT}} tells it in this order. A reader should be able to understand the part, follow one real case through it, and then decide whether a change to it is safe.

| Section | Answers | What goes in it |
|---|---|---|
| Header: **In one line:**, **Read this if:** | Is this the page I need? | As on every page |
| `## The problem` | What goes wrong without this? | A concrete case. Few or no mechanism names yet |
| `## The idea` | What's the one insight that fixes it? | The mental model in plain words |
| `## A worked example` | What actually happens, step by step? | One real case from start to finish, as numbered steps with a diagram |
| `## How it works` | What are the details that matter? | One `###` per part: what it does, why, the exact names, and the edge cases |
| `## Limits and trade-offs` | What can't it do, and what did we give up? | Each limit, with the ADR that chose it |
| `## Changing this safely` | What must stay true? | The invariants, what depends on each, the ADRs to read first, and the test IDs that prove them |
| `## Related` | Where next? | Links |

## Writing rules

The test of a page: a capable engineer who has never seen {{PROJECT}} reads **only this page**, and can then explain the part, walk through a real case, and say what breaks if it changes.

1. **Lead with the point.** Each page opens with **In one line:** and **Read this if:**. Each section's first sentence says what the section concludes.
2. **Explain before you use.** Never use a term before the page has said what it is. Explain it in a few words where it first appears, and bold it there.
3. **Example first, then the rule.** Show one real case before the general rule it illustrates.
4. **Prose for reasoning, lists for lists.** A "because" or a "so" belongs in a sentence. Bullet points for items that really are parallel; tables for comparisons.
5. **One idea per paragraph, one claim per sentence.** Aim for sentences of about 20 words. Split any sentence over 35.
6. **Don't lose the detail that matters.** Short doesn't mean vague. Name the real mechanism.
7. **Say why, and what it costs.** Every "{{PROJECT}} does X" is followed by why, or by what goes wrong without it.
8. **Show, then tell.** Where a flow has more than three steps or more than two actors, draw it.
9. **No filler.** Words like `robust`, `seamless`, `leverage`, `comprehensive`, `crucial` and `in summary` say nothing specific. Say the specific thing instead.
10. **Honest status.** Never claim something is shipped, tested with customers or measured unless `docs/evidence/` proves it.
11. **No invented numbers.** No figures that aren't in the design, the plan or the evidence folder.
12. **{{SPELLING}} spelling**, and the same names everywhere, as `DESIGN.md` defines them.

## Diagrams

- Use **Mermaid** in fenced ` ```mermaid ` blocks. GitHub and most doc tools render it, and it diffs cleanly.
- Put every node and edge label in double quotes. Use `<br/>` for line breaks.
- Keep a diagram to about 15 nodes. Split it if it grows.
- Colours are optional and defined with `classDef`, never inline. The shared classes match the module pages' theme:

  ```
  {{CLASSDEFS}}
  ```

- A diagram never replaces the sentence that says what it shows.

## The cold-reader test

The checks can see a page's shape, but not whether it's clear. So every new or rewritten explanation page gets a cold read before it's committed. A fresh agent with no context, the [`cold-reader`](../.claude/agents/cold-reader.md), reads only that page and answers questions about it. It reports every term it had to guess and every jump in the reasoning, and gives a pass or fail. Fix what it finds and run it again until it passes.

## Checklist for a change

- [ ] `DESIGN.md` says the same thing (or was changed in the same commit).
- [ ] A decision was made or changed → an ADR in [`decisions/`](decisions/README.md), in the same commit.
- [ ] A line in [`CHANGELOG.md`](../CHANGELOG.md).
- [ ] `{{CHECK_CMD}}` passes.
- [ ] A new or rewritten explanation page follows [the shape](#the-shape-of-an-explanation-page) and passed [the cold-reader test](#the-cold-reader-test).
