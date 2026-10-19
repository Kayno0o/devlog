# LLM benchmark, full-sonnet-medium

Each run is one headless Claude Code session (`claude -p --safe-mode`, no CLAUDE.md, hooks, plugins or MCP servers) building [the same site](../../spec.md) from [the same prompt](../../prompt.md) in a fresh copy of the framework's starter, with the framework's docs offline in `docs/`. A run passes when `bun run check`, `bun run build` and every test of the hidden [acceptance suite](../../acceptance/site.test.ts) pass. `check` is each starter's own script, failing on errors only: `kay check`, `svelte-check`, `tsc --noEmit`, `astro check`, `nuxt typecheck`, `next typegen && tsc --noEmit`.

Model claude-sonnet-5-5, effort medium, Claude Code 2.1.289, runs from 2026-10-19T14:00:30.229Z to 2026-10-19T15:05:02.220Z. Every measure is the median of the runs that passed, with the lowest and highest in brackets. Input tokens, cache writes and cache reads are what the model read; output tokens, thinking included, what it wrote.

| Runs | kay | sveltekit | solidstart | astro | nuxt | next |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Passed | 4 of 5 | 3 of 5 | 5 of 5 | 4 of 5 | 5 of 5 | 5 of 5 |
| Cost of every run, failed ones included (USD) | 1.26 | 1.87 | 1.43 | 0.61 | 0.79 | 0.80 |
| Tokens of every run | 1,972,078 | 3,460,675 | 1,919,125 | 434,356 | 867,362 | 679,309 |
| Minutes of every run | 7 | 14 | 11 | 5 | 11 | 6 |

## Tokens

| Measure | kay | sveltekit | solidstart | astro | nuxt | next |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Input tokens, uncached | 30 (26 to 40) | 58 (58 to 64) | 26 (24 to 60) | 14 (10 to 14) | 24 (16 to 32) | 14 (14 to 28) |
| Cache write tokens | 27,038 (25,652 to 30,920) | 29,257 (29,075 to 29,779) | 20,313 (20,145 to 31,937) | 11,873 (11,539 to 13,423) | 13,808 (11,868 to 14,773) | 14,995 (12,633 to 18,281) |
| Cache read tokens | 327,833 (274,532 to 453,313) | 668,438 (655,125 to 738,707) | 223,119 (185,996 to 737,486) | 74,284 (48,137 to 79,606) | 159,728 (93,878 to 240,170) | 90,317 (73,469 to 206,777) |
| Output tokens | 6,850 (6,114 to 7,432) | 12,719 (12,697 to 13,188) | 10,505 (9,579 to 15,603) | 5,795 (5,496 to 6,172) | 7,192 (6,732 to 8,421) | 7,100 (6,304 to 9,552) |
| Thinking tokens, part of output | 816 (572 to 1,051) | 2,721 (2,368 to 2,736) | 1,895 (1,420 to 3,206) | 604 (471 to 695) | 1,069 (885 to 1,358) | 917 (670 to 1,235) |
| All tokens | 362,712 (308,473 to 487,633) | 710,941 (696,977 to 781,247) | 253,937 (216,670 to 785,086) | 92,807 (65,366 to 97,349) | 180,345 (112,706 to 263,325) | 114,916 (93,131 to 233,586) |
| Largest context of one call | 32,419 (31,033 to 36,301) | 34,638 (34,456 to 35,160) | 25,694 (25,526 to 37,318) | 17,254 (16,920 to 18,804) | 19,189 (17,249 to 20,154) | 20,376 (18,014 to 23,662) |
| Cost (USD, API prices) | 0.25 (0.23 to 0.27) | 0.38 (0.37 to 0.39) | 0.23 (0.22 to 0.43) | 0.12 (0.11 to 0.13) | 0.15 (0.14 to 0.19) | 0.15 (0.14 to 0.21) |

## Time

| Measure | kay | sveltekit | solidstart | astro | nuxt | next |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Wall time (minutes) | 1.4 (1.2 to 2.0) | 3.3 (2.4 to 3.3) | 1.8 (1.5 to 3.5) | 0.9 (0.7 to 1.1) | 2.1 (1.3 to 3.1) | 1.4 (0.8 to 1.8) |
| Time waiting on the API (minutes) | 1.3 (1.1 to 1.8) | 2.0 (2.0 to 2.7) | 1.4 (1.2 to 2.5) | 0.7 (0.6 to 0.9) | 0.9 (0.8 to 1.5) | 0.7 (0.7 to 1.2) |

