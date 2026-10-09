# LLM benchmark, smoke-2

Each run is one headless Claude Code session (`claude -p --safe-mode`, no CLAUDE.md, hooks, plugins or MCP servers) building [the same site](../../spec.md) from [the same prompt](../../prompt.md) in a fresh copy of the framework's starter, with the framework's docs offline in `docs/`. A run passes when `bun run check`, `bun run build` and every test of the hidden [acceptance suite](../../acceptance/site.test.ts) pass. `check` is each starter's own script: kay's `kay check --deny-warnings` also fails on warnings, the others' (`svelte-check`, `tsc --noEmit`, `astro check`) on errors only.

Model claude-sonnet-5-5, effort high, Claude Code 2.1.289, runs from 2026-10-09T23:16:57.973Z to 2026-10-09T23:24:58.807Z. Every measure is the median of the runs that passed, with the lowest and highest in brackets. Input tokens, cache writes and cache reads are what the model read; output tokens, thinking included, what it wrote.

| Runs | kay | sveltekit | solidstart | astro |
| --- | ---: | ---: | ---: | ---: |
| Passed | 1 of 1 | 1 of 1 | 1 of 1 | 1 of 1 |
| Cost of every run, failed ones included (USD) | 0.77 | 0.48 | 0.49 | 0.16 |
| Tokens of every run | 1,608,007 | 972,573 | 847,890 | 137,722 |
| Minutes of every run | 2 | 2 | 2 | 1 |

## Tokens

| Measure | kay | sveltekit | solidstart | astro |
| --- | ---: | ---: | ---: | ---: |
| Input tokens, uncached | 58 (58 to 58) | 70 (70 to 70) | 46 (46 to 46) | 16 (16 to 16) |
| Cache write tokens | 71,661 (71,661 to 71,661) | 36,883 (36,883 to 36,883) | 44,949 (44,949 to 44,949) | 17,409 (17,409 to 17,409) |
| Cache read tokens | 1,518,494 (1,518,494 to 1,518,494) | 920,768 (920,768 to 920,768) | 787,577 (787,577 to 787,577) | 113,032 (113,032 to 113,032) |
| Output tokens | 17,794 (17,794 to 17,794) | 14,852 (14,852 to 14,852) | 15,318 (15,318 to 15,318) | 7,265 (7,265 to 7,265) |
| Thinking tokens, part of output | 5,668 (5,668 to 5,668) | 3,204 (3,204 to 3,204) | 4,414 (4,414 to 4,414) | 1,140 (1,140 to 1,140) |
| All tokens | 1,608,007 (1,608,007 to 1,608,007) | 972,573 (972,573 to 972,573) | 847,890 (847,890 to 847,890) | 137,722 (137,722 to 137,722) |
| Largest context of one call | 77,042 (77,042 to 77,042) | 42,264 (42,264 to 42,264) | 50,330 (50,330 to 50,330) | 22,790 (22,790 to 22,790) |
| Cost (USD, API prices) | 0.77 (0.77 to 0.77) | 0.48 (0.48 to 0.48) | 0.49 (0.49 to 0.49) | 0.16 (0.16 to 0.16) |

## Time

| Measure | kay | sveltekit | solidstart | astro |
| --- | ---: | ---: | ---: | ---: |
| Wall time (minutes) | 2.4 (2.4 to 2.4) | 2.4 (2.4 to 2.4) | 2.2 (2.2 to 2.2) | 1.1 (1.1 to 1.1) |
| Time waiting on the API (minutes) | 2.1 (2.1 to 2.1) | 1.8 (1.8 to 1.8) | 1.7 (1.7 to 1.7) | 0.8 (0.8 to 0.8) |

## Agent

| Measure | kay | sveltekit | solidstart | astro |
| --- | ---: | ---: | ---: | ---: |
| Turns | 31 (31 to 31) | 36 (36 to 36) | 25 (25 to 25) | 10 (10 to 10) |
| API calls | 29 (29 to 29) | 35 (35 to 35) | 23 (23 to 23) | 8 (8 to 8) |
| Tool calls | 30 (30 to 30) | 35 (35 to 35) | 24 (24 to 24) | 9 (9 to 9) |
| Read calls | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 1 (1 to 1) |
| Write calls | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) |
| Edit calls | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) |
| Bash calls | 30 (30 to 30) | 35 (35 to 35) | 24 (24 to 24) | 7 (7 to 7) |
| Glob calls | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) |
| Grep calls | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 1 (1 to 1) |
| Tool calls that failed | 1 (1 to 1) | 1 (1 to 1) | 3 (3 to 3) | 0 (0 to 0) |

## Docs

