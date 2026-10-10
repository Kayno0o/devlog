# LLM benchmark, opus-sandbox

Each run is one headless Claude Code session (`claude -p --safe-mode`, no CLAUDE.md, hooks, plugins or MCP servers) building [the same site](../../spec.md) from [the same prompt](../../prompt.md) in a fresh copy of the framework's starter, with the framework's docs offline in `docs/`. A run passes when `bun run check`, `bun run build` and every test of the hidden [acceptance suite](../../acceptance/site.test.ts) pass. `check` is each starter's own script: kay's `kay check --deny-warnings` also fails on warnings, the others' (`svelte-check`, `tsc --noEmit`, `astro check`) on errors only.

Model claude-opus-5-5, effort high, Claude Code 2.1.289, runs from 2026-10-10T01:25:13.654Z to 2026-10-10T01:25:13.654Z. Every measure is the median of the runs that passed, with the lowest and highest in brackets. Input tokens, cache writes and cache reads are what the model read; output tokens, thinking included, what it wrote.

| Runs | sveltekit |
| --- | ---: |
| Passed | 1 of 1 |
| Cost of every run, failed ones included (USD) | 1.58 |
| Tokens of every run | 2,127,088 |
| Minutes of every run | 5 |

## Tokens

| Measure | sveltekit |
| --- | ---: |
| Input tokens, uncached | 76 (76 to 76) |
| Cache write tokens | 73,019 (73,019 to 73,019) |
| Cache read tokens | 2,024,416 (2,024,416 to 2,024,416) |
| Output tokens | 29,577 (29,577 to 29,577) |
| Thinking tokens, part of output | 10,783 (10,783 to 10,783) |
| All tokens | 2,127,088 (2,127,088 to 2,127,088) |
| Largest context of one call | 78,275 (78,275 to 78,275) |
| Cost (USD, API prices) | 1.58 (1.58 to 1.58) |

## Time

| Measure | sveltekit |
| --- | ---: |
| Wall time (minutes) | 4.7 (4.7 to 4.7) |
| Time waiting on the API (minutes) | 4.4 (4.4 to 4.4) |

## Agent

| Measure | sveltekit |
| --- | ---: |
| Turns | 39 (39 to 39) |
| API calls | 38 (38 to 38) |
| Tool calls | 38 (38 to 38) |
| Read calls | 0 (0 to 0) |
| Write calls | 0 (0 to 0) |
| Edit calls | 0 (0 to 0) |
| Bash calls | 38 (38 to 38) |
| Glob calls | 0 (0 to 0) |
| Grep calls | 0 (0 to 0) |
| Tool calls that failed | 3 (3 to 3) |

## Docs

| Measure | sveltekit |
| --- | ---: |
| Tool calls reading the docs | 4 (4 to 4) |
| Docs characters read | 30,531 (30,531 to 30,531) |

## Checks

| Measure | sveltekit |
| --- | ---: |
| Checks and builds run | 4 (4 to 4) |
| Checks and builds that failed | 1 (1 to 1) |
| Check errors hit on the way | 1 (1 to 1) |

## Code

| Measure | sveltekit |
| --- | ---: |
| Files written or changed | 17 (17 to 17) |
| Lines added | 592 (592 to 592) |
| Lines removed | 5 (5 to 5) |
| Packages added | 2 (2 to 2) |

## Every run

| Run | Passed | Output tokens | Input tokens, uncached | Cache write tokens | Cache read tokens | Cost (USD, API prices) | Wall time (minutes) | Turns | Tool calls | Check errors hit on the way | Lines added |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| sveltekit 1 | yes | 29,577 | 76 | 73,019 | 2,024,416 | 1.58 | 4.7 | 39 | 38 | 1 | 592 |

## Versions and docs

- sveltekit: bun 1.4.3, @sveltejs/kit 3.0.1, svelte 5.57.2, claude 2.1.289; docs: https://svelte.dev/llms.txt and the files it links, 8 files, 3.4 MB; packages added by an agent: marked, yaml

## Isolation

- Each agent ran under bwrap, which hid `~/Workspace`, `~/.claude/projects`, `~/.cache/claude-tmp`, `~/.cache/llm-bench`, `~/.cache/ms-playwright`: the acceptance suite and reference site, other runs' sites, past Claude transcripts and any browser to test with.
- No session started an MCP server.
- Plugins installed on the machine, listed by each session at start and kept off by `--safe-mode`: guards, tmux-tab, work-band, memory-preload, commit-titles, athome-scope, open-questions, agent-cap, ticket-hold, git-facts, context7, typescript-lsp, php-lsp, rust-analyzer-lsp, gopls-lsp, session-report, lua-lsp, clangd-lsp, cc-plugin-agents-md, cc-plugin-plugin-authoring
- No tool call left the workspace or used the network beyond package installs.
- Bash calls running python, node or another package manager despite the prompt: sveltekit 1 (3)
- Grading inputs an agent changed, worth reading before trusting its check: sveltekit 1 (script start)
- Input and cache tokens summed per API call match the totals each finished session reported.

## Failed runs