## Agent

| Measure | kay | sveltekit | solidstart | astro | nuxt | next |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Turns | 16 (14 to 20) | 30 (29 to 32) | 14 (12 to 31) | 7 (5 to 8) | 12 (8 to 17) | 8 (7 to 15) |
| API calls | 15 (13 to 20) | 29 (29 to 32) | 13 (12 to 30) | 7 (5 to 7) | 12 (8 to 16) | 7 (7 to 14) |
| Tool calls | 15 (13 to 19) | 29 (28 to 31) | 13 (11 to 30) | 6 (4 to 7) | 11 (7 to 16) | 7 (6 to 14) |
| Read calls | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 1) |
| Write calls | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) |
| Edit calls | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) |
| Bash calls | 15 (13 to 19) | 29 (28 to 31) | 13 (11 to 30) | 6 (4 to 7) | 11 (7 to 16) | 7 (6 to 14) |
| Glob calls | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) |
| Grep calls | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) |
| Tool calls that failed | 1 (1 to 1) | 2 (0 to 4) | 2 (0 to 4) | 0 (0 to 0) | 0 (0 to 2) | 2 (1 to 3) |

## Docs

| Measure | kay | sveltekit | solidstart | astro | nuxt | next |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Tool calls reading the docs | 5 (3 to 6) | 5 (4 to 6) | 4 (3 to 6) | 2 (2 to 3) | 2 (2 to 3) | 3 (2 to 4) |
| Docs characters read | 31,134 (28,610 to 41,454) | 12,142 (10,857 to 13,736) | 17,097 (12,475 to 22,807) | 11,174 (7,846 to 12,746) | 7,106 (6,782 to 7,507) | 7,977 (2,657 to 11,542) |

## Checks

| Measure | kay | sveltekit | solidstart | astro | nuxt | next |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Checks and builds run | 4 (2 to 5) | 4 (3 to 5) | 5 (2 to 8) | 1 (1 to 2) | 3 (2 to 7) | 2 (1 to 6) |
| Checks and builds that failed | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 1) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 1) |
| Check errors hit on the way | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 2) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 3) |

## Code

| Measure | kay | sveltekit | solidstart | astro | nuxt | next |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Files written or changed | 22 (22 to 22) | 16 (16 to 16) | 17 (15 to 19) | 10 (9 to 11) | 15 (14 to 16) | 17 (17 to 18) |
| Lines added, tests and styles left out | 311 (308 to 321) | 309 (303 to 314) | 299 (291 to 346) | 235 (201 to 280) | 248 (237 to 268) | 355 (346 to 382) |
| Test lines added | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) |
| Style lines added | 0 (0 to 0) | 14 (0 to 21) | 0 (0 to 8) | 0 (0 to 7) | 0 (0 to 5) | 0 (0 to 0) |
| Lines removed | 3 (3 to 3) | 4 (4 to 5) | 79 (74 to 119) | 17 (14 to 20) | 6 (6 to 7) | 8 (6 to 11) |
| Packages added | 0 (0 to 0) | 1 (1 to 1) | 1 (1 to 2) | 0 (0 to 0) | 2 (2 to 3) | 2 (2 to 2) |

## Every run

