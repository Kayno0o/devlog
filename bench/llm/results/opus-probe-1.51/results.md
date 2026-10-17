# LLM benchmark, opus-probe-1.51

Each run is one headless Claude Code session (`claude -p --safe-mode`, no CLAUDE.md, hooks, plugins or MCP servers) building [the same site](../../spec.md) from [the same prompt](../../prompt.md) in a fresh copy of the framework's starter, with the framework's docs offline in `docs/`. A run passes when `bun run check`, `bun run build` and every test of the hidden [acceptance suite](../../acceptance/site.test.ts) pass. `check` is each starter's own script, failing on errors only: `kay check`, `svelte-check`, `tsc --noEmit`, `astro check`, `nuxt typecheck`, `next typegen && tsc --noEmit`.

Model claude-opus-5-5, effort high, Claude Code 2.1.289, runs from 2026-10-17T00:55:53.397Z to 2026-10-17T00:58:11.201Z. Every measure is the median of the runs that passed, with the lowest and highest in brackets. Input tokens, cache writes and cache reads are what the model read; output tokens, thinking included, what it wrote.

| Runs | kay |
| --- | ---: |
| Passed | 2 of 2 |
| Cost of every run, failed ones included (USD) | 1.84 |
| Tokens of every run | 2,294,172 |
| Minutes of every run | 4 |

## Tokens

| Measure | kay |
| --- | ---: |
| Input tokens, uncached | 55 (44 to 66) |
| Cache write tokens | 56,103 (55,410 to 56,795) |
| Cache read tokens | 1,078,203 (810,327 to 1,346,078) |
| Output tokens | 12,726 (12,215 to 13,237) |
| Thinking tokens, part of output | 3,205 (2,856 to 3,553) |
| All tokens | 1,147,086 (877,996 to 1,416,176) |
| Largest context of one call | 60,985 (59,919 to 62,051) |
| Cost (USD, API prices) | 0.92 (0.85 to 0.99) |

## Time

| Measure | kay |
| --- | ---: |
| Wall time (minutes) | 2.1 (2.0 to 2.1) |
| Time waiting on the API (minutes) | 1.9 (1.8 to 2.0) |

## Agent

| Measure | kay |
| --- | ---: |
| Turns | 28 (23 to 33) |
| API calls | 28 (22 to 33) |
| Tool calls | 27 (22 to 32) |
| Read calls | 1 (0 to 2) |
| Write calls | 0 (0 to 0) |
| Edit calls | 0 (0 to 0) |
| Bash calls | 26 (20 to 32) |
| Glob calls | 0 (0 to 0) |
| Grep calls | 0 (0 to 0) |
| Tool calls that failed | 1 (1 to 1) |

## Docs

| Measure | kay |
| --- | ---: |
| Tool calls reading the docs | 13 (10 to 15) |
| Docs characters read | 77,844 (76,908 to 78,779) |

## Checks

| Measure | kay |
| --- | ---: |
| Checks and builds run | 5 (5 to 5) |
| Checks and builds that failed | 0 (0 to 0) |
| Check errors hit on the way | 0 (0 to 0) |

## Code

| Measure | kay |
| --- | ---: |
| Files written or changed | 25 (23 to 26) |
| Lines added, tests and styles left out | 324 (321 to 327) |
| Test lines added | 37 (0 to 74) |
| Style lines added | 5 (0 to 9) |
| Lines removed | 3 (3 to 3) |
| Packages added | 1 (0 to 1) |

## Every run

| Run | Passed | Output tokens | Input tokens, uncached | Cache write tokens | Cache read tokens | Cost (USD, API prices) | Wall time (minutes) | Turns | Tool calls | Check errors hit on the way | Lines added, tests and styles left out |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| kay 1 | yes | 12,215 | 44 | 55,410 | 810,327 | 0.85 | 2.0 | 23 | 22 | 0 | 327 |
| kay 2 | yes | 13,237 | 66 | 56,795 | 1,346,078 | 0.99 | 2.1 | 33 | 32 | 0 | 321 |

## Versions and docs

- kay: bun 1.4.3, kay 1.51.0, claude 2.1.289; docs: kay 1.51.0 package (llms.txt, llms/), 39 files, 0.6 MB; packages added by an agent: @happy-dom/global-registrator

## Isolation

- Each agent ran under bwrap, which hid `~/Workspace`, `~/.claude`, `~/.cache/claude-tmp`, `~/.cache/llm-bench`, `~/.cache/ms-playwright`: the acceptance suite and reference site, other runs' sites, past Claude transcripts and any browser to test with.
- No session started an MCP server.
- Plugins installed on the machine, listed by each session at start and kept off by `--safe-mode`: cc-plugin-agents-md, cc-plugin-plugin-authoring
- No tool call left the workspace or used the network beyond package installs.
- Bash calls running python, node or another package manager despite the prompt: kay 2 (1), kay 1 (1)
- No agent changed its package.json scripts or tsconfig.json.
- Input and cache tokens summed per API call match the totals each finished session reported.

## Failed runs

