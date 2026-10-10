# LLM benchmark, opus-sandbox

Each run is one headless Claude Code session (`claude -p --safe-mode`, no CLAUDE.md, hooks, plugins or MCP servers) building [the same site](../../spec.md) from [the same prompt](../../prompt.md) in a fresh copy of the framework's starter, with the framework's docs offline in `docs/`. A run passes when `bun run check`, `bun run build` and every test of the hidden [acceptance suite](../../acceptance/site.test.ts) pass. `check` is each starter's own script: kay's `kay check --deny-warnings` also fails on warnings, the others' (`svelte-check`, `tsc --noEmit`, `astro check`) on errors only.

Model claude-opus-5-5, effort high, Claude Code 2.1.289, runs from 2026-10-10T01:25:13.654Z to 2026-10-10T01:42:04.887Z. Every measure is the median of the runs that passed, with the lowest and highest in brackets. Input tokens, cache writes and cache reads are what the model read; output tokens, thinking included, what it wrote.

| Runs | kay | sveltekit | astro |
| --- | ---: | ---: | ---: |
| Passed | 1 of 1 | 1 of 1 | 1 of 1 |
| Cost of every run, failed ones included (USD) | 1.54 | 1.58 | 1.05 |
| Tokens of every run | 2,452,362 | 2,127,088 | 1,247,251 |
| Minutes of every run | 3 | 5 | 4 |

## Tokens

| Measure | kay | sveltekit | astro |
| --- | ---: | ---: | ---: |
| Input tokens, uncached | 70 (70 to 70) | 76 (76 to 76) | 74 (74 to 74) |
| Cache write tokens | 89,934 (89,934 to 89,934) | 73,019 (73,019 to 73,019) | 45,555 (45,555 to 45,555) |
| Cache read tokens | 2,344,736 (2,344,736 to 2,344,736) | 2,024,416 (2,024,416 to 2,024,416) | 1,179,100 (1,179,100 to 1,179,100) |
| Output tokens | 17,622 (17,622 to 17,622) | 29,577 (29,577 to 29,577) | 22,522 (22,522 to 22,522) |
| Thinking tokens, part of output | 5,777 (5,777 to 5,777) | 10,783 (10,783 to 10,783) | 5,925 (5,925 to 5,925) |
| All tokens | 2,452,362 (2,452,362 to 2,452,362) | 2,127,088 (2,127,088 to 2,127,088) | 1,247,251 (1,247,251 to 1,247,251) |
| Largest context of one call | 95,190 (95,190 to 95,190) | 78,275 (78,275 to 78,275) | 50,811 (50,811 to 50,811) |
| Cost (USD, API prices) | 1.54 (1.54 to 1.54) | 1.58 (1.58 to 1.58) | 1.05 (1.05 to 1.05) |

## Time

| Measure | kay | sveltekit | astro |
| --- | ---: | ---: | ---: |
| Wall time (minutes) | 3.0 (3.0 to 3.0) | 4.7 (4.7 to 4.7) | 4.5 (4.5 to 4.5) |
| Time waiting on the API (minutes) | 2.8 (2.8 to 2.8) | 4.4 (4.4 to 4.4) | 3.8 (3.8 to 3.8) |

## Agent

| Measure | kay | sveltekit | astro |
| --- | ---: | ---: | ---: |
| Turns | 36 (36 to 36) | 39 (39 to 39) | 37 (37 to 37) |
| API calls | 35 (35 to 35) | 38 (38 to 38) | 37 (37 to 37) |
| Tool calls | 35 (35 to 35) | 38 (38 to 38) | 36 (36 to 36) |
| Read calls | 2 (2 to 2) | 0 (0 to 0) | 0 (0 to 0) |
| Write calls | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) |
| Edit calls | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) |
| Bash calls | 33 (33 to 33) | 38 (38 to 38) | 36 (36 to 36) |
| Glob calls | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) |
| Grep calls | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) |
| Tool calls that failed | 1 (1 to 1) | 3 (3 to 3) | 2 (2 to 2) |

