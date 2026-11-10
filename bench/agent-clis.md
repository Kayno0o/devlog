# Agent CLIs: output size

Characters a coding agent reads back from four everyday tasks, the raw command against the @kaynooo/cli-* bin replacing it.

Measured on 10 November 2026 on a copy of this repo at e9a3102 (kay 1.94.0, Bun 1.4.4), run from Claude Code, with three failures planted:

- a type error: `formatNumber` in `src/format.ts` declared to return `number`;
- a lint error: an unused `const unused = 1` in `src/frameworks.ts`;
- a failing test: `tests/home.test.ts` expecting status 201.

Bins: gst 0.16.1 (`@kaynooo/cli-git`), peek 0.15.1 (`@kaynooo/cli-code`), check 0.20.1 (`@kaynooo/cli-check`), out 0.14.5 (`@kaynooo/cli-out`).

Each command ran once with stdout and stderr captured together, counted with `wc -c`.

| Task | Raw command | Characters | Bin | Characters | Change |
| --- | --- | ---: | --- | ---: | ---: |
| Repo state | `git status; git log --oneline -1` | 461 | `gst` | 245 | -47% |
| Reading one function | `cat src/page-weight.ts` | 3,567 | `peek --def linkedUrls` | 1,346 | -62% |
| Typecheck, lint, test | `bun run check; bun run lint; bun run test` | 1,419 | `check` | 1,599 | +13% |
| Build | `bun run build` | 410 | `out -- bun run build` | 410 | 0% |

`kay check`, `kay lint` and `bun test` already print only what failed (bun test does so when run from Claude Code), so `check` adds the path of each full log and an indent, and `out` has nothing to fold. Both checks' outputs include the copy's long absolute path twice, which a shorter checkout would trim from each.
