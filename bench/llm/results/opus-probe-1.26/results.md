# LLM benchmark, opus-probe-1.26

Each run is one headless Claude Code session (`claude -p --safe-mode`, no CLAUDE.md, hooks, plugins or MCP servers) building [the same site](../../spec.md) from [the same prompt](../../prompt.md) in a fresh copy of the framework's starter, with the framework's docs offline in `docs/`. A run passes when `bun run check`, `bun run build` and every test of the hidden [acceptance suite](../../acceptance/site.test.ts) pass. `check` is each starter's own script: kay's `kay check --deny-warnings` also fails on warnings, the others' (`svelte-check`, `tsc --noEmit`, `astro check`) on errors only.

Model claude-opus-5-5, effort high, Claude Code 2.1.289, runs from 2026-10-10T16:40:24.286Z to 2026-10-10T16:40:24.286Z. Every measure is the median of the runs that passed, with the lowest and highest in brackets. Input tokens, cache writes and cache reads are what the model read; output tokens, thinking included, what it wrote.

| Runs | kay |
| --- | ---: |
| Passed | 1 of 1 |
| Cost of every run, failed ones included (USD) | 1.71 |
| Tokens of every run | 2,708,778 |
| Minutes of every run | 5 |

## Tokens

| Measure | kay |
| --- | ---: |
| Input tokens, uncached | 82 (82 to 82) |
| Cache write tokens | 91,004 (91,004 to 91,004) |
| Cache read tokens | 2,594,333 (2,594,333 to 2,594,333) |
| Output tokens | 23,359 (23,359 to 23,359) |
| Thinking tokens, part of output | 7,420 (7,420 to 7,420) |
| All tokens | 2,708,778 (2,708,778 to 2,708,778) |
| Largest context of one call | 91,006 (91,006 to 91,006) |
| Cost (USD, API prices) | 1.71 (1.71 to 1.71) |

## Time

| Measure | kay |
| --- | ---: |
| Wall time (minutes) | 4.8 (4.8 to 4.8) |
| Time waiting on the API (minutes) | 4.6 (4.6 to 4.6) |

## Agent

| Measure | kay |
| --- | ---: |
| Turns | 44 (44 to 44) |
| API calls | 41 (41 to 41) |
| Tool calls | 43 (43 to 43) |
| Read calls | 0 (0 to 0) |
| Write calls | 0 (0 to 0) |
| Edit calls | 0 (0 to 0) |
| Bash calls | 43 (43 to 43) |
| Glob calls | 0 (0 to 0) |
| Grep calls | 0 (0 to 0) |
| Tool calls that failed | 1 (1 to 1) |

## Docs

| Measure | kay |
| --- | ---: |
| Tool calls reading the docs | 13 (13 to 13) |
| Docs characters read | 139,949 (139,949 to 139,949) |

## Checks

| Measure | kay |
| --- | ---: |
| Checks and builds run | 8 (8 to 8) |
| Checks and builds that failed | 1 (1 to 1) |
| Check errors hit on the way | 1 (1 to 1) |

## Code

| Measure | kay |
| --- | ---: |
| Files written or changed | 27 (27 to 27) |
| Lines added, tests and styles left out | 360 (360 to 360) |
| Test lines added | 87 (87 to 87) |
| Style lines added | 0 (0 to 0) |
| Lines removed | 7 (7 to 7) |
| Packages added | 1 (1 to 1) |

## Every run

| Run | Passed | Output tokens | Input tokens, uncached | Cache write tokens | Cache read tokens | Cost (USD, API prices) | Wall time (minutes) | Turns | Tool calls | Check errors hit on the way | Lines added, tests and styles left out |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| kay 1 | yes | 23,359 | 82 | 91,004 | 2,594,333 | 1.71 | 4.8 | 44 | 43 | 1 | 360 |

## Versions and docs

- kay: bun 1.4.3, kay 1.26.0, claude 2.1.289; docs: kay 1.26.0 package (llms.txt, llms/), 18 files, 0.2 MB; packages added by an agent: @happy-dom/global-registrator

## Isolation

- Each agent ran under bwrap, which hid `~/Workspace`, `~/.claude/projects`, `~/.cache/claude-tmp`, `~/.cache/llm-bench`, `~/.cache/ms-playwright`: the acceptance suite and reference site, other runs' sites, past Claude transcripts and any browser to test with.
- No session started an MCP server.
- Plugins installed on the machine, listed by each session at start and kept off by `--safe-mode`: guards, tmux-tab, work-band, memory-preload, commit-titles, athome-scope, open-questions, agent-cap, ticket-hold, git-facts, context7, typescript-lsp, php-lsp, rust-analyzer-lsp, gopls-lsp, session-report, lua-lsp, clangd-lsp, cc-plugin-agents-md, cc-plugin-plugin-authoring
- No tool call left the workspace or used the network beyond package installs.
- Bash calls running python, node or another package manager despite the prompt: kay 1 (3)
- Grading inputs an agent changed, worth reading before trusting its check: kay 1 (script test)
- Input and cache tokens summed per API call match the totals each finished session reported.

## Failed runs

