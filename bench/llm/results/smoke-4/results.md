# LLM benchmark, smoke-4

Each run is one headless Claude Code session (`claude -p --safe-mode`, no CLAUDE.md, hooks, plugins or MCP servers) building [the same site](../../spec.md) from [the same prompt](../../prompt.md) in a fresh copy of the framework's starter, with the framework's docs offline in `docs/`. A run passes when `bun run check`, `bun run build` and every test of the hidden [acceptance suite](../../acceptance/site.test.ts) pass. `check` is each starter's own script: kay's `kay check --deny-warnings` also fails on warnings, the others' (`svelte-check`, `tsc --noEmit`, `astro check`) on errors only.

Model claude-sonnet-5-5, effort high, Claude Code 2.1.289, runs from 2026-10-10T00:15:20.112Z to 2026-10-10T00:18:13.874Z. Every measure is the median of the runs that passed, with the lowest and highest in brackets. Input tokens, cache writes and cache reads are what the model read; output tokens, thinking included, what it wrote.

| Runs | kay |
| --- | ---: |
| Passed | 3 of 3 |
| Cost of every run, failed ones included (USD) | 0.96 |
| Tokens of every run | 1,450,983 |
| Minutes of every run | 3 |

## Tokens

| Measure | kay |
| --- | ---: |
| Input tokens, uncached | 34 (26 to 34) |
| Cache write tokens | 39,338 (36,131 to 42,674) |
| Cache read tokens | 446,433 (334,878 to 528,556) |
| Output tokens | 7,749 (6,862 to 8,268) |
| Thinking tokens, part of output | 1,533 (912 to 1,596) |
| All tokens | 494,073 (377,897 to 579,013) |
| Largest context of one call | 44,719 (41,512 to 48,055) |
| Cost (USD, API prices) | 0.33 (0.28 to 0.35) |

## Time

| Measure | kay |
| --- | ---: |
| Wall time (minutes) | 1.1 (0.9 to 1.1) |
| Time waiting on the API (minutes) | 0.9 (0.8 to 0.9) |

## Agent

| Measure | kay |
| --- | ---: |
| Turns | 17 (14 to 18) |
| API calls | 17 (13 to 17) |
| Tool calls | 16 (13 to 17) |
| Read calls | 0 (0 to 1) |
| Write calls | 0 (0 to 0) |
| Edit calls | 0 (0 to 0) |
| Bash calls | 16 (12 to 17) |
| Glob calls | 0 (0 to 0) |
| Grep calls | 0 (0 to 0) |
| Tool calls that failed | 1 (0 to 1) |

## Docs

| Measure | kay |
| --- | ---: |
| Tool calls reading the docs | 7 (7 to 8) |
| Docs characters read | 65,422 (52,977 to 77,190) |

## Checks

| Measure | kay |
| --- | ---: |
| Checks and builds run | 4 (3 to 5) |
| Checks and builds that failed | 1 (0 to 1) |
| Check errors hit on the way | 1 (0 to 1) |

## Code

| Measure | kay |
| --- | ---: |
| Files written or changed | 22 (22 to 22) |
| Lines added | 299 (293 to 301) |
| Lines removed | 3 (3 to 3) |
| Packages added | 0 (0 to 0) |

## Every run

| Run | Passed | Output tokens | Input tokens, uncached | Cache write tokens | Cache read tokens | Cost (USD, API prices) | Wall time (minutes) | Turns | Tool calls | Check errors hit on the way | Lines added |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| kay 1 | yes | 8,268 | 34 | 39,338 | 446,433 | 0.33 | 1.1 | 18 | 17 | 1 | 299 |
| kay 2 | yes | 7,749 | 34 | 42,674 | 528,556 | 0.35 | 1.1 | 17 | 16 | 1 | 301 |
| kay 3 | yes | 6,862 | 26 | 36,131 | 334,878 | 0.28 | 0.9 | 14 | 13 | 0 | 293 |

## Versions and docs

- kay: bun 1.4.3, kay 1.17.2, claude 2.1.289; docs: kay 1.17.2 package (llms.txt, llms/), 18 files, 0.2 MB; packages added by an agent: none

## Isolation

- No session started an MCP server.
- Plugins installed on the machine, listed by each session at start and kept off by `--safe-mode`: guards, tmux-tab, work-band, memory-preload, commit-titles, athome-scope, open-questions, agent-cap, ticket-hold, git-facts, context7, typescript-lsp, php-lsp, rust-analyzer-lsp, gopls-lsp, session-report, lua-lsp, clangd-lsp, cc-plugin-agents-md, cc-plugin-plugin-authoring
- No tool call left the workspace or used the network beyond package installs.
- Every agent ran its commands with bun alone.
- No agent changed its package.json scripts or tsconfig.json.
- Input and cache tokens summed per API call match the totals each finished session reported.

## Failed runs

