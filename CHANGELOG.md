# Changelog

Every change to {{PROJECT}}'s design, build plan and docs, newest first. Each line says **what** changed. The linked ADR in [`docs/decisions/`](docs/decisions/README.md) says **why**. Git holds the exact diff.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Entries are grouped by date until releases start.

Headings in use: **Decided** (a new or changed ADR), **Added**, **Changed**, **Removed**, **Fixed**.

## 2026-10-22

### Decided

- Accepted the process decisions: decisions as ADRs ([ADR-0001](docs/decisions/0001-record-every-decision-as-an-adr-with-reopen-only-if-conditions.md)), the four-stage module process ([ADR-0002](docs/decisions/0002-build-each-module-through-an-agreed-plan-page-then-an-agreed-test-review-page-then-one-pull-request.md)), packages used only through agreed SDKs ([ADR-0003](docs/decisions/0003-use-every-package-only-through-its-agreed-sdk.md)), locked spec tests from a fresh agent ([ADR-0004](docs/decisions/0004-lock-spec-tests-written-from-the-plan-by-a-fresh-agent.md)), and checks plus fresh-context reviews ([ADR-0005](docs/decisions/0005-check-code-and-docs-with-linters-repo-checks-and-fresh-context-reviews.md)).

### Added

- The agent brain: `AGENTS.md`, the process docs, module page templates, skills, review agents, the history check and the spec-test lock.

### Fixed

- Kit fixes from two end-to-end setup runs: spec tests and their lock are committed with the code, the page theme names diagram colours by role (`--adapter`, `--store`), and the hook resolves symlinked paths.
