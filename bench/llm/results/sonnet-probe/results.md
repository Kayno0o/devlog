# LLM benchmark, sonnet-probe

Each run is one headless Claude Code session (`claude -p --safe-mode`, no CLAUDE.md, hooks, plugins or MCP servers) building [the same site](../../spec.md) from [the same prompt](../../prompt.md) in a fresh copy of the framework's starter, with the framework's docs offline in `docs/`. A run passes when `bun run check`, `bun run build` and every test of the hidden [acceptance suite](../../acceptance/site.test.ts) pass. `check` is each starter's own script, failing on errors only: `kay check`, `svelte-check`, `tsc --noEmit`, `astro check`, `nuxt typecheck`, `next typegen && tsc --noEmit`.

Model claude-sonnet-5-5, effort medium, Claude Code 2.1.289, runs from 2026-10-19T13:42:01.802Z to 2026-10-19T13:57:58.189Z. Every measure is the median of the runs that passed, with the lowest and highest in brackets. Input tokens, cache writes and cache reads are what the model read; output tokens, thinking included, what it wrote.

| Runs | kay | sveltekit | solidstart | astro | nuxt | next |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Passed | 1 of 1 | 0 of 1 | 1 of 1 | 1 of 1 | 1 of 1 | 0 of 1 |
| Cost of every run, failed ones included (USD) | 0.25 | 0.44 | 0.29 | 0.13 | 0.20 | 0.13 |
| Tokens of every run | 320,465 | 877,664 | 437,518 | 100,125 | 247,907 | 110,044 |
| Minutes of every run | 2 | 2 | 2 | 1 | 3 | 2 |

## Tokens

| Measure | kay | sveltekit | solidstart | astro | nuxt | next |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Input tokens, uncached | 26 (26 to 26) | no passing run | 40 (40 to 40) | 14 (14 to 14) | 30 (30 to 30) | no passing run |
| Cache write tokens | 30,792 (30,792 to 30,792) | no passing run | 23,786 (23,786 to 23,786) | 13,658 (13,658 to 13,658) | 16,474 (16,474 to 16,474) | no passing run |
| Cache read tokens | 282,312 (282,312 to 282,312) | no passing run | 401,920 (401,920 to 401,920) | 80,407 (80,407 to 80,407) | 222,374 (222,374 to 222,374) | no passing run |
| Output tokens | 7,335 (7,335 to 7,335) | no passing run | 11,772 (11,772 to 11,772) | 6,046 (6,046 to 6,046) | 9,029 (9,029 to 9,029) | no passing run |
| Thinking tokens, part of output | 781 (781 to 781) | no passing run | 2,451 (2,451 to 2,451) | 708 (708 to 708) | 1,022 (1,022 to 1,022) | no passing run |
| All tokens | 320,465 (320,465 to 320,465) | no passing run | 437,518 (437,518 to 437,518) | 100,125 (100,125 to 100,125) | 247,907 (247,907 to 247,907) | no passing run |
| Largest context of one call | 36,173 (36,173 to 36,173) | no passing run | 29,167 (29,167 to 29,167) | 19,039 (19,039 to 19,039) | 21,855 (21,855 to 21,855) | no passing run |
| Cost (USD, API prices) | 0.25 (0.25 to 0.25) | no passing run | 0.29 (0.29 to 0.29) | 0.13 (0.13 to 0.13) | 0.20 (0.20 to 0.20) | no passing run |

## Time

| Measure | kay | sveltekit | solidstart | astro | nuxt | next |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Wall time (minutes) | 1.5 (1.5 to 1.5) | no passing run | 2.2 (2.2 to 2.2) | 1.1 (1.1 to 1.1) | 2.7 (2.7 to 2.7) | no passing run |
| Time waiting on the API (minutes) | 1.0 (1.0 to 1.0) | no passing run | 1.8 (1.8 to 1.8) | 0.8 (0.8 to 0.8) | 1.7 (1.7 to 1.7) | no passing run |

## Agent

| Measure | kay | sveltekit | solidstart | astro | nuxt | next |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Turns | 13 (13 to 13) | no passing run | 21 (21 to 21) | 7 (7 to 7) | 16 (16 to 16) | no passing run |
| API calls | 13 (13 to 13) | no passing run | 20 (20 to 20) | 7 (7 to 7) | 15 (15 to 15) | no passing run |
| Tool calls | 12 (12 to 12) | no passing run | 20 (20 to 20) | 6 (6 to 6) | 15 (15 to 15) | no passing run |
| Read calls | 0 (0 to 0) | no passing run | 1 (1 to 1) | 0 (0 to 0) | 1 (1 to 1) | no passing run |
| Write calls | 0 (0 to 0) | no passing run | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | no passing run |
| Edit calls | 0 (0 to 0) | no passing run | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | no passing run |
| Bash calls | 12 (12 to 12) | no passing run | 19 (19 to 19) | 6 (6 to 6) | 14 (14 to 14) | no passing run |
| Glob calls | 0 (0 to 0) | no passing run | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | no passing run |
| Grep calls | 0 (0 to 0) | no passing run | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | no passing run |
| Tool calls that failed | 0 (0 to 0) | no passing run | 2 (2 to 2) | 0 (0 to 0) | 2 (2 to 2) | no passing run |

## Docs

| Measure | kay | sveltekit | solidstart | astro | nuxt | next |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Tool calls reading the docs | 4 (4 to 4) | no passing run | 5 (5 to 5) | 3 (3 to 3) | 3 (3 to 3) | no passing run |
| Docs characters read | 34,029 (34,029 to 34,029) | no passing run | 11,083 (11,083 to 11,083) | 14,787 (14,787 to 14,787) | 2,710 (2,710 to 2,710) | no passing run |

