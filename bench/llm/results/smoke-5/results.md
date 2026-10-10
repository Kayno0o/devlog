# LLM benchmark, smoke-5

Each run is one headless Claude Code session (`claude -p --safe-mode`, no CLAUDE.md, hooks, plugins or MCP servers) building [the same site](../../spec.md) from [the same prompt](../../prompt.md) in a fresh copy of the framework's starter, with the framework's docs offline in `docs/`. A run passes when `bun run check`, `bun run build` and every test of the hidden [acceptance suite](../../acceptance/site.test.ts) pass. `check` is each starter's own script: kay's `kay check --deny-warnings` also fails on warnings, the others' (`svelte-check`, `tsc --noEmit`, `astro check`) on errors only.

Model claude-sonnet-5-5, effort high, Claude Code 2.1.289, runs from 2026-10-10T00:37:23.241Z to 2026-10-10T00:39:43.955Z. Every measure is the median of the runs that passed, with the lowest and highest in brackets. Input tokens, cache writes and cache reads are what the model read; output tokens, thinking included, what it wrote.

| Runs | kay |
| --- | ---: |
| Passed | 2 of 3 |
| Cost of every run, failed ones included (USD) | 0.92 |
| Tokens of every run | 1,292,425 |
| Minutes of every run | 3 |

## Tokens

| Measure | kay |
| --- | ---: |
| Input tokens, uncached | 29 (28 to 30) |
| Cache write tokens | 42,917 (39,738 to 46,096) |
| Cache read tokens | 421,938 (412,432 to 431,443) |
| Output tokens | 7,746 (7,644 to 7,847) |
| Thinking tokens, part of output | 2,029 (1,964 to 2,094) |
| All tokens | 472,629 (460,047 to 485,211) |
| Largest context of one call | 48,298 (45,119 to 51,477) |
| Cost (USD, API prices) | 0.33 (0.32 to 0.35) |

## Time

| Measure | kay |
| --- | ---: |
| Wall time (minutes) | 1.0 (0.9 to 1.0) |
| Time waiting on the API (minutes) | 0.9 (0.9 to 0.9) |

## Agent

| Measure | kay |
| --- | ---: |
| Turns | 17 (16 to 17) |
| API calls | 15 (14 to 15) |
| Tool calls | 16 (15 to 16) |
| Read calls | 3 (0 to 5) |
| Write calls | 0 (0 to 0) |
| Edit calls | 0 (0 to 0) |
| Bash calls | 13 (11 to 15) |
| Glob calls | 0 (0 to 0) |
| Grep calls | 0 (0 to 0) |
| Tool calls that failed | 1 (1 to 1) |

## Docs

| Measure | kay |
| --- | ---: |
| Tool calls reading the docs | 9 (9 to 9) |
| Docs characters read | 83,065 (74,097 to 92,032) |

## Checks

| Measure | kay |
| --- | ---: |
| Checks and builds run | 3 (2 to 4) |
| Checks and builds that failed | 1 (0 to 1) |
| Check errors hit on the way | 1 (0 to 1) |

## Code

| Measure | kay |
| --- | ---: |
| Files written or changed | 22 (22 to 22) |
| Lines added | 293 (290 to 296) |
| Lines removed | 3 (3 to 3) |
| Packages added | 0 (0 to 0) |

## Every run

| Run | Passed | Output tokens | Input tokens, uncached | Cache write tokens | Cache read tokens | Cost (USD, API prices) | Wall time (minutes) | Turns | Tool calls | Check errors hit on the way | Lines added |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| kay 1 | no | 5,938 | 26 | 32,145 | 309,058 | 0.25 | 0.8 | 14 | 13 | 0 | 291 |
| kay 2 | yes | 7,847 | 30 | 39,738 | 412,432 | 0.32 | 1.0 | 16 | 15 | 0 | 296 |
| kay 3 | yes | 7,644 | 28 | 46,096 | 431,443 | 0.35 | 0.9 | 17 | 16 | 1 | 290 |

## Versions and docs

- kay: bun 1.4.3, kay 1.17.4, claude 2.1.289; docs: kay 1.17.4 package (llms.txt, llms/), 18 files, 0.2 MB; packages added by an agent: none

## Isolation

- No session started an MCP server.
- Plugins installed on the machine, listed by each session at start and kept off by `--safe-mode`: guards, tmux-tab, work-band, memory-preload, commit-titles, athome-scope, open-questions, agent-cap, ticket-hold, git-facts, context7, typescript-lsp, php-lsp, rust-analyzer-lsp, gopls-lsp, session-report, lua-lsp, clangd-lsp, cc-plugin-agents-md, cc-plugin-plugin-authoring
- No tool call left the workspace or used the network beyond package installs.
- Every agent ran its commands with bun alone.
- No agent changed its package.json scripts or tsconfig.json.
- Input and cache tokens summed per API call match the totals each finished session reported.

## Failed runs

- kay run 1: success, check ok, build ok, failing: books > lists every book by title with its author and year; book pages > /books/around-the-world-in-eighty-days shows the book; book pages > /books/dracula shows the book; book pages > /books/frankenstein shows the book; book pages > /books/moby-dick shows the book; book pages > /books/pride-and-prejudice shows the book; book pages > /books/the-picture-of-dorian-gray shows the book; book pages > /books/the-time-machine shows the book; book pages > /books/treasure-island shows the book; about > shows its text; contact > has the form; not found > /books/no-such-book answers 404 with the 404 page; not found > /no-such-page answers 404 with the 404 page
