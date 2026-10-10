# LLM benchmark, opus-probe-2

Each run is one headless Claude Code session (`claude -p --safe-mode`, no CLAUDE.md, hooks, plugins or MCP servers) building [the same site](../../spec.md) from [the same prompt](../../prompt.md) in a fresh copy of the framework's starter, with the framework's docs offline in `docs/`. A run passes when `bun run check`, `bun run build` and every test of the hidden [acceptance suite](../../acceptance/site.test.ts) pass. `check` is each starter's own script: kay's `kay check --deny-warnings` also fails on warnings, the others' (`svelte-check`, `tsc --noEmit`, `astro check`) on errors only.

Model claude-opus-5-5, effort high, Claude Code 2.1.289, runs from 2026-10-10T01:18:20.215Z to 2026-10-10T01:18:20.215Z. Every measure is the median of the runs that passed, with the lowest and highest in brackets. Input tokens, cache writes and cache reads are what the model read; output tokens, thinking included, what it wrote.

| Runs | kay |
| --- | ---: |
| Passed | 1 of 1 |
| Cost of every run, failed ones included (USD) | 0.83 |
| Tokens of every run | 911,429 |
| Minutes of every run | 2 |

## Tokens

| Measure | kay |
| --- | ---: |
| Input tokens, uncached | 50 (50 to 50) |
| Cache write tokens | 50,014 (50,014 to 50,014) |
| Cache read tokens | 848,356 (848,356 to 848,356) |
| Output tokens | 13,009 (13,009 to 13,009) |
| Thinking tokens, part of output | 2,632 (2,632 to 2,632) |
| All tokens | 911,429 (911,429 to 911,429) |
| Largest context of one call | 55,270 (55,270 to 55,270) |
| Cost (USD, API prices) | 0.83 (0.83 to 0.83) |

## Time

| Measure | kay |
| --- | ---: |
| Wall time (minutes) | 2.4 (2.4 to 2.4) |
| Time waiting on the API (minutes) | 2.2 (2.2 to 2.2) |

## Agent

| Measure | kay |
| --- | ---: |
| Turns | 25 (25 to 25) |
| API calls | 25 (25 to 25) |
| Tool calls | 24 (24 to 24) |
| Read calls | 0 (0 to 0) |
| Write calls | 0 (0 to 0) |
| Edit calls | 0 (0 to 0) |
| Bash calls | 24 (24 to 24) |
| Glob calls | 0 (0 to 0) |
| Grep calls | 0 (0 to 0) |
| Tool calls that failed | 1 (1 to 1) |

## Docs

| Measure | kay |
| --- | ---: |
| Tool calls reading the docs | 12 (12 to 12) |
| Docs characters read | 75,454 (75,454 to 75,454) |

## Checks

| Measure | kay |
| --- | ---: |
| Checks and builds run | 5 (5 to 5) |
| Checks and builds that failed | 0 (0 to 0) |
| Check errors hit on the way | 0 (0 to 0) |

## Code

| Measure | kay |
| --- | ---: |
| Files written or changed | 24 (24 to 24) |
| Lines added | 346 (346 to 346) |
| Lines removed | 5 (5 to 5) |
| Packages added | 0 (0 to 0) |

## Every run

| Run | Passed | Output tokens | Input tokens, uncached | Cache write tokens | Cache read tokens | Cost (USD, API prices) | Wall time (minutes) | Turns | Tool calls | Check errors hit on the way | Lines added |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| kay 1 | yes | 13,009 | 50 | 50,014 | 848,356 | 0.83 | 2.4 | 25 | 24 | 0 | 346 |

## Versions and docs

- kay: bun 1.4.3, kay 1.17.7, claude 2.1.289; docs: kay 1.17.7 package (llms.txt, llms/), 18 files, 0.2 MB; packages added by an agent: none

## Isolation

- No session started an MCP server.
- Plugins installed on the machine, listed by each session at start and kept off by `--safe-mode`: guards, tmux-tab, work-band, memory-preload, commit-titles, athome-scope, open-questions, agent-cap, ticket-hold, git-facts, context7, typescript-lsp, php-lsp, rust-analyzer-lsp, gopls-lsp, session-report, lua-lsp, clangd-lsp, cc-plugin-agents-md, cc-plugin-plugin-authoring
- Tool calls outside the workspace or on the network: kay 1: `Bash: grep -n -i "browser\|chrom\|playwright" docs/llms/testing.md | head -20; which chromium chromi...`, `Bash: ls ~/.cache/ms-playwright/chromium-1234/*/; cat > e2e-tmp.ts <<'EOF'...`
- Bash calls running python, node or another package manager despite the prompt: kay 1 (2)
- No agent changed its package.json scripts or tsconfig.json.
- Input and cache tokens summed per API call match the totals each finished session reported.

## Failed runs

