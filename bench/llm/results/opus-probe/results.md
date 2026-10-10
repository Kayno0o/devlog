# LLM benchmark, opus-probe

Each run is one headless Claude Code session (`claude -p --safe-mode`, no CLAUDE.md, hooks, plugins or MCP servers) building [the same site](../../spec.md) from [the same prompt](../../prompt.md) in a fresh copy of the framework's starter, with the framework's docs offline in `docs/`. A run passes when `bun run check`, `bun run build` and every test of the hidden [acceptance suite](../../acceptance/site.test.ts) pass. `check` is each starter's own script: kay's `kay check --deny-warnings` also fails on warnings, the others' (`svelte-check`, `tsc --noEmit`, `astro check`) on errors only.

Model claude-opus-5-5, effort high, Claude Code 2.1.289, runs from 2026-10-10T00:43:27.240Z to 2026-10-10T00:55:21.475Z. Every measure is the median of the runs that passed, with the lowest and highest in brackets. Input tokens, cache writes and cache reads are what the model read; output tokens, thinking included, what it wrote.

| Runs | kay | sveltekit | astro |
| --- | ---: | ---: | ---: |
| Passed | 1 of 1 | 1 of 1 | 1 of 1 |
| Cost of every run, failed ones included (USD) | 0.93 | 1.27 | 0.79 |
| Tokens of every run | 956,535 | 1,653,651 | 655,907 |
| Minutes of every run | 2 | 4 | 3 |

## Tokens

| Measure | kay | sveltekit | astro |
| --- | ---: | ---: | ---: |
| Input tokens, uncached | 42 (42 to 42) | 70 (70 to 70) | 44 (44 to 44) |
| Cache write tokens | 60,793 (60,793 to 60,793) | 66,092 (66,092 to 66,092) | 38,189 (38,189 to 38,189) |
| Cache read tokens | 882,374 (882,374 to 882,374) | 1,565,875 (1,565,875 to 1,565,875) | 599,234 (599,234 to 599,234) |
| Output tokens | 13,326 (13,326 to 13,326) | 21,614 (21,614 to 21,614) | 18,440 (18,440 to 18,440) |
| Thinking tokens, part of output | 2,865 (2,865 to 2,865) | 4,980 (4,980 to 4,980) | 3,362 (3,362 to 3,362) |
| All tokens | 956,535 (956,535 to 956,535) | 1,653,651 (1,653,651 to 1,653,651) | 655,907 (655,907 to 655,907) |
| Largest context of one call | 65,302 (65,302 to 65,302) | 71,348 (71,348 to 71,348) | 43,445 (43,445 to 43,445) |
| Cost (USD, API prices) | 0.93 (0.93 to 0.93) | 1.27 (1.27 to 1.27) | 0.79 (0.79 to 0.79) |

## Time

| Measure | kay | sveltekit | astro |
| --- | ---: | ---: | ---: |
| Wall time (minutes) | 2.2 (2.2 to 2.2) | 4.0 (4.0 to 4.0) | 3.0 (3.0 to 3.0) |
| Time waiting on the API (minutes) | 1.9 (1.9 to 1.9) | 3.2 (3.2 to 3.2) | 2.6 (2.6 to 2.6) |

## Agent

| Measure | kay | sveltekit | astro |
| --- | ---: | ---: | ---: |
| Turns | 25 (25 to 25) | 35 (35 to 35) | 24 (24 to 24) |
| API calls | 21 (21 to 21) | 35 (35 to 35) | 22 (22 to 22) |
| Tool calls | 24 (24 to 24) | 34 (34 to 34) | 23 (23 to 23) |
| Read calls | 4 (4 to 4) | 1 (1 to 1) | 0 (0 to 0) |
| Write calls | 0 (0 to 0) | 0 (0 to 0) | 1 (1 to 1) |
| Edit calls | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) |
| Bash calls | 20 (20 to 20) | 33 (33 to 33) | 22 (22 to 22) |
| Glob calls | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) |
| Grep calls | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) |
| Tool calls that failed | 1 (1 to 1) | 4 (4 to 4) | 3 (3 to 3) |

## Docs