## Docs

| Measure | kay | sveltekit | astro |
| --- | ---: | ---: | ---: |
| Tool calls reading the docs | 8 (8 to 8) | 4 (4 to 4) | 5 (5 to 5) |
| Docs characters read | 67,277 (67,277 to 67,277) | 30,531 (30,531 to 30,531) | 19,886 (19,886 to 19,886) |

## Checks

| Measure | kay | sveltekit | astro |
| --- | ---: | ---: | ---: |
| Checks and builds run | 7 (7 to 7) | 4 (4 to 4) | 12 (12 to 12) |
| Checks and builds that failed | 1 (1 to 1) | 1 (1 to 1) | 2 (2 to 2) |
| Check errors hit on the way | 1 (1 to 1) | 1 (1 to 1) | 2 (2 to 2) |

## Code

| Measure | kay | sveltekit | astro |
| --- | ---: | ---: | ---: |
| Files written or changed | 19 (19 to 19) | 17 (17 to 17) | 12 (12 to 12) |
| Lines added | 342 (342 to 342) | 592 (592 to 592) | 515 (515 to 515) |
| Lines removed | 6 (6 to 6) | 5 (5 to 5) | 15 (15 to 15) |
| Packages added | 1 (1 to 1) | 2 (2 to 2) | 0 (0 to 0) |

## Every run

| Run | Passed | Output tokens | Input tokens, uncached | Cache write tokens | Cache read tokens | Cost (USD, API prices) | Wall time (minutes) | Turns | Tool calls | Check errors hit on the way | Lines added |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| astro 1 | yes | 22,522 | 74 | 45,555 | 1,179,100 | 1.05 | 4.5 | 37 | 36 | 2 | 515 |
| kay 1 | yes | 17,622 | 70 | 89,934 | 2,344,736 | 1.54 | 3.0 | 36 | 35 | 1 | 342 |
| sveltekit 1 | yes | 29,577 | 76 | 73,019 | 2,024,416 | 1.58 | 4.7 | 39 | 38 | 1 | 592 |

## Versions and docs

- kay: bun 1.4.3, kay 1.17.7, claude 2.1.289; docs: kay 1.17.7 package (llms.txt, llms/), 18 files, 0.2 MB; packages added by an agent: @happy-dom/global-registrator
- sveltekit: bun 1.4.3, @sveltejs/kit 3.0.1, svelte 5.57.2, claude 2.1.289; docs: https://svelte.dev/llms.txt and the files it links, 8 files, 3.4 MB; packages added by an agent: marked, yaml
- astro: bun 1.4.3, astro 7.3.8, claude 2.1.289; docs: https://github.com/withastro/docs src/content/docs/en at bf9e538, 424 files, 3.0 MB; packages added by an agent: none

## Isolation

- Each agent ran under bwrap, which hid `~/Workspace`, `~/.claude/projects`, `~/.cache/claude-tmp`, `~/.cache/llm-bench`, `~/.cache/ms-playwright`: the acceptance suite and reference site, other runs' sites, past Claude transcripts and any browser to test with.
- No session started an MCP server.
- Plugins installed on the machine, listed by each session at start and kept off by `--safe-mode`: guards, tmux-tab, work-band, memory-preload, commit-titles, athome-scope, open-questions, agent-cap, ticket-hold, git-facts, context7, typescript-lsp, php-lsp, rust-analyzer-lsp, gopls-lsp, session-report, lua-lsp, clangd-lsp, cc-plugin-agents-md, cc-plugin-plugin-authoring
- No tool call left the workspace or used the network beyond package installs.
- Bash calls running python, node or another package manager despite the prompt: kay 1 (1), sveltekit 1 (3), astro 1 (4)
- Grading inputs an agent changed, worth reading before trusting its check: kay 1 (script test); sveltekit 1 (script start)
- Input and cache tokens summed per API call match the totals each finished session reported.

## Failed runs

