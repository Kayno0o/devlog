# LLM benchmark, opus-probe-1.27

Each run is one headless Claude Code session (`claude -p --safe-mode`, no CLAUDE.md, hooks, plugins or MCP servers) building [the same site](../../spec.md) from [the same prompt](../../prompt.md) in a fresh copy of the framework's starter, with the framework's docs offline in `docs/`. A run passes when `bun run check`, `bun run build` and every test of the hidden [acceptance suite](../../acceptance/site.test.ts) pass. `check` is each starter's own script: kay's `kay check --deny-warnings` also fails on warnings, the others' (`svelte-check`, `tsc --noEmit`, `astro check`) on errors only.

Model claude-opus-5-5, effort high, Claude Code 2.1.289, runs from 2026-10-10T17:27:25.590Z to 2026-10-10T17:27:25.590Z. Every measure is the median of the runs that passed, with the lowest and highest in brackets. Input tokens, cache writes and cache reads are what the model read; output tokens, thinking included, what it wrote.

| Runs | kay |
| --- | ---: |
| Passed | 1 of 1 |
| Cost of every run, failed ones included (USD) | 0.94 |
| Tokens of every run | 1,272,319 |
| Minutes of every run | 3 |

## Tokens

| Measure | kay |
| --- | ---: |
| Input tokens, uncached | 62 (62 to 62) |
| Cache write tokens | 54,810 (54,810 to 54,810) |
| Cache read tokens | 1,204,434 (1,204,434 to 1,204,434) |
| Output tokens | 13,013 (13,013 to 13,013) |
| Thinking tokens, part of output | 3,973 (3,973 to 3,973) |
| All tokens | 1,272,319 (1,272,319 to 1,272,319) |
| Largest context of one call | 60,066 (60,066 to 60,066) |
| Cost (USD, API prices) | 0.94 (0.94 to 0.94) |

## Time

| Measure | kay |
| --- | ---: |
| Wall time (minutes) | 2.6 (2.6 to 2.6) |
| Time waiting on the API (minutes) | 2.4 (2.4 to 2.4) |

## Agent

| Measure | kay |
| --- | ---: |
| Turns | 32 (32 to 32) |
| API calls | 31 (31 to 31) |
| Tool calls | 31 (31 to 31) |
| Read calls | 0 (0 to 0) |
| Write calls | 0 (0 to 0) |
| Edit calls | 0 (0 to 0) |
| Bash calls | 31 (31 to 31) |
| Glob calls | 0 (0 to 0) |
| Grep calls | 0 (0 to 0) |
| Tool calls that failed | 1 (1 to 1) |

## Docs

| Measure | kay |
| --- | ---: |
| Tool calls reading the docs | 11 (11 to 11) |
| Docs characters read | 50,883 (50,883 to 50,883) |

## Checks

| Measure | kay |
| --- | ---: |
| Checks and builds run | 7 (7 to 7) |
| Checks and builds that failed | 1 (1 to 1) |
| Check errors hit on the way | 1 (1 to 1) |

## Code

| Measure | kay |
| --- | ---: |
| Files written or changed | 23 (23 to 23) |
| Lines added, tests and styles left out | 334 (334 to 334) |
| Test lines added | 0 (0 to 0) |
| Style lines added | 0 (0 to 0) |
| Lines removed | 4 (4 to 4) |
| Packages added | 0 (0 to 0) |

## Every run

| Run | Passed | Output tokens | Input tokens, uncached | Cache write tokens | Cache read tokens | Cost (USD, API prices) | Wall time (minutes) | Turns | Tool calls | Check errors hit on the way | Lines added, tests and styles left out |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| kay 1 | yes | 13,013 | 62 | 54,810 | 1,204,434 | 0.94 | 2.6 | 32 | 31 | 1 | 334 |

## Versions and docs

- kay: bun 1.4.4, kay 1.27.0, claude 2.1.289; docs: kay 1.27.0 package (llms.txt, llms/), 18 files, 0.2 MB; packages added by an agent: none

## Isolation

- Each agent ran under bwrap, which hid `~/Workspace`, `~/.claude`, `~/.cache/claude-tmp`, `~/.cache/llm-bench`, `~/.cache/ms-playwright`: the acceptance suite and reference site, other runs' sites, past Claude transcripts and any browser to test with.
- No session started an MCP server.
- Plugins installed on the machine, listed by each session at start and kept off by `--safe-mode`: cc-plugin-agents-md, cc-plugin-plugin-authoring
- Tool calls outside the workspace or on the network: kay 1: `Bash: sed -n 1,400p /home/kaynooo/.cache/llm-bench/opus-probe-1.27/kay-1/claude-config/projects/-hom...`
- Bash calls running python, node or another package manager despite the prompt: kay 1 (1)
- No agent changed its package.json scripts or tsconfig.json.
- Input and cache tokens summed per API call match the totals each finished session reported.

## Failed runs

