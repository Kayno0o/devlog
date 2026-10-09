# LLM benchmark, smoke

Each run is one headless Claude Code session (`claude -p --safe-mode`, no CLAUDE.md, hooks, plugins or MCP servers) building [the same site](../../spec.md) from [the same prompt](../../prompt.md) in a fresh copy of the framework's starter, with the framework's docs offline in `docs/`. A run passes when `bun run check`, `bun run build` and every test of the hidden [acceptance suite](../../acceptance/site.test.ts) pass. `check` is each starter's own script: kay's `kay check --deny-warnings` also fails on warnings, the others' (`svelte-check`, `tsc --noEmit`, `astro check`) on errors only.

Model claude-sonnet-5-5, effort high, Claude Code 2.1.289, runs from 2026-10-09T22:21:30.079Z to 2026-10-09T22:21:30.079Z. Every measure is the median of the runs that passed, with the lowest and highest in brackets. Input tokens, cache writes and cache reads are what the model read; output tokens, thinking included, what it wrote.

| Runs | kay |
| --- | ---: |
| Passed | 0 of 1 |
| Cost of every run, failed ones included (USD) | 0.71 |
| Tokens of every run | 1,277,464 |
| Minutes of every run | 2 |

## Tokens

| Measure | kay |
| --- | ---: |
| Input tokens, uncached | no passing run |
| Cache write tokens | no passing run |
| Cache read tokens | no passing run |
| Output tokens | no passing run |
| Thinking tokens, part of output | no passing run |
| All tokens | no passing run |
| Largest context of one call | no passing run |
| Cost (USD, API prices) | no passing run |

## Time

| Measure | kay |
| --- | ---: |
| Wall time (minutes) | no passing run |
| Time waiting on the API (minutes) | no passing run |

## Agent

| Measure | kay |
| --- | ---: |
| Turns | no passing run |
| API calls | no passing run |
| Tool calls | no passing run |
| Read calls | no passing run |
| Write calls | no passing run |
| Edit calls | no passing run |
| Bash calls | no passing run |
| Glob calls | no passing run |
| Grep calls | no passing run |
| Tool calls that failed | no passing run |

## Docs

| Measure | kay |
| --- | ---: |
| Tool calls reading the docs | no passing run |
| Docs characters read | no passing run |

## Checks

| Measure | kay |
| --- | ---: |
| Checks and builds run | no passing run |
| Checks and builds that failed | no passing run |
| Check errors hit on the way | no passing run |

## Code

| Measure | kay |
| --- | ---: |
| Files written or changed | no passing run |
| Lines added | no passing run |
| Lines removed | no passing run |
| Packages added | no passing run |

## Every run

| Run | Passed | Output tokens | Input tokens, uncached | Cache write tokens | Cache read tokens | Cost (USD, API prices) | Wall time (minutes) | Turns | Tool calls | Check errors hit on the way | Lines added |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| kay 1 | no | 17,100 | 50 | 74,492 | 1,185,822 | 0.71 | 2.2 | 31 | 30 | 1 | 290 |

## Versions and docs

- kay: bun 1.4.3, kay 1.16.5, claude 2.1.289; docs: kay 1.16.5 package (llms.txt, llms/), 17 files, 0.2 MB; packages added by an agent: none

## Isolation

- No session started an MCP server.
- Plugins installed on the machine, listed by each session at start and kept off by `--safe-mode`: guards, tmux-tab, work-band, memory-preload, commit-titles, athome-scope, open-questions, agent-cap, ticket-hold, git-facts, context7, typescript-lsp, php-lsp, rust-analyzer-lsp, gopls-lsp, session-report, lua-lsp, clangd-lsp, cc-plugin-agents-md, cc-plugin-plugin-authoring
- Tool calls outside the workspace or on the network: kay 1: Read: /home/kaynooo/.cache/llm-bench/smoke/kay-1/docs/llms/islands.md
- No agent changed its package.json scripts or tsconfig.json.
- Input and cache tokens summed per API call match the totals each finished session reported.

## Failed runs

- kay run 1: success, check ok, build ok, failing: contact > validates on the server without JavaScript