| Run | Passed | Output tokens | Input tokens, uncached | Cache write tokens | Cache read tokens | Cost (USD, API prices) | Wall time (minutes) | Turns | Tool calls | Check errors hit on the way | Lines added, tests and styles left out |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| astro 1 | yes | 5,680 | 10 | 11,539 | 48,137 | 0.11 | 0.8 | 5 | 4 | 0 | 244 |
| astro 2 | yes | 6,172 | 14 | 13,423 | 72,490 | 0.13 | 1.0 | 8 | 7 | 0 | 280 |
| astro 3 | yes | 5,496 | 14 | 11,926 | 76,078 | 0.12 | 0.7 | 7 | 6 | 0 | 201 |
| astro 4 | yes | 5,909 | 14 | 11,820 | 79,606 | 0.12 | 1.1 | 7 | 6 | 0 | 225 |
| astro 5 | no | 5,701 | 12 | 14,222 | 66,093 | 0.13 | 0.9 | 7 | 6 | 0 | 241 |
| kay 1 | yes | 7,432 | 40 | 26,848 | 453,313 | 0.27 | 2.0 | 20 | 19 | 0 | 309 |
| kay 2 | no | 7,214 | 36 | 28,686 | 414,612 | 0.27 | 1.0 | 18 | 17 | 0 | 310 |
| kay 3 | yes | 7,012 | 30 | 30,920 | 347,999 | 0.26 | 1.3 | 16 | 15 | 0 | 312 |
| kay 4 | yes | 6,114 | 30 | 25,652 | 307,667 | 0.23 | 1.2 | 16 | 15 | 0 | 308 |
| kay 5 | yes | 6,687 | 26 | 27,228 | 274,532 | 0.23 | 1.5 | 14 | 13 | 0 | 321 |
| next 1 | yes | 7,100 | 14 | 13,416 | 82,730 | 0.14 | 1.4 | 8 | 7 | 0 | 351 |
| next 2 | yes | 6,304 | 14 | 18,281 | 90,317 | 0.15 | 1.0 | 7 | 6 | 0 | 346 |
| next 3 | yes | 7,605 | 18 | 14,995 | 111,798 | 0.16 | 1.4 | 9 | 8 | 3 | 361 |
| next 4 | yes | 7,015 | 14 | 12,633 | 73,469 | 0.14 | 0.8 | 8 | 7 | 0 | 355 |
| next 5 | yes | 9,552 | 28 | 17,229 | 206,777 | 0.21 | 1.8 | 15 | 14 | 3 | 382 |
| nuxt 1 | yes | 7,192 | 18 | 12,347 | 109,067 | 0.14 | 3.1 | 10 | 9 | 0 | 247 |
| nuxt 2 | yes | 6,944 | 16 | 11,868 | 93,878 | 0.14 | 1.8 | 8 | 7 | 0 | 251 |
| nuxt 3 | yes | 6,732 | 24 | 13,808 | 159,781 | 0.15 | 1.3 | 12 | 11 | 0 | 237 |
| nuxt 4 | yes | 8,421 | 32 | 14,702 | 240,170 | 0.19 | 2.3 | 17 | 16 | 0 | 248 |
| nuxt 5 | yes | 7,837 | 24 | 14,773 | 159,728 | 0.17 | 2.1 | 12 | 11 | 0 | 268 |
| solidstart 1 | yes | 10,505 | 24 | 20,145 | 185,996 | 0.22 | 1.7 | 12 | 11 | 0 | 291 |
| solidstart 2 | yes | 12,519 | 36 | 30,464 | 392,580 | 0.33 | 2.6 | 19 | 18 | 0 | 346 |
| solidstart 3 | yes | 9,579 | 24 | 20,244 | 197,986 | 0.22 | 1.5 | 12 | 11 | 0 | 321 |
| solidstart 4 | yes | 15,603 | 60 | 31,937 | 737,486 | 0.43 | 3.5 | 31 | 30 | 0 | 299 |
| solidstart 5 | yes | 10,479 | 26 | 20,313 | 223,119 | 0.23 | 1.8 | 14 | 13 | 2 | 295 |
| sveltekit 1 | yes | 12,719 | 58 | 29,075 | 655,125 | 0.37 | 3.3 | 29 | 28 | 0 | 303 |
| sveltekit 2 | yes | 12,697 | 64 | 29,779 | 738,707 | 0.39 | 2.4 | 32 | 31 | 0 | 309 |
| sveltekit 3 | no | 11,736 | 46 | 29,710 | 503,246 | 0.34 | 1.9 | 23 | 22 | 0 | 303 |
| sveltekit 4 | no | 13,025 | 64 | 29,325 | 684,358 | 0.38 | 3.0 | 32 | 31 | 0 | 298 |
| sveltekit 5 | yes | 13,188 | 58 | 29,257 | 668,438 | 0.38 | 3.3 | 30 | 29 | 0 | 314 |

## Versions and docs

