# Decisions

**In one line:** every decision in {{PROJECT}}, including the ones turned down, one file each, so nobody (human or AI) makes the same decision twice.

**Read this if:** you're about to propose, change or question anything in the design.

---

## How to use this folder

- **Looking for a decision?** Each file name states the decision, so start with `ls docs/decisions/`. The commands [below](#finding-decisions) filter by topic, status or area.
- **Found one that covers your idea?** Follow it. Each ADR's **"Reopen only if"** section lists the only conditions that justify revisiting it.
- **Making a new decision?** Copy [`template.md`](template.md) to `NNNN-short-title.md`, using the next free number. Fill it in, update `DESIGN.md`, add a [changelog](../../CHANGELOG.md) line, then run `bun run history`.
- **Replacing an old decision?** Write a new ADR that names the old one in its context. Set the old one's `status: superseded` and `superseded-by`, so a reader who finds the old one is sent to the new one. Don't rewrite or delete the old file. It's history.

An **ADR** (architecture decision record) is a short note of one decision: the problem, the options, the choice, why the others lost, and when to revisit it. The format is based on [MADR](https://adr.github.io/madr/), plus a "Reopen only if" section and YAML front matter so the checks can read it.

### Statuses

| Status | Meaning |
|---|---|
| `proposed` | Under discussion. Not yet in `DESIGN.md`. |
| `accepted` | In force. `DESIGN.md` reflects it. |
| `rejected` | Considered and turned down. Kept so it isn't proposed again. |
| `superseded` | Replaced by a later ADR (see `superseded-by`). |
| `deprecated` | No longer relevant, with nothing replacing it. |

### Areas

The allowed areas are listed in `areas` in [`process.json`](../../process.json). To add one, add it there.

## Finding decisions

The files are the index. Nothing is generated, so nothing goes stale.

| To find | Run |
|---|---|
| Every decision | `ls docs/decisions/` |
| Decisions on a topic | `grep -ril "<topic>" docs/decisions/` |
| Decisions with a status | `grep -l "^status: rejected" docs/decisions/0*.md` |
| Decisions in an area | `grep -l "^areas:.*testing" docs/decisions/0*.md` |
| What replaced a decision | its `superseded-by` field |
