# LLM benchmark, full-opus-1.27

Each run is one headless Claude Code session (`claude -p --safe-mode`, no CLAUDE.md, hooks, plugins or MCP servers) building [the same site](../../spec.md) from [the same prompt](../../prompt.md) in a fresh copy of the framework's starter, with the framework's docs offline in `docs/`. A run passes when `bun run check`, `bun run build` and every test of the hidden [acceptance suite](../../acceptance/site.test.ts) pass. `check` is each starter's own script, failing on errors only: `kay check`, `svelte-check`, `tsc --noEmit`, `astro check`, `nuxt typecheck`, `next typegen && tsc --noEmit`.

Model claude-opus-5-5, effort high, Claude Code 2.1.289, runs from 2026-10-10T02:09:07.341Z to 2026-10-16T23:09:08.495Z. Every measure is the median of the runs that passed, with the lowest and highest in brackets. Input tokens, cache writes and cache reads are what the model read; output tokens, thinking included, what it wrote.

| Runs | kay | sveltekit | solidstart | astro | nuxt |
| --- | ---: | ---: | ---: | ---: | ---: |
| Passed | 5 of 5 | 5 of 5 | 5 of 5 | 5 of 5 | 5 of 5 |
| Cost of every run, failed ones included (USD) | 4.80 | 8.03 | 10.75 | 4.23 | 7.30 |
| Tokens of every run | 5,778,560 | 11,239,584 | 18,012,361 | 3,880,737 | 9,512,917 |
| Minutes of every run | 12 | 29 | 49 | 14 | 38 |

## Tokens

| Measure | kay | sveltekit | solidstart | astro | nuxt |
| --- | ---: | ---: | ---: | ---: | ---: |
| Input tokens, uncached | 54 (44 to 60) | 78 (60 to 98) | 106 (86 to 148) | 46 (42 to 58) | 94 (58 to 110) |
| Cache write tokens | 57,197 (53,399 to 64,744) | 74,845 (68,471 to 101,361) | 86,436 (79,488 to 109,612) | 39,714 (37,884 to 53,684) | 61,720 (43,153 to 85,977) |
| Cache read tokens | 1,133,526 (853,276 to 1,311,210) | 2,061,387 (1,274,121 to 3,402,755) | 3,113,324 (2,659,132 to 5,085,482) | 632,713 (551,956 to 1,086,957) | 2,042,486 (799,136 to 2,194,336) |
| Output tokens | 12,771 (11,587 to 16,525) | 25,342 (21,124 to 36,621) | 33,878 (32,219 to 44,640) | 17,013 (15,835 to 23,862) | 28,668 (20,117 to 36,228) |
| Thinking tokens, part of output | 2,830 (2,241 to 4,369) | 8,541 (8,014 to 13,350) | 11,459 (9,682 to 15,571) | 4,278 (3,459 to 5,693) | 10,202 (7,491 to 13,794) |
| All tokens | 1,201,256 (920,720 to 1,392,391) | 2,163,663 (1,363,776 to 3,540,835) | 3,230,074 (2,779,532 to 5,239,882) | 686,994 (606,531 to 1,164,561) | 2,163,585 (862,464 to 2,280,795) |
| Largest context of one call | 61,706 (58,655 to 70,000) | 80,101 (73,727 to 106,617) | 91,692 (84,744 to 114,121) | 44,970 (43,140 to 58,940) | 66,976 (48,409 to 91,233) |
| Cost (USD, API prices) | 0.95 (0.88 to 1.11) | 1.52 (1.23 to 2.22) | 1.94 (1.86 to 2.79) | 0.78 (0.75 to 1.12) | 1.46 (0.91 to 1.80) |

## Time

| Measure | kay | sveltekit | solidstart | astro | nuxt |
| --- | ---: | ---: | ---: | ---: | ---: |
| Wall time (minutes) | 2.6 (1.9 to 2.8) | 4.5 (3.3 to 12.4) | 9.3 (6.5 to 12.9) | 2.6 (2.5 to 3.6) | 7.9 (4.3 to 9.5) |
| Time waiting on the API (minutes) | 2.4 (1.8 to 2.6) | 3.8 (3.1 to 7.2) | 5.3 (4.6 to 7.8) | 2.3 (2.1 to 3.1) | 5.6 (3.3 to 6.7) |

## Agent

| Measure | kay | sveltekit | solidstart | astro | nuxt |
| --- | ---: | ---: | ---: | ---: | ---: |
| Turns | 29 (25 to 31) | 40 (30 to 51) | 53 (45 to 74) | 24 (21 to 31) | 47 (30 to 56) |
| API calls | 27 (22 to 30) | 39 (30 to 49) | 53 (43 to 74) | 23 (21 to 29) | 47 (29 to 55) |
| Tool calls | 28 (24 to 30) | 39 (29 to 50) | 52 (44 to 73) | 23 (20 to 30) | 46 (29 to 55) |
| Read calls | 0 (0 to 6) | 0 (0 to 1) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) |
| Write calls | 0 (0 to 0) | 0 (0 to 1) | 0 (0 to 0) | 0 (0 to 1) | 0 (0 to 0) |
| Edit calls | 0 (0 to 0) | 0 (0 to 1) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) |
| Bash calls | 28 (19 to 30) | 38 (29 to 49) | 52 (44 to 73) | 23 (20 to 29) | 46 (29 to 55) |
| Glob calls | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) |
| Grep calls | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) |
| Tool calls that failed | 1 (1 to 4) | 1 (1 to 3) | 2 (1 to 3) | 2 (1 to 3) | 1 (1 to 3) |

