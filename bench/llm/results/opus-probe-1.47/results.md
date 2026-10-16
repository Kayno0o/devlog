# LLM benchmark, opus-probe-1.47

Each run is one headless Claude Code session (`claude -p --safe-mode`, no CLAUDE.md, hooks, plugins or MCP servers) building [the same site](../../spec.md) from [the same prompt](../../prompt.md) in a fresh copy of the framework's starter, with the framework's docs offline in `docs/`. A run passes when `bun run check`, `bun run build` and every test of the hidden [acceptance suite](../../acceptance/site.test.ts) pass. `check` is each starter's own script, failing on errors only: `kay check`, `svelte-check`, `tsc --noEmit`, `astro check`, `nuxt typecheck`, `next typegen && tsc --noEmit`.

Model claude-opus-5-5, effort high, Claude Code 2.1.289, runs from 2026-10-16T17:07:10.248Z to 2026-10-16T17:07:10.248Z. Every measure is the median of the runs that passed, with the lowest and highest in brackets. Input tokens, cache writes and cache reads are what the model read; output tokens, thinking included, what it wrote.

| Runs | kay |
| --- | ---: |
| Passed | 1 of 1 |
| Cost of every run, failed ones included (USD) | 1.18 |
| Tokens of every run | 1,639,500 |
| Minutes of every run | 3 |

## Tokens

| Measure | kay |
| --- | ---: |
| Input tokens, uncached | 72 (72 to 72) |
| Cache write tokens | 61,930 (61,930 to 61,930) |
| Cache read tokens | 1,558,695 (1,558,695 to 1,558,695) |
| Output tokens | 18,803 (18,803 to 18,803) |
| Thinking tokens, part of output | 5,309 (5,309 to 5,309) |
| All tokens | 1,639,500 (1,639,500 to 1,639,500) |
| Largest context of one call | 66,439 (66,439 to 66,439) |
| Cost (USD, API prices) | 1.18 (1.18 to 1.18) |

## Time

| Measure | kay |
| --- | ---: |
| Wall time (minutes) | 3.0 (3.0 to 3.0) |
| Time waiting on the API (minutes) | 2.7 (2.7 to 2.7) |

## Agent

| Measure | kay |
| --- | ---: |
| Turns | 37 (37 to 37) |
| API calls | 36 (36 to 36) |
| Tool calls | 36 (36 to 36) |
| Read calls | 0 (0 to 0) |
| Write calls | 0 (0 to 0) |
| Edit calls | 0 (0 to 0) |
| Bash calls | 36 (36 to 36) |
| Glob calls | 0 (0 to 0) |
| Grep calls | 0 (0 to 0) |
| Tool calls that failed | 1 (1 to 1) |

## Docs

| Measure | kay |
| --- | ---: |
| Tool calls reading the docs | 13 (13 to 13) |
| Docs characters read | 76,020 (76,020 to 76,020) |

## Checks

| Measure | kay |
| --- | ---: |
| Checks and builds run | 6 (6 to 6) |
| Checks and builds that failed | 0 (0 to 0) |
| Check errors hit on the way | 0 (0 to 0) |

## Code

| Measure | kay |
| --- | ---: |
| Files written or changed | 28 (28 to 28) |
| Lines added, tests and styles left out | 334 (334 to 334) |
| Test lines added | 87 (87 to 87) |
| Style lines added | 15 (15 to 15) |
| Lines removed | 4 (4 to 4) |
| Packages added | 1 (1 to 1) |

## Every run

| Run | Passed | Output tokens | Input tokens, uncached | Cache write tokens | Cache read tokens | Cost (USD, API prices) | Wall time (minutes) | Turns | Tool calls | Check errors hit on the way | Lines added, tests and styles left out |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| kay 1 | yes | 18,803 | 72 | 61,930 | 1,558,695 | 1.18 | 3.0 | 37 | 36 | 0 | 334 |

## Versions and docs

- kay: bun 1.4.3, kay 1.47.0, claude 2.1.289; docs: kay 1.47.0 package (llms.txt, llms/), 22 files, 0.5 MB; packages added by an agent: @happy-dom/global-registrator

## Isolation

- Each agent ran under bwrap, which hid `~/Workspace`, `~/.claude`, `~/.cache/claude-tmp`, `~/.cache/llm-bench`, `~/.cache/ms-playwright`: the acceptance suite and reference site, other runs' sites, past Claude transcripts and any browser to test with.
- No session started an MCP server.
- Plugins installed on the machine, listed by each session at start and kept off by `--safe-mode`: cc-plugin-agents-md, cc-plugin-plugin-authoring
- No tool call left the workspace or used the network beyond package installs.
- Bash calls running python, node or another package manager despite the prompt: kay 1 (2)
- No agent changed its package.json scripts or tsconfig.json.
- Input and cache tokens summed per API call match the totals each finished session reported.

## Failed runs

