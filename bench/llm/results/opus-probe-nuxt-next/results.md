# LLM benchmark, opus-probe-nuxt-next

Each run is one headless Claude Code session (`claude -p --safe-mode`, no CLAUDE.md, hooks, plugins or MCP servers) building [the same site](../../spec.md) from [the same prompt](../../prompt.md) in a fresh copy of the framework's starter, with the framework's docs offline in `docs/`. A run passes when `bun run check`, `bun run build` and every test of the hidden [acceptance suite](../../acceptance/site.test.ts) pass. `check` is each starter's own script, failing on errors only: `kay check`, `svelte-check`, `tsc --noEmit`, `astro check`, `nuxt typecheck`, `next typegen && tsc --noEmit`.

Model claude-opus-5-5, effort high, Claude Code 2.1.289, runs from 2026-10-16T17:24:46.991Z to 2026-10-16T17:32:54.338Z. Every measure is the median of the runs that passed, with the lowest and highest in brackets. Input tokens, cache writes and cache reads are what the model read; output tokens, thinking included, what it wrote.

| Runs | nuxt | next |
| --- | ---: | ---: |
| Passed | 1 of 1 | 1 of 1 |
| Cost of every run, failed ones included (USD) | 1.20 | 1.42 |
| Tokens of every run | 1,457,035 | 1,988,591 |
| Minutes of every run | 6 | 4 |

## Tokens

| Measure | nuxt | next |
| --- | ---: | ---: |
| Input tokens, uncached | 80 (80 to 80) | 78 (78 to 78) |
| Cache write tokens | 52,751 (52,751 to 52,751) | 68,534 (68,534 to 68,534) |
| Cache read tokens | 1,379,058 (1,379,058 to 1,379,058) | 1,895,193 (1,895,193 to 1,895,193) |
| Output tokens | 25,146 (25,146 to 25,146) | 24,786 (24,786 to 24,786) |
| Thinking tokens, part of output | 8,758 (8,758 to 8,758) | 8,800 (8,800 to 8,800) |
| All tokens | 1,457,035 (1,457,035 to 1,457,035) | 1,988,591 (1,988,591 to 1,988,591) |
| Largest context of one call | 58,007 (58,007 to 58,007) | 73,790 (73,790 to 73,790) |
| Cost (USD, API prices) | 1.20 (1.20 to 1.20) | 1.42 (1.42 to 1.42) |

## Time

| Measure | nuxt | next |
| --- | ---: | ---: |
| Wall time (minutes) | 5.7 (5.7 to 5.7) | 4.4 (4.4 to 4.4) |
| Time waiting on the API (minutes) | 3.6 (3.6 to 3.6) | 3.8 (3.8 to 3.8) |

## Agent

| Measure | nuxt | next |
| --- | ---: | ---: |
| Turns | 40 (40 to 40) | 40 (40 to 40) |
| API calls | 40 (40 to 40) | 39 (39 to 39) |
| Tool calls | 39 (39 to 39) | 39 (39 to 39) |
| Read calls | 0 (0 to 0) | 0 (0 to 0) |
| Write calls | 0 (0 to 0) | 0 (0 to 0) |
| Edit calls | 0 (0 to 0) | 0 (0 to 0) |
| Bash calls | 39 (39 to 39) | 39 (39 to 39) |
| Glob calls | 0 (0 to 0) | 0 (0 to 0) |
| Grep calls | 0 (0 to 0) | 0 (0 to 0) |
| Tool calls that failed | 1 (1 to 1) | 2 (2 to 2) |

## Docs

| Measure | nuxt | next |
| --- | ---: | ---: |
| Tool calls reading the docs | 5 (5 to 5) | 14 (14 to 14) |
| Docs characters read | 16,437 (16,437 to 16,437) | 86,255 (86,255 to 86,255) |

## Checks

| Measure | nuxt | next |
| --- | ---: | ---: |
| Checks and builds run | 9 (9 to 9) | 7 (7 to 7) |
| Checks and builds that failed | 0 (0 to 0) | 0 (0 to 0) |
| Check errors hit on the way | 0 (0 to 0) | 0 (0 to 0) |

## Code

| Measure | nuxt | next |
| --- | ---: | ---: |
| Files written or changed | 16 (16 to 16) | 18 (18 to 18) |
| Lines added, tests and styles left out | 418 (418 to 418) | 589 (589 to 589) |
| Test lines added | 0 (0 to 0) | 0 (0 to 0) |
| Style lines added | 20 (20 to 20) | 125 (125 to 125) |
| Lines removed | 6 (6 to 6) | 9 (9 to 9) |
| Packages added | 2 (2 to 2) | 5 (5 to 5) |

## Every run

| Run | Passed | Output tokens | Input tokens, uncached | Cache write tokens | Cache read tokens | Cost (USD, API prices) | Wall time (minutes) | Turns | Tool calls | Check errors hit on the way | Lines added, tests and styles left out |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| next 1 | yes | 24,786 | 78 | 68,534 | 1,895,193 | 1.42 | 4.4 | 40 | 39 | 0 | 589 |
| nuxt 1 | yes | 25,146 | 80 | 52,751 | 1,379,058 | 1.20 | 5.7 | 40 | 39 | 0 | 418 |

## Versions and docs

- nuxt: bun 1.4.3, nuxt 4.6.1, vue 3.5.44, claude 2.1.289; docs: https://nuxt.com/llms.txt and the pages it links, 341 files, 7.8 MB; packages added by an agent: @nuxt/content, zod
- next: bun 1.4.3, next 16.4.2, react 19.3.0, claude 2.1.289; docs: https://nextjs.org/docs/llms.txt and the Markdown of the pages it links, 306 files, 3.1 MB; packages added by an agent: gray-matter, rehype-stringify, remark-parse, remark-rehype, unified

## Isolation

- Each agent ran under bwrap, which hid `~/Workspace`, `~/.claude`, `~/.cache/claude-tmp`, `~/.cache/llm-bench`, `~/.cache/ms-playwright`: the acceptance suite and reference site, other runs' sites, past Claude transcripts and any browser to test with.
- No session started an MCP server.
- Plugins installed on the machine, listed by each session at start and kept off by `--safe-mode`: cc-plugin-agents-md, cc-plugin-plugin-authoring
- No tool call left the workspace or used the network beyond package installs.
- Bash calls running python, node or another package manager despite the prompt: nuxt 1 (5)
- No agent changed its package.json scripts or tsconfig.json.
- Input and cache tokens summed per API call match the totals each finished session reported.

## Failed runs