- kay: bun 1.4.3, kay 1.51.0, claude 2.1.289; docs: kay 1.51.0 package (llms.txt, llms/), 39 files, 0.6 MB; packages added by an agent: none
- sveltekit: bun 1.4.3, @sveltejs/kit 3.0.1, svelte 5.57.2, claude 2.1.289; docs: https://svelte.dev/llms.txt and the files it links, 8 files, 3.4 MB; packages added by an agent: marked, yaml
- solidstart: bun 1.4.3, @solidjs/start 2.0.6, solid-js 1.9.17, claude 2.1.289; docs: https://docs.solidjs.com/llms.txt and the pages it links, 273 files, 0.8 MB; packages added by an agent: marked, yaml
- astro: bun 1.4.3, astro 7.3.8, claude 2.1.289; docs: https://github.com/withastro/docs src/content/docs/en at ce41ff8, 426 files, 3.0 MB; packages added by an agent: none
- nuxt: bun 1.4.3, nuxt 4.6.1, vue 3.5.44, claude 2.1.289; docs: https://nuxt.com/llms.txt and the pages it links, 341 files, 7.8 MB; packages added by an agent: @nuxt/content, better-sqlite3, zod
- next: bun 1.4.3, next 16.4.2, react 19.3.0, claude 2.1.289; docs: https://nextjs.org/docs/llms.txt and the Markdown of the pages it links, 306 files, 3.1 MB; packages added by an agent: gray-matter, marked

## Isolation

- Each agent ran under bwrap, which hid `~/Workspace`, `~/.claude`, `~/.cache/claude-tmp`, `~/.cache/llm-bench`, `~/.cache/ms-playwright`: the acceptance suite and reference site, other runs' sites, past Claude transcripts and any browser to test with.
- No session started an MCP server.
- Plugins installed on the machine, listed by each session at start and kept off by `--safe-mode`: cc-plugin-agents-md, cc-plugin-plugin-authoring
- No tool call left the workspace or used the network beyond package installs.
- Bash calls running python, node or another package manager despite the prompt: nuxt 4 (2), solidstart 4 (3), solidstart 5 (2), sveltekit 1 (1), kay 3 (1)
- Grading inputs an agent changed, worth reading before trusting its check: sveltekit 2 (script start); sveltekit 5 (script start); sveltekit 4 (script start); sveltekit 1 (script start); sveltekit 3 (script start)
- Input and cache tokens summed per API call match the totals each finished session reported.

## Failed runs

- kay run 2: success, check ok, build ok, failing: books > lists every book by title with its author and year; book pages > /books/around-the-world-in-eighty-days shows the book; book pages > /books/dracula shows the book; book pages > /books/frankenstein shows the book; book pages > /books/moby-dick shows the book; book pages > /books/pride-and-prejudice shows the book; book pages > /books/the-picture-of-dorian-gray shows the book; book pages > /books/the-time-machine shows the book; book pages > /books/treasure-island shows the book; about > shows its text; contact > has the form; not found > /books/no-such-book answers 404 with the 404 page; not found > /no-such-page answers 404 with the 404 page
- sveltekit run 3: success, check ok, build ok, failing: books > lists every book by title with its author and year; books > filters by tag in the browser; book pages > /books/around-the-world-in-eighty-days shows the book; book pages > /books/dracula shows the book; book pages > /books/frankenstein shows the book; book pages > /books/moby-dick shows the book; book pages > /books/pride-and-prejudice shows the book; book pages > /books/the-picture-of-dorian-gray shows the book; book pages > /books/the-time-machine shows the book; book pages > /books/treasure-island shows the book; favorites > toggle on the book page, survive a reload and show on the books list
- sveltekit run 4: success, check ok, build ok, failing: books > lists every book by title with its author and year; books > filters by tag in the browser; book pages > /books/around-the-world-in-eighty-days shows the book; book pages > /books/dracula shows the book; book pages > /books/frankenstein shows the book; book pages > /books/moby-dick shows the book; book pages > /books/pride-and-prejudice shows the book; book pages > /books/the-picture-of-dorian-gray shows the book; book pages > /books/the-time-machine shows the book; book pages > /books/treasure-island shows the book; favorites > toggle on the book page, survive a reload and show on the books list
- astro run 5: success, check ok, build ok, failing: layout > /about has the header, nav and footer
