# LLM benchmark, sonnet-kay-titles

Each run is one headless Claude Code session (`claude -p --safe-mode`, no CLAUDE.md, hooks, plugins or MCP servers) building [the same site](../../spec.md) from [the same prompt](../../prompt.md) in a fresh copy of the framework's starter, with the framework's docs offline in `docs/`. A run passes when `bun run check`, `bun run build` and every test of the hidden [acceptance suite](../../acceptance/site.test.ts) pass. `check` is each starter's own script, failing on errors only: `kay check`, `svelte-check`, `tsc --noEmit`, `astro check`, `nuxt typecheck`, `next typegen && tsc --noEmit`.

Model claude-sonnet-5-5, effort medium, Claude Code 2.1.289, runs from 2026-10-19T16:16:25.571Z to 2026-10-19T16:24:10.922Z. Every measure is the median of the runs that passed, with the lowest and highest in brackets. Input tokens, cache writes and cache reads are what the model read; output tokens, thinking included, what it wrote.

| Runs | kay |
| --- | ---: |
| Passed | 5 of 5 |
| Cost of every run, failed ones included (USD) | 1.30 |
| Tokens of every run | 1,971,281 |
| Minutes of every run | 8 |

## Tokens

| Measure | kay |
| --- | ---: |
| Input tokens, uncached | 32 (26 to 38) |
| Cache write tokens | 28,403 (24,426 to 32,996) |
| Cache read tokens | 348,485 (252,096 to 477,775) |
| Output tokens | 7,350 (7,119 to 8,019) |
| Thinking tokens, part of output | 988 (790 to 1,067) |
| All tokens | 384,295 (289,812 to 518,828) |
| Largest context of one call | 32,259 (29,807 to 38,377) |
| Cost (USD, API prices) | 0.25 (0.24 to 0.31) |

## Time

| Measure | kay |
| --- | ---: |
| Wall time (minutes) | 1.4 (1.2 to 2.5) |
| Time waiting on the API (minutes) | 1.2 (1.0 to 2.3) |

## Agent

| Measure | kay |
| --- | ---: |
| Turns | 16 (13 to 19) |
| API calls | 16 (13 to 19) |
| Tool calls | 15 (12 to 18) |
| Read calls | 0 (0 to 0) |
| Write calls | 0 (0 to 0) |
| Edit calls | 0 (0 to 0) |
| Bash calls | 15 (12 to 18) |
| Glob calls | 0 (0 to 0) |
| Grep calls | 0 (0 to 0) |
| Tool calls that failed | 1 (0 to 2) |

## Docs

| Measure | kay |
| --- | ---: |
| Tool calls reading the docs | 4 (3 to 6) |
| Docs characters read | 28,980 (24,984 to 32,666) |

## Checks

| Measure | kay |
| --- | ---: |
| Checks and builds run | 4 (2 to 6) |
| Checks and builds that failed | 0 (0 to 1) |
| Check errors hit on the way | 0 (0 to 1) |

## Code

| Measure | kay |
| --- | ---: |
| Files written or changed | 22 (22 to 22) |
| Lines added, tests and styles left out | 310 (301 to 315) |
| Test lines added | 0 (0 to 0) |
| Style lines added | 0 (0 to 0) |
| Lines removed | 3 (3 to 3) |
| Packages added | 0 (0 to 0) |

## Every run

| Run | Passed | Output tokens | Input tokens, uncached | Cache write tokens | Cache read tokens | Cost (USD, API prices) | Wall time (minutes) | Turns | Tool calls | Check errors hit on the way | Lines added, tests and styles left out |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| kay 1 | yes | 7,350 | 26 | 30,340 | 252,096 | 0.25 | 1.4 | 13 | 12 | 0 | 301 |
| kay 2 | yes | 7,375 | 32 | 28,403 | 348,485 | 0.26 | 1.5 | 16 | 15 | 0 | 309 |
| kay 3 | yes | 8,019 | 38 | 32,996 | 477,775 | 0.31 | 2.5 | 19 | 18 | 0 | 314 |
| kay 4 | yes | 7,119 | 32 | 26,878 | 346,900 | 0.25 | 1.2 | 16 | 15 | 1 | 310 |
| kay 5 | yes | 7,261 | 34 | 24,426 | 365,696 | 0.24 | 1.4 | 18 | 17 | 0 | 315 |

## Versions and docs

- kay: bun 1.4.3, kay 1.51.0, claude 2.1.289; docs: kay 1.51.0 package (llms.txt, llms/), 39 files, 0.6 MB; packages added by an agent: none

## Isolation

- Each agent ran under bwrap, which hid `~/Workspace`, `~/.claude`, `~/.cache/claude-tmp`, `~/.cache/llm-bench`, `~/.cache/ms-playwright`: the acceptance suite and reference site, other runs' sites, past Claude transcripts and any browser to test with.
- No session started an MCP server.
- Plugins installed on the machine, listed by each session at start and kept off by `--safe-mode`: cc-plugin-agents-md, cc-plugin-plugin-authoring
- No tool call left the workspace or used the network beyond package installs.
- Bash calls running python, node or another package manager despite the prompt: kay 5 (1), kay 3 (1)
- No agent changed its package.json scripts or tsconfig.json.
- Input and cache tokens summed per API call match the totals each finished session reported.

## Failed runs