## Docs

| Measure | kay | sveltekit | solidstart | astro | nuxt |
| --- | ---: | ---: | ---: | ---: | ---: |
| Tool calls reading the docs | 12 (10 to 13) | 10 (9 to 12) | 7 (7 to 7) | 5 (2 to 8) | 5 (4 to 6) |
| Docs characters read | 95,518 (82,893 to 116,380) | 88,892 (49,417 to 103,415) | 52,047 (25,936 to 64,104) | 29,048 (7,688 to 37,574) | 14,244 (7,889 to 21,822) |

## Checks

| Measure | kay | sveltekit | solidstart | astro | nuxt |
| --- | ---: | ---: | ---: | ---: | ---: |
| Checks and builds run | 6 (5 to 6) | 5 (4 to 6) | 8 (7 to 14) | 5 (4 to 7) | 7 (3 to 9) |
| Checks and builds that failed | 1 (0 to 4) | 1 (0 to 1) | 1 (1 to 2) | 1 (1 to 2) | 0 (0 to 0) |
| Check errors hit on the way | 1 (0 to 7) | 1 (0 to 1) | 1 (1 to 2) | 1 (1 to 2) | 0 (0 to 0) |

## Code

| Measure | kay | sveltekit | solidstart | astro | nuxt |
| --- | ---: | ---: | ---: | ---: | ---: |
| Files written or changed | 26 (25 to 27) | 16 (16 to 17) | 21 (20 to 22) | 14 (11 to 14) | 17 (15 to 19) |
| Lines added, tests and styles left out | 348 (333 to 360) | 472 (455 to 518) | 537 (523 to 549) | 463 (440 to 491) | 444 (437 to 476) |
| Test lines added | 76 (63 to 88) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) |
| Style lines added | 0 (0 to 0) | 99 (87 to 148) | 77 (53 to 137) | 113 (103 to 168) | 83 (26 to 135) |
| Lines removed | 3 (3 to 5) | 5 (4 to 5) | 117 (96 to 121) | 15 (13 to 15) | 5 (5 to 5) |
| Packages added | 1 (1 to 1) | 2 (2 to 2) | 2 (2 to 2) | 0 (0 to 1) | 1 (1 to 2) |

## Every run

| Run | Passed | Output tokens | Input tokens, uncached | Cache write tokens | Cache read tokens | Cost (USD, API prices) | Wall time (minutes) | Turns | Tool calls | Check errors hit on the way | Lines added, tests and styles left out |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| astro 1 | yes | 23,862 | 58 | 53,684 | 1,086,957 | 1.12 | 3.6 | 31 | 30 | 2 | 440 |
| astro 2 | yes | 15,835 | 46 | 38,400 | 632,713 | 0.75 | 2.5 | 24 | 23 | 2 | 452 |
| astro 3 | yes | 16,649 | 42 | 37,884 | 551,956 | 0.75 | 2.5 | 21 | 20 | 1 | 463 |
| astro 4 | yes | 17,119 | 48 | 43,335 | 707,074 | 0.83 | 2.6 | 25 | 24 | 1 | 491 |
| astro 5 | yes | 17,013 | 44 | 39,714 | 598,304 | 0.78 | 2.8 | 22 | 21 | 1 | 482 |
| kay 1 | yes | 12,771 | 60 | 57,197 | 1,188,231 | 0.95 | 2.3 | 31 | 30 | 7 | 348 |
| kay 2 | yes | 12,390 | 44 | 64,744 | 928,756 | 0.95 | 2.6 | 26 | 25 | 1 | 356 |
| kay 3 | yes | 16,525 | 54 | 64,602 | 1,311,210 | 1.11 | 2.8 | 30 | 29 | 1 | 360 |
| kay 4 | yes | 11,587 | 54 | 56,089 | 1,133,526 | 0.91 | 1.9 | 29 | 28 | 0 | 338 |
| kay 5 | yes | 13,997 | 48 | 53,399 | 853,276 | 0.88 | 2.7 | 25 | 24 | 1 | 333 |
| nuxt 1 | yes | 27,229 | 110 | 59,120 | 2,194,336 | 1.46 | 7.9 | 56 | 55 | 0 | 444 |
| nuxt 2 | yes | 35,028 | 94 | 85,977 | 2,042,486 | 1.80 | 7.5 | 47 | 46 | 0 | 476 |
| nuxt 3 | yes | 36,228 | 100 | 68,247 | 2,087,501 | 1.69 | 9.5 | 50 | 49 | 0 | 437 |
| nuxt 4 | yes | 28,668 | 94 | 61,720 | 1,923,515 | 1.45 | 8.6 | 47 | 46 | 0 | 465 |
| nuxt 5 | yes | 20,117 | 58 | 43,153 | 799,136 | 0.91 | 4.3 | 30 | 29 | 0 | 441 |
| solidstart 1 | yes | 32,219 | 104 | 84,427 | 3,113,324 | 1.94 | 9.3 | 53 | 52 | 1 | 524 |
| solidstart 2 | yes | 39,746 | 124 | 89,069 | 3,768,584 | 2.26 | 12.3 | 63 | 62 | 1 | 523 |
| solidstart 3 | yes | 33,744 | 106 | 79,488 | 2,752,012 | 1.86 | 8.3 | 53 | 52 | 1 | 543 |
| solidstart 4 | yes | 44,640 | 148 | 109,612 | 5,085,482 | 2.79 | 12.9 | 74 | 73 | 2 | 549 |
| solidstart 5 | yes | 33,878 | 86 | 86,436 | 2,659,132 | 1.90 | 6.5 | 45 | 44 | 1 | 537 |
| sveltekit 1 | yes | 29,418 | 78 | 71,664 | 1,892,847 | 1.54 | 5.0 | 40 | 39 | 0 | 462 |
| sveltekit 2 | yes | 21,124 | 60 | 68,471 | 1,274,121 | 1.23 | 3.3 | 30 | 29 | 1 | 455 |
| sveltekit 3 | yes | 24,210 | 74 | 77,992 | 2,061,387 | 1.52 | 4.0 | 39 | 38 | 1 | 484 |
| sveltekit 4 | yes | 36,621 | 98 | 101,361 | 3,402,755 | 2.22 | 12.4 | 51 | 50 | 0 | 518 |
| sveltekit 5 | yes | 25,342 | 82 | 74,845 | 2,077,034 | 1.52 | 4.5 | 42 | 41 | 1 | 472 |