| Measure | kay | sveltekit | astro |
| --- | ---: | ---: | ---: |
| Tool calls reading the docs | 10 (10 to 10) | 10 (10 to 10) | 2 (2 to 2) |
| Docs characters read | 99,583 (99,583 to 99,583) | 45,844 (45,844 to 45,844) | 10,335 (10,335 to 10,335) |

## Checks

| Measure | kay | sveltekit | astro |
| --- | ---: | ---: | ---: |
| Checks and builds run | 5 (5 to 5) | 4 (4 to 4) | 5 (5 to 5) |
| Checks and builds that failed | 1 (1 to 1) | 0 (0 to 0) | 2 (2 to 2) |
| Check errors hit on the way | 1 (1 to 1) | 0 (0 to 0) | 2 (2 to 2) |

## Code

| Measure | kay | sveltekit | astro |
| --- | ---: | ---: | ---: |
| Files written or changed | 25 (25 to 25) | 16 (16 to 16) | 11 (11 to 11) |
| Lines added | 431 (431 to 431) | 493 (493 to 493) | 570 (570 to 570) |
| Lines removed | 3 (3 to 3) | 4 (4 to 4) | 13 (13 to 13) |
| Packages added | 1 (1 to 1) | 2 (2 to 2) | 0 (0 to 0) |

## Every run

| Run | Passed | Output tokens | Input tokens, uncached | Cache write tokens | Cache read tokens | Cost (USD, API prices) | Wall time (minutes) | Turns | Tool calls | Check errors hit on the way | Lines added |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| astro 1 | yes | 18,440 | 44 | 38,189 | 599,234 | 0.79 | 3.0 | 24 | 23 | 2 | 570 |
| kay 1 | yes | 13,326 | 42 | 60,793 | 882,374 | 0.93 | 2.2 | 25 | 24 | 1 | 431 |
| sveltekit 1 | yes | 21,614 | 70 | 66,092 | 1,565,875 | 1.27 | 4.0 | 35 | 34 | 0 | 493 |

## Versions and docs

- kay: bun 1.4.3, kay 1.17.4, claude 2.1.289; docs: kay 1.17.4 package (llms.txt, llms/), 18 files, 0.2 MB; packages added by an agent: @happy-dom/global-registrator
- sveltekit: bun 1.4.3, @sveltejs/kit 3.0.1, svelte 5.57.2, claude 2.1.289; docs: https://svelte.dev/llms.txt and the files it links, 8 files, 3.4 MB; packages added by an agent: marked, yaml
- astro: bun 1.4.3, astro 7.3.8, claude 2.1.289; docs: https://github.com/withastro/docs src/content/docs/en at bf9e538, 424 files, 3.0 MB; packages added by an agent: none

## Isolation

- No session started an MCP server.
- Plugins installed on the machine, listed by each session at start and kept off by `--safe-mode`: guards, tmux-tab, work-band, memory-preload, commit-titles, athome-scope, open-questions, agent-cap, ticket-hold, git-facts, context7, typescript-lsp, php-lsp, rust-analyzer-lsp, gopls-lsp, session-report, lua-lsp, clangd-lsp, cc-plugin-agents-md, cc-plugin-plugin-authoring
- Tool calls outside the workspace or on the network: sveltekit 1: `Bash: which chromium chromium-browser google-chrome firefox 2>/dev/null; ls ~/.cache/ms-playwright 2...`, `Bash: cd /home/kaynooo/.cache/llm-bench/opus-probe/sveltekit-1/site; ls ~/.cache/ms-playwright/chrom...`. astro 1: `Bash: cd /home/kaynooo/.cache/llm-bench/opus-probe/astro-1/site...`, `Bash: cp package.json /tmp/pkg.bak && cp bun.lock /tmp/lock.bak && bun add -d playwright-core 2>&1 |...`
- Bash calls running python, node or another package manager despite the prompt: kay 1 (1), sveltekit 1 (1), astro 1 (1)
- Grading inputs an agent changed, worth reading before trusting its check: sveltekit 1 (script start)
- Input and cache tokens summed per API call match the totals each finished session reported.

## Failed runs

