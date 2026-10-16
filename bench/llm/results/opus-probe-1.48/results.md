# LLM benchmark, opus-probe-1.48

Each run is one headless Claude Code session (`claude -p --safe-mode`, no CLAUDE.md, hooks, plugins or MCP servers) building [the same site](../../spec.md) from [the same prompt](../../prompt.md) in a fresh copy of the framework's starter, with the framework's docs offline in `docs/`. A run passes when `bun run check`, `bun run build` and every test of the hidden [acceptance suite](../../acceptance/site.test.ts) pass. `check` is each starter's own script, failing on errors only: `kay check`, `svelte-check`, `tsc --noEmit`, `astro check`, `nuxt typecheck`, `next typegen && tsc --noEmit`.

Model claude-opus-5-5, effort high, Claude Code 2.1.289, runs from 2026-10-16T18:48:57.685Z to 2026-10-16T18:48:57.685Z. Every measure is the median of the runs that passed, with the lowest and highest in brackets. Input tokens, cache writes and cache reads are what the model read; output tokens, thinking included, what it wrote.

| Runs | kay |
| --- | ---: |
| Passed | 1 of 1 |
| Cost of every run, failed ones included (USD) | 0.94 |
| Tokens of every run | 992,990 |
| Minutes of every run | 3 |

## Tokens

| Measure | kay |
| --- | ---: |
| Input tokens, uncached | 54 (54 to 54) |
| Cache write tokens | 54,244 (54,244 to 54,244) |
| Cache read tokens | 922,410 (922,410 to 922,410) |
| Output tokens | 16,282 (16,282 to 16,282) |
| Thinking tokens, part of output | 4,345 (4,345 to 4,345) |
| All tokens | 992,990 (992,990 to 992,990) |
| Largest context of one call | 58,753 (58,753 to 58,753) |
| Cost (USD, API prices) | 0.94 (0.94 to 0.94) |

## Time

| Measure | kay |
| --- | ---: |
| Wall time (minutes) | 2.5 (2.5 to 2.5) |
| Time waiting on the API (minutes) | 2.3 (2.3 to 2.3) |

## Agent

| Measure | kay |
| --- | ---: |
| Turns | 27 (27 to 27) |
| API calls | 27 (27 to 27) |
| Tool calls | 26 (26 to 26) |
| Read calls | 0 (0 to 0) |
| Write calls | 0 (0 to 0) |
| Edit calls | 0 (0 to 0) |
| Bash calls | 26 (26 to 26) |
| Glob calls | 0 (0 to 0) |
| Grep calls | 0 (0 to 0) |
| Tool calls that failed | 1 (1 to 1) |

## Docs

| Measure | kay |
| --- | ---: |
| Tool calls reading the docs | 15 (15 to 15) |
| Docs characters read | 76,222 (76,222 to 76,222) |

## Checks

| Measure | kay |
| --- | ---: |
| Checks and builds run | 6 (6 to 6) |
| Checks and builds that failed | 0 (0 to 0) |
| Check errors hit on the way | 0 (0 to 0) |

## Code

| Measure | kay |
| --- | ---: |
| Files written or changed | 26 (26 to 26) |
| Lines added, tests and styles left out | 335 (335 to 335) |
| Test lines added | 94 (94 to 94) |
| Style lines added | 0 (0 to 0) |
| Lines removed | 3 (3 to 3) |
| Packages added | 1 (1 to 1) |

## Every run

| Run | Passed | Output tokens | Input tokens, uncached | Cache write tokens | Cache read tokens | Cost (USD, API prices) | Wall time (minutes) | Turns | Tool calls | Check errors hit on the way | Lines added, tests and styles left out |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| kay 1 | yes | 16,282 | 54 | 54,244 | 922,410 | 0.94 | 2.5 | 27 | 26 | 0 | 335 |

## Versions and docs

- kay: bun 1.4.3, kay 1.48.0, claude 2.1.289; docs: kay 1.48.0 package (llms.txt, llms/), 22 files, 0.6 MB; packages added by an agent: @happy-dom/global-registrator

## Isolation

- Each agent ran under bwrap, which hid `~/Workspace`, `~/.claude`, `~/.cache/claude-tmp`, `~/.cache/llm-bench`, `~/.cache/ms-playwright`: the acceptance suite and reference site, other runs' sites, past Claude transcripts and any browser to test with.
- No session started an MCP server.
- Plugins installed on the machine, listed by each session at start and kept off by `--safe-mode`: cc-plugin-agents-md, cc-plugin-plugin-authoring
- No tool call left the workspace or used the network beyond package installs.
- Bash calls running python, node or another package manager despite the prompt: kay 1 (1)
- No agent changed its package.json scripts or tsconfig.json.
- Input and cache tokens summed per API call match the totals each finished session reported.

## Failed runs

