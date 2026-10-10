# LLM benchmark, opus-probe

Each run is one headless Claude Code session (`claude -p --safe-mode`, no CLAUDE.md, hooks, plugins or MCP servers) building [the same site](../../spec.md) from [the same prompt](../../prompt.md) in a fresh copy of the framework's starter, with the framework's docs offline in `docs/`. A run passes when `bun run check`, `bun run build` and every test of the hidden [acceptance suite](../../acceptance/site.test.ts) pass. `check` is each starter's own script: kay's `kay check --deny-warnings` also fails on warnings, the others' (`svelte-check`, `tsc --noEmit`, `astro check`) on errors only.

Model claude-opus-5-5, effort high, Claude Code 2.1.289, runs from 2026-10-10T00:43:27.240Z to 2026-10-10T00:43:27.240Z. Every measure is the median of the runs that passed, with the lowest and highest in brackets. Input tokens, cache writes and cache reads are what the model read; output tokens, thinking included, what it wrote.

| Runs | kay |
| --- | ---: |
| Passed | 1 of 1 |
| Cost of every run, failed ones included (USD) | 0.93 |
| Tokens of every run | 956,535 |
| Minutes of every run | 2 |

## Tokens

| Measure | kay |
| --- | ---: |
| Input tokens, uncached | 42 (42 to 42) |
| Cache write tokens | 60,793 (60,793 to 60,793) |
| Cache read tokens | 882,374 (882,374 to 882,374) |
| Output tokens | 13,326 (13,326 to 13,326) |
| Thinking tokens, part of output | 2,865 (2,865 to 2,865) |
| All tokens | 956,535 (956,535 to 956,535) |
| Largest context of one call | 65,302 (65,302 to 65,302) |
| Cost (USD, API prices) | 0.93 (0.93 to 0.93) |

## Time

| Measure | kay |
| --- | ---: |
| Wall time (minutes) | 2.2 (2.2 to 2.2) |
| Time waiting on the API (minutes) | 1.9 (1.9 to 1.9) |

## Agent

| Measure | kay |
| --- | ---: |
| Turns | 25 (25 to 25) |
| API calls | 21 (21 to 21) |
| Tool calls | 24 (24 to 24) |
| Read calls | 4 (4 to 4) |
| Write calls | 0 (0 to 0) |
| Edit calls | 0 (0 to 0) |
| Bash calls | 20 (20 to 20) |
| Glob calls | 0 (0 to 0) |
| Grep calls | 0 (0 to 0) |
| Tool calls that failed | 1 (1 to 1) |

## Docs

| Measure | kay |
| --- | ---: |
| Tool calls reading the docs | 10 (10 to 10) |
| Docs characters read | 99,583 (99,583 to 99,583) |

## Checks

| Measure | kay |
| --- | ---: |
| Checks and builds run | 5 (5 to 5) |
| Checks and builds that failed | 1 (1 to 1) |
| Check errors hit on the way | 1 (1 to 1) |

## Code

| Measure | kay |
| --- | ---: |
| Files written or changed | 25 (25 to 25) |
| Lines added | 431 (431 to 431) |
| Lines removed | 3 (3 to 3) |
| Packages added | 1 (1 to 1) |

## Every run

| Run | Passed | Output tokens | Input tokens, uncached | Cache write tokens | Cache read tokens | Cost (USD, API prices) | Wall time (minutes) | Turns | Tool calls | Check errors hit on the way | Lines added |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| kay 1 | yes | 13,326 | 42 | 60,793 | 882,374 | 0.93 | 2.2 | 25 | 24 | 1 | 431 |

## Versions and docs

- kay: bun 1.4.3, kay 1.17.4, claude 2.1.289; docs: kay 1.17.4 package (llms.txt, llms/), 18 files, 0.2 MB; packages added by an agent: @happy-dom/global-registrator

## Isolation

- No session started an MCP server.
- Plugins installed on the machine, listed by each session at start and kept off by `--safe-mode`: guards, tmux-tab, work-band, memory-preload, commit-titles, athome-scope, open-questions, agent-cap, ticket-hold, git-facts, context7, typescript-lsp, php-lsp, rust-analyzer-lsp, gopls-lsp, session-report, lua-lsp, clangd-lsp, cc-plugin-agents-md, cc-plugin-plugin-authoring
- No tool call left the workspace or used the network beyond package installs.
- Bash calls running python, node or another package manager despite the prompt: kay 1 (1)
- No agent changed its package.json scripts or tsconfig.json.
- Input and cache tokens summed per API call match the totals each finished session reported.

## Failed runs