## Checks

| Measure | kay | sveltekit | solidstart | astro | nuxt | next |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Checks and builds run | 4 (4 to 4) | no passing run | 3 (3 to 3) | 1 (1 to 1) | 5 (5 to 5) | no passing run |
| Checks and builds that failed | 0 (0 to 0) | no passing run | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | no passing run |
| Check errors hit on the way | 0 (0 to 0) | no passing run | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | no passing run |

## Code

| Measure | kay | sveltekit | solidstart | astro | nuxt | next |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Files written or changed | 22 (22 to 22) | no passing run | 15 (15 to 15) | 12 (12 to 12) | 14 (14 to 14) | no passing run |
| Lines added, tests and styles left out | 312 (312 to 312) | no passing run | 301 (301 to 301) | 244 (244 to 244) | 281 (281 to 281) | no passing run |
| Test lines added | 0 (0 to 0) | no passing run | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | no passing run |
| Style lines added | 0 (0 to 0) | no passing run | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | no passing run |
| Lines removed | 3 (3 to 3) | no passing run | 48 (48 to 48) | 20 (20 to 20) | 6 (6 to 6) | no passing run |
| Packages added | 0 (0 to 0) | no passing run | 2 (2 to 2) | 0 (0 to 0) | 2 (2 to 2) | no passing run |

## Every run

| Run | Passed | Output tokens | Input tokens, uncached | Cache write tokens | Cache read tokens | Cost (USD, API prices) | Wall time (minutes) | Turns | Tool calls | Check errors hit on the way | Lines added, tests and styles left out |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| astro 1 | yes | 6,046 | 14 | 13,658 | 80,407 | 0.13 | 1.1 | 7 | 6 | 0 | 244 |
| kay 1 | yes | 7,335 | 26 | 30,792 | 282,312 | 0.25 | 1.5 | 13 | 12 | 0 | 312 |
| next 1 | no | 6,660 | 16 | 11,251 | 92,117 | 0.13 | 1.6 | 8 | 7 | 0 | 333 |
| nuxt 1 | yes | 9,029 | 30 | 16,474 | 222,374 | 0.20 | 2.7 | 16 | 15 | 0 | 281 |
| solidstart 1 | yes | 11,772 | 40 | 23,786 | 401,920 | 0.29 | 2.2 | 21 | 20 | 0 | 301 |
| sveltekit 1 | no | 13,973 | 70 | 33,009 | 830,612 | 0.44 | 2.2 | 36 | 35 | 0 | 311 |

## Versions and docs

- kay: bun 1.4.3, kay 1.51.0, claude 2.1.289; docs: kay 1.51.0 package (llms.txt, llms/), 39 files, 0.6 MB; packages added by an agent: none
- sveltekit: bun 1.4.3, @sveltejs/kit 3.0.1, svelte 5.57.2, claude 2.1.289; docs: https://svelte.dev/llms.txt and the files it links, 8 files, 3.4 MB; packages added by an agent: marked, yaml
- solidstart: bun 1.4.3, @solidjs/start 2.0.6, solid-js 1.9.17, claude 2.1.289; docs: https://docs.solidjs.com/llms.txt and the pages it links, 273 files, 0.8 MB; packages added by an agent: marked, yaml
- astro: bun 1.4.3, astro 7.3.8, claude 2.1.289; docs: https://github.com/withastro/docs src/content/docs/en at ce41ff8, 426 files, 3.0 MB; packages added by an agent: none
- nuxt: bun 1.4.3, nuxt 4.6.1, vue 3.5.44, claude 2.1.289; docs: https://nuxt.com/llms.txt and the pages it links, 341 files, 7.8 MB; packages added by an agent: @nuxt/content, better-sqlite3
- next: bun 1.4.3, next 16.4.2, react 19.3.0, claude 2.1.289; docs: https://nextjs.org/docs/llms.txt and the Markdown of the pages it links, 306 files, 3.1 MB; packages added by an agent: gray-matter, marked

## Isolation

- Each agent ran under bwrap, which hid `~/Workspace`, `~/.claude`, `~/.cache/claude-tmp`, `~/.cache/llm-bench`, `~/.cache/ms-playwright`: the acceptance suite and reference site, other runs' sites, past Claude transcripts and any browser to test with.
- No session started an MCP server.
- Plugins installed on the machine, listed by each session at start and kept off by `--safe-mode`: cc-plugin-agents-md, cc-plugin-plugin-authoring
- No tool call left the workspace or used the network beyond package installs.
- Bash calls running python, node or another package manager despite the prompt: nuxt 1 (2), kay 1 (1)
- Grading inputs an agent changed, worth reading before trusting its check: sveltekit 1 (script start)
- Input and cache tokens summed per API call match the totals each finished session reported.

## Failed runs

- sveltekit run 1: success, check ok, build ok, failing: books > lists every book by title with its author and year; books > filters by tag in the browser; book pages > /books/around-the-world-in-eighty-days shows the book; book pages > /books/dracula shows the book; book pages > /books/frankenstein shows the book; book pages > /books/moby-dick shows the book; book pages > /books/pride-and-prejudice shows the book; book pages > /books/the-picture-of-dorian-gray shows the book; book pages > /books/the-time-machine shows the book; book pages > /books/treasure-island shows the book; favorites > toggle on the book page, survive a reload and show on the books list
- next run 1: success, check ok, build ok, failing: contact > validates on the server without JavaScript