| Measure | kay | sveltekit | solidstart | astro |
| --- | ---: | ---: | ---: | ---: |
| Tool calls reading the docs | 10 (10 to 10) | 9 (9 to 9) | 8 (8 to 8) | 4 (4 to 4) |
| Docs characters read | 116,877 (116,877 to 116,877) | 27,779 (27,779 to 27,779) | 50,496 (50,496 to 50,496) | 15,312 (15,312 to 15,312) |

## Checks

| Measure | kay | sveltekit | solidstart | astro |
| --- | ---: | ---: | ---: | ---: |
| Checks and builds run | 7 (7 to 7) | 5 (5 to 5) | 5 (5 to 5) | 1 (1 to 1) |
| Checks and builds that failed | 1 (1 to 1) | 0 (0 to 0) | 2 (2 to 2) | 0 (0 to 0) |
| Check errors hit on the way | 1 (1 to 1) | 0 (0 to 0) | 2 (2 to 2) | 0 (0 to 0) |

## Code

| Measure | kay | sveltekit | solidstart | astro |
| --- | ---: | ---: | ---: | ---: |
| Files written or changed | 23 (23 to 23) | 16 (16 to 16) | 16 (16 to 16) | 10 (10 to 10) |
| Lines added | 339 (339 to 339) | 379 (379 to 379) | 404 (404 to 404) | 305 (305 to 305) |
| Lines removed | 70 (70 to 70) | 4 (4 to 4) | 111 (111 to 111) | 13 (13 to 13) |
| Packages added | 1 (1 to 1) | 2 (2 to 2) | 2 (2 to 2) | 0 (0 to 0) |

## Every run

| Run | Passed | Output tokens | Input tokens, uncached | Cache write tokens | Cache read tokens | Cost (USD, API prices) | Wall time (minutes) | Turns | Tool calls | Check errors hit on the way | Lines added |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| astro 1 | yes | 7,265 | 16 | 17,409 | 113,032 | 0.16 | 1.1 | 10 | 9 | 0 | 305 |
| kay 1 | yes | 17,794 | 58 | 71,661 | 1,518,494 | 0.77 | 2.4 | 31 | 30 | 1 | 339 |
| solidstart 1 | yes | 15,318 | 46 | 44,949 | 787,577 | 0.49 | 2.2 | 25 | 24 | 2 | 404 |
| sveltekit 1 | yes | 14,852 | 70 | 36,883 | 920,768 | 0.48 | 2.4 | 36 | 35 | 0 | 379 |

## Versions and docs

- kay: bun 1.4.3, kay 1.17.0, claude 2.1.289; docs: kay 1.17.0 package (llms.txt, llms/), 17 files, 0.2 MB; packages added by an agent: @happy-dom/global-registrator
- sveltekit: bun 1.4.3, @sveltejs/kit 3.0.1, svelte 5.57.2, claude 2.1.289; docs: https://svelte.dev/llms.txt and the files it links, 8 files, 3.4 MB; packages added by an agent: marked, yaml
- solidstart: bun 1.4.3, @solidjs/start 2.0.6, solid-js 1.9.17, claude 2.1.289; docs: https://docs.solidjs.com/llms.txt and the pages it links, 272 files, 0.8 MB; packages added by an agent: marked, yaml
- astro: bun 1.4.3, astro 7.3.8, claude 2.1.289; docs: https://github.com/withastro/docs src/content/docs/en at bf9e538, 424 files, 3.0 MB; packages added by an agent: none

## Isolation

- No session started an MCP server.
- Plugins installed on the machine, listed by each session at start and kept off by `--safe-mode`: guards, tmux-tab, work-band, memory-preload, commit-titles, athome-scope, open-questions, agent-cap, ticket-hold, git-facts, context7, typescript-lsp, php-lsp, rust-analyzer-lsp, gopls-lsp, session-report, lua-lsp, clangd-lsp, cc-plugin-agents-md, cc-plugin-plugin-authoring
- Tool calls outside the workspace or on the network: solidstart 1: `Bash: python3 - <<'EOF'...`, `Bash: cp package.json /tmp/pkg.bak; cp bun.lock /tmp/lock.bak; bun add -d playwright-core 2>&1 | tai...`, `Bash: sed -i 's|chromium.launch()|chromium.launch({executablePath:"/home/kaynooo/.cache/ms-playwrigh...`
- Bash calls running python, node or another package manager despite the prompt: kay 1 (4), solidstart 1 (1), sveltekit 1 (1)
- Grading inputs an agent changed, worth reading before trusting its check: sveltekit 1 (script start)
- Input and cache tokens summed per API call match the totals each finished session reported.

## Failed runs

