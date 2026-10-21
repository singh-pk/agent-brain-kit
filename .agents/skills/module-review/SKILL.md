---
name: module-review
description: Run a built module's tests and write its test review page (docs/modules/<id>/review.html): headline result, commands to try it, results per test ID, changes from the plan, impact and behaviour, the engineering check judged on the code, and the records. Use at stage 3 of building a module, after the code passes, or when the user asks how a module was tested or whether it's ready.
---

# Write a module's test review page

Stage 3 of `docs/building.md`. Every claim on this page comes from a command run on the commit the page names. Nothing comes from memory or from the plan.

## 1. Gather the evidence

1. `git rev-parse --short HEAD`: the commit the page names.
2. `{{TEST_CMD}}`: map every spec test to its test ID and result. Check each test ID in the plan has a test.
3. The earlier modules' tests are in the same run. Note any that changed result.
4. `{{CHECK_CMD}}`: the full repo check.
5. Measurements the plan named: save raw output to `docs/evidence/<id>/` and note the machine.
6. Manual steps: run them if you can, or write exact steps for the user and mark them not yet run.
7. `git diff --stat main...HEAD` and `git diff main...HEAD`: the real impact.
8. Spec tests changed since the lock: `git log --reverse --format=%h -- docs/modules/<id>/spec.lock | head -1` gives the first lock commit; diff the spec files from there to `HEAD`. Each change must name the plan round that agreed it.
9. Mutation testing on the changed packages: `{{MUTATION_CMD}}`. Note each package's score and every surviving mutant.
10. The SDK as built: `{{API_LISTING_CMD}}`, to compare with the plan's SDK section.

## 2. Fill the page

1. Copy `docs/modules/templates/review.html` to `docs/modules/<id>/review.html`. Fill the header with the commit and the plan's agreed date. Leave `data-gate="ship it"` on `<body>`.
2. Fill each section in order, following its hint, then delete the hint.

| Section | Holds | Rule |
|---|---|---|
| Summary box | Result chip, what changed from the plan, who notices, what you decide | 80 words |
| Try it yourself | Numbered steps, each a `pre.cmd` command and what you should see | Run each yourself first, exactly as written |
| Results | One row per test ID with a status chip (`good` pass, `bad` fail, `warn` not yet run), and one row for earlier modules | Numbers name their budget |
| Changes from the plan | Every difference, small ones included | A changed decision names the plan round that agreed it. Unagreed? Stop and raise it |
| Impact and behaviour | File tree from the real diff, and who notices | "None" only after checking |
| Engineering check | The plan's three rows judged on the code, the SDK against the plan, the lock, mutation scores, and the code reviewer's findings | Verdict chip and evidence |
| Records | The checklist of what ships; mark each `done` as it lands | — |
| Your calls | Only what needs the user. Delete the section if there's none | — |
| Review log | One row per round, naming the commit | — |

## 3. Check and hand over

- No hint is left: `grep -c 'class="hint"' docs/modules/<id>/review.html` prints 0.
- It renders in a browser, light and dark, and the reply box reads "ship it" with nothing changed.
- Reply with the path, `open docs/modules/<id>/review.html`, the headline result (for example "14 of 14 pass, 1 manual step for you"), and the ids that need answers. Loop until the user says "ship it".
- Each later round follows the plan skill's round steps.