## Versions and docs

- kay: bun 1.4.4, kay 1.27.0, claude 2.1.289; docs: kay 1.27.0 package (llms.txt, llms/), 18 files, 0.2 MB; packages added by an agent: @happy-dom/global-registrator
- sveltekit: bun 1.4.3, @sveltejs/kit 3.0.1, svelte 5.57.2, claude 2.1.289; docs: https://svelte.dev/llms.txt and the files it links, 8 files, 3.4 MB; packages added by an agent: marked, yaml
- solidstart: bun 1.4.3, @solidjs/start 2.0.6, solid-js 1.9.17, claude 2.1.289; docs: https://docs.solidjs.com/llms.txt and the pages it links, 272 files, 0.8 MB; packages added by an agent: marked, yaml
- astro: bun 1.4.3, astro 7.3.8, claude 2.1.289; docs: https://github.com/withastro/docs src/content/docs/en at bf9e538, 424 files, 3.0 MB; packages added by an agent: @types/node
- nuxt: bun 1.4.3, nuxt 4.6.1, vue 3.5.44, claude 2.1.289; docs: https://nuxt.com/llms.txt and the pages it links, 341 files, 7.8 MB; packages added by an agent: @nuxt/content, h3

## Isolation

- Each agent ran under bwrap, which hid `~/Workspace`, `~/.claude/projects`, `~/.cache/claude-tmp`, `~/.cache/llm-bench`, `~/.cache/ms-playwright`, `~/.claude`: the acceptance suite and reference site, other runs' sites, past Claude transcripts and any browser to test with.
- No session started an MCP server.
- Plugins installed on the machine, listed by each session at start and kept off by `--safe-mode`: guards, tmux-tab, work-band, memory-preload, commit-titles, athome-scope, open-questions, agent-cap, ticket-hold, git-facts, context7, typescript-lsp, php-lsp, rust-analyzer-lsp, gopls-lsp, session-report, lua-lsp, clangd-lsp, cc-plugin-agents-md, cc-plugin-plugin-authoring
- No tool call left the workspace or used the network beyond package installs.
- Bash calls running python, node or another package manager despite the prompt: astro 3 (3), nuxt 2 (12), kay 2 (1), nuxt 1 (4), nuxt 3 (9), nuxt 4 (16), sveltekit 5 (2), solidstart 4 (11), nuxt 5 (1), solidstart 2 (7), kay 5 (1), sveltekit 4 (3), solidstart 3 (6), astro 2 (2), solidstart 5 (4), kay 1 (2), solidstart 1 (6), sveltekit 1 (3), astro 4 (1), sveltekit 3 (1), kay 4 (1), kay 3 (2), astro 5 (2), astro 1 (2)
- Grading inputs an agent changed, worth reading before trusting its check: sveltekit 2 (script start); sveltekit 5 (script start); sveltekit 4 (script start); sveltekit 1 (script start); sveltekit 3 (script start)
- Input and cache tokens summed per API call match the totals each finished session reported.

## Failed runs

