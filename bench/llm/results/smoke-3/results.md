# LLM benchmark, smoke-3

Each run is one headless Claude Code session (`claude -p --safe-mode`, no CLAUDE.md, hooks, plugins or MCP servers) building [the same site](../../spec.md) from [the same prompt](../../prompt.md) in a fresh copy of the framework's starter, with the framework's docs offline in `docs/`. A run passes when `bun run check`, `bun run build` and every test of the hidden [acceptance suite](../../acceptance/site.test.ts) pass. `check` is each starter's own script: kay's `kay check --deny-warnings` also fails on warnings, the others' (`svelte-check`, `tsc --noEmit`, `astro check`) on errors only.

Model claude-sonnet-5-5, effort high, Claude Code 2.1.289, runs from 2026-10-09T23:35:38.816Z to 2026-10-09T23:35:38.816Z. Every measure is the median of the runs that passed, with the lowest and highest in brackets. Input tokens, cache writes and cache reads are what the model read; output tokens, thinking included, what it wrote.

| Runs | kay |
| --- | ---: |
| Passed | 1 of 1 |
| Cost of every run, failed ones included (USD) | 0.60 |
| Tokens of every run | 1,234,041 |
| Minutes of every run | 2 |

## Tokens

| Measure | kay |
| --- | ---: |
| Input tokens, uncached | 50 (50 to 50) |
| Cache write tokens | 59,093 (59,093 to 59,093) |
| Cache read tokens | 1,162,162 (1,162,162 to 1,162,162) |
| Output tokens | 12,736 (12,736 to 12,736) |
| Thinking tokens, part of output | 4,404 (4,404 to 4,404) |
| All tokens | 1,234,041 (1,234,041 to 1,234,041) |
| Largest context of one call | 64,474 (64,474 to 64,474) |
| Cost (USD, API prices) | 0.60 (0.60 to 0.60) |

## Time

| Measure | kay |
| --- | ---: |
| Wall time (minutes) | 1.8 (1.8 to 1.8) |
| Time waiting on the API (minutes) | 1.6 (1.6 to 1.6) |

## Agent

| Measure | kay |
| --- | ---: |
| Turns | 29 (29 to 29) |
| API calls | 25 (25 to 25) |
| Tool calls | 28 (28 to 28) |
| Read calls | 6 (6 to 6) |
| Write calls | 0 (0 to 0) |
| Edit calls | 0 (0 to 0) |
| Bash calls | 22 (22 to 22) |
| Glob calls | 0 (0 to 0) |
| Grep calls | 0 (0 to 0) |
| Tool calls that failed | 2 (2 to 2) |

## Docs

| Measure | kay |
| --- | ---: |
| Tool calls reading the docs | 10 (10 to 10) |
| Docs characters read | 99,283 (99,283 to 99,283) |

## Checks

| Measure | kay |
| --- | ---: |
| Checks and builds run | 7 (7 to 7) |
| Checks and builds that failed | 2 (2 to 2) |
| Check errors hit on the way | 2 (2 to 2) |

## Code

| Measure | kay |
| --- | ---: |
| Files written or changed | 23 (23 to 23) |
| Lines added | 336 (336 to 336) |
| Lines removed | 3 (3 to 3) |
| Packages added | 0 (0 to 0) |

## Every run

| Run | Passed | Output tokens | Input tokens, uncached | Cache write tokens | Cache read tokens | Cost (USD, API prices) | Wall time (minutes) | Turns | Tool calls | Check errors hit on the way | Lines added |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| kay 1 | yes | 12,736 | 50 | 59,093 | 1,162,162 | 0.60 | 1.8 | 29 | 28 | 2 | 336 |

## Versions and docs

- kay: bun 1.4.3, kay 1.17.0, claude 2.1.289; docs: kay 1.17.0 package (llms.txt, llms/), 17 files, 0.2 MB; packages added by an agent: none

## Isolation

- No session started an MCP server.
- Plugins installed on the machine, listed by each session at start and kept off by `--safe-mode`: guards, tmux-tab, work-band, memory-preload, commit-titles, athome-scope, open-questions, agent-cap, ticket-hold, git-facts, context7, typescript-lsp, php-lsp, rust-analyzer-lsp, gopls-lsp, session-report, lua-lsp, clangd-lsp, cc-plugin-agents-md, cc-plugin-plugin-authoring
- No tool call left the workspace or used the network beyond package installs.
- Bash calls running python, node or another package manager despite the prompt: kay 1 (1)
- No agent changed its package.json scripts or tsconfig.json.
- Input and cache tokens summed per API call match the totals each finished session reported.

## Failed runs

