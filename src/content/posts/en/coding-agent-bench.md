---
title: "I had Claude build one site in five frameworks"
description: "I had Claude build the same site in SvelteKit, SolidStart, Astro, Nuxt and Next.js, on Opus and on Sonnet, graded by browser tests it never saw."
date: 2026-10-19
updated: 2026-11-10
tags: [benchmarks, llm]
draft: false
social:
  x: "Claude built the same small site in SvelteKit, SolidStart, Astro, Nuxt and Next.js, 5 times each on Opus 5.5 and on Sonnet 5.5, graded by browser tests it never saw. Opus passed 25 of 25 for $39.93, Sonnet 22 of 25 for $5.50."
  bluesky: "Claude built the same small site in SvelteKit, SolidStart, Astro, Nuxt and Next.js, 5 times each on Opus 5.5 and Sonnet 5.5, graded by hidden browser tests. Opus passed 25 of 25, Sonnet 22. Every failure was a bug one page load would have shown."
  mastodon: "Claude built the same small site in SvelteKit, SolidStart, Astro, Nuxt and Next.js, 5 times each on Opus 5.5 and on Sonnet 5.5, sandboxed, with no browser, graded by a test suite it never saw. Opus passed 25 of 25 runs for $39.93, Sonnet 22 of 25 for $5.50, and every failure was a bug a single page load would have shown. #AI #LLM #WebDev"
  reddit:
    title: "Claude built the same site in five web frameworks, on Opus and on Sonnet, graded by browser tests it never saw"
    body: "I wanted to know what a framework costs a coding agent, so Claude Code built the same small site (Markdown content, a tag filter, favorites, a form that works without JavaScript) in SvelteKit, SolidStart, Astro, Nuxt and Next.js, 5 runs each on Opus 5.5 and Sonnet 5.5, sandboxed with no browser. A hidden Playwright suite graded every run. Opus passed all 25, Sonnet 22, and every failure was a bug one page load would have shown. The post has tokens, time, cost, turns, docs read and lines per framework, and how the runs are kept apart."
    subreddits: []
---

When a coding agent builds a site, the framework decides much of the bill: tokens, time, turns, docs read, failed checks, lines of code. So I had Claude build the same small site in SvelteKit, SolidStart, Astro, Nuxt and Next.js, five times each on Opus 5.5 and five times on the cheaper Sonnet 5.5, and a browser test suite it never saw graded every run. A framework an agent writes cheaply and correctly is one I can hand work to.

<Stats
  items={[
    {"value": "25 of 25", "label": "Opus runs passing every check and test"},
    {"value": "22 of 25", "label": "Sonnet runs passing every check and test"},
    {"value": "7.3x", "label": "the cost of Opus against Sonnet, $39.93 and $5.50 for 25 runs each at API prices"}
  ]}
/>

## Every failure was one a browser would have caught

Opus 5.5 at high effort is the expensive end; Sonnet 5.5 at medium effort is closer to what a team would use every day. Each chart shows each framework's median passing run, with its lowest and highest beside it.

<BarChart
  title="Tokens written, thinking included"
  unit="K tokens"
  better="lower"
  digits={1}
  rows={[
    {"label": "Astro", "group": "Sonnet 5.5", "value": 5.8, "range": [5.5, 6.2]},
    {"label": "Next.js", "group": "Sonnet 5.5", "value": 7.1, "range": [6.3, 9.6]},
    {"label": "Nuxt", "group": "Sonnet 5.5", "value": 7.2, "range": [6.7, 8.4]},
    {"label": "SolidStart", "group": "Sonnet 5.5", "value": 10.5, "range": [9.6, 15.6]},
    {"label": "SvelteKit", "group": "Sonnet 5.5", "value": 12.7, "range": [12.7, 13.2]},
    {"label": "Astro", "group": "Opus 5.5", "value": 17, "range": [15.8, 23.9]},
    {"label": "SvelteKit", "group": "Opus 5.5", "value": 25.3, "range": [21.1, 36.6]},
    {"label": "Nuxt", "group": "Opus 5.5", "value": 28.7, "range": [20.1, 36.2]},
    {"label": "Next.js", "group": "Opus 5.5", "value": 29.7, "range": [24.4, 46.6]},
    {"label": "SolidStart", "group": "Opus 5.5", "value": 33.9, "range": [32.2, 44.6]}
  ]}
  bench="llmModels"
/>

<BarChart
  title="Time to build the site"
  unit="min"
  better="lower"
  digits={1}
  rows={[
    {"label": "Astro", "group": "Sonnet 5.5", "value": 0.9, "range": [0.7, 1.1]},
    {"label": "Next.js", "group": "Sonnet 5.5", "value": 1.4, "range": [0.8, 1.8]},
    {"label": "SolidStart", "group": "Sonnet 5.5", "value": 1.8, "range": [1.5, 3.5]},
    {"label": "Nuxt", "group": "Sonnet 5.5", "value": 2.1, "range": [1.3, 3.1]},
    {"label": "SvelteKit", "group": "Sonnet 5.5", "value": 3.3, "range": [2.4, 3.3]},
    {"label": "Astro", "group": "Opus 5.5", "value": 2.6, "range": [2.5, 3.6]},
    {"label": "SvelteKit", "group": "Opus 5.5", "value": 4.5, "range": [3.3, 12.4]},
    {"label": "Next.js", "group": "Opus 5.5", "value": 5.9, "range": [4.8, 8.5]},
    {"label": "Nuxt", "group": "Opus 5.5", "value": 7.9, "range": [4.3, 9.5]},
    {"label": "SolidStart", "group": "Opus 5.5", "value": 9.3, "range": [6.5, 12.9]}
  ]}
  bench="llmModels"
/>

<BarChart
  title="Cost of the site, at API prices"
  unit="USD"
  better="lower"
  digits={2}
  rows={[
    {"label": "Astro", "group": "Sonnet 5.5", "value": 0.12, "range": [0.11, 0.13]},
    {"label": "Next.js", "group": "Sonnet 5.5", "value": 0.15, "range": [0.14, 0.21]},
    {"label": "Nuxt", "group": "Sonnet 5.5", "value": 0.15, "range": [0.14, 0.19]},
    {"label": "SolidStart", "group": "Sonnet 5.5", "value": 0.23, "range": [0.22, 0.43]},
    {"label": "SvelteKit", "group": "Sonnet 5.5", "value": 0.38, "range": [0.37, 0.39]},
    {"label": "Astro", "group": "Opus 5.5", "value": 0.78, "range": [0.75, 1.12]},
    {"label": "Nuxt", "group": "Opus 5.5", "value": 1.46, "range": [0.91, 1.8]},
    {"label": "SvelteKit", "group": "Opus 5.5", "value": 1.52, "range": [1.23, 2.22]},
    {"label": "Next.js", "group": "Opus 5.5", "value": 1.87, "range": [1.37, 2.85]},
    {"label": "SolidStart", "group": "Opus 5.5", "value": 1.94, "range": [1.86, 2.79]}
  ]}
  bench="llmModels"
/>

The agent has no browser, so all three of Sonnet's failures shipped bugs a single page load would have shown. Twice, SvelteKit's favorites store wrote its state while the page rendered, which Svelte refuses once the page hydrates, so the book list and book pages fell to the error page. Once, Astro's layout compared the path with `/about`, which a prerendered page sees as `/about/`, so no nav link was marked active.

The charts from here on are Opus's alone. Styling was free and not graded, so line counts leave CSS out: 77 to 113 lines in the median runs.

<BarChart
  title="Lines of code written, tests and styles left out"
  unit="lines"
  better="lower"
  digits={0}
  rows={[
    {"label": "Nuxt", "value": 444, "range": [437, 476]},
    {"label": "Astro", "value": 463, "range": [440, 491]},
    {"label": "SvelteKit", "value": 472, "range": [455, 518]},
    {"label": "SolidStart", "value": 537, "range": [523, 549]},
    {"label": "Next.js", "value": 616, "range": [537, 636]}
  ]}
  bench="llm"
/>

<BarChart
  title="Thinking tokens"
  unit="K tokens"
  better="lower"
  digits={1}
  rows={[
    {"label": "Astro", "value": 4.3, "range": [3.5, 5.7]},
    {"label": "SvelteKit", "value": 8.5, "range": [8, 13.3]},
    {"label": "Nuxt", "value": 10.2, "range": [7.5, 13.8]},
    {"label": "Next.js", "value": 10.6, "range": [8.8, 20.7]},
    {"label": "SolidStart", "value": 11.5, "range": [9.7, 15.6]}
  ]}
  bench="llm"
/>

<BarChart
  title="Agent turns"
  unit="turns"
  better="lower"
  digits={0}
  rows={[
    {"label": "Astro", "value": 24, "range": [21, 31]},
    {"label": "SvelteKit", "value": 40, "range": [30, 51]},
    {"label": "Nuxt", "value": 47, "range": [30, 56]},
    {"label": "Next.js", "value": 50, "range": [38, 72]},
    {"label": "SolidStart", "value": 53, "range": [45, 74]}
  ]}
  bench="llm"
/>

<BarChart
  title="Docs read"
  unit="K characters"
  digits={0}
  rows={[
    {"label": "Nuxt", "value": 14, "range": [8, 22]},
    {"label": "Astro", "value": 29, "range": [8, 38]},
    {"label": "SolidStart", "value": 52, "range": [26, 64]},
    {"label": "Next.js", "value": 84, "range": [70, 114]},
    {"label": "SvelteKit", "value": 89, "range": [49, 103]}
  ]}
  bench="llm"
/>

<BarChart
  title="Largest context in one call"
  unit="K tokens"
  better="lower"
  digits={1}
  rows={[
    {"label": "Astro", "value": 45, "range": [43.1, 58.9]},
    {"label": "Nuxt", "value": 67, "range": [48.4, 91.2]},
    {"label": "SvelteKit", "value": 80.1, "range": [73.7, 106.6]},
    {"label": "Next.js", "value": 90, "range": [71.2, 120.1]},
    {"label": "SolidStart", "value": 91.7, "range": [84.7, 114.1]}
  ]}
  bench="llm"
/>

## One spec, graded by tests the agent never sees

Every run builds Bookshelf, a small catalog of classic books, from one spec where only the framework's name changes:

- 8 books as Markdown files with frontmatter, read as a content collection, each on its own page.
- A book list with a tag filter that runs in the browser, and a favorite button whose state survives a reload through `localStorage`.
- A contact form validated on the server and in the browser, which also works with JavaScript off.
- A shared layout, an about page and a real 404, status code included.

Every text the tests look for is given word for word, so a run can only fail on its own typos, not mine. Styling is free and not graded.

The grader is a Playwright suite of 11 tests driving headless Chromium, repeated for each page or book where it applies. They check the layout and its active link, the top rated books in order, the list and its filter, every book page, favorites across a reload, the form with and without JavaScript, and the 404. A test suite is only as good as what it was checked against, so this one also runs against a reference site built with Bun alone, no framework at all. If the reference fails, the suite is wrong, not the frameworks.

## Each agent starts from the framework's own starter and docs

Each run starts from the framework's own scaffolder, in its most minimal form that still has a server for the form: `sv create --template minimal` with the Node adapter, SolidStart 2's `basic`, `create-astro --template minimal` with the Node adapter, `create-nuxt --template minimal` with no modules, `create-next-app --empty` with the App Router. I only touch their scripts, so that `bun run check`, `bun run build` and `bun run start` do the same thing everywhere, and add the `vue-tsc` and TypeScript 6 that Nuxt's check needs. Each `check` stays the starter's own and only fails on errors.

The docs are copied offline into the project, since the prompt allows no network except `bun add`. They vary in kind as much as in size: for SvelteKit, SolidStart and Nuxt, the pages their `llms.txt` links, 3.4, 0.8 and 7.8 MB. For Next.js, the Markdown of the pages its `llms.txt` links, 3.1 MB, plus the docs in its package, which the `AGENTS.md` its scaffolder writes points to. Astro dropped its `llms.txt`, so its docs are the Markdown source of its site, 3.0 MB in 424 files.

## Each run is sealed off from the others and from me

Each run is one headless Claude Code session, `claude -p --safe-mode`: no CLAUDE.md, no hooks, no plugins, no MCP servers, and an empty config directory of its own. It runs under bubblewrap, which hides my workspace, my Claude config and transcripts, the other runs, the reference site and the test browsers, with its own `/tmp` and process list. So the agent cannot peek at the tests, copy a previous run or check its work in a browser: all it has is `check`, the build and its own reasoning.

Once the agent stops, the grader runs `bun run check` and `bun run build`, starts the site with `bun run start` on a given port, and runs the suite against it. A run passes when all three pass.

Runs alternate between frameworks in a rotating order, so a slow hour on the API hits everyone alike. Opus's sessions still covered only some of them, SvelteKit, SolidStart and Astro together, then Nuxt and Next.js six days later, so take its times with a pinch of salt; Sonnet's ran in one go. The report also flags what grading can't catch: in 24 of 25 Opus runs the agent reached for `python`, `node` or another package manager although the prompt asked for Bun only (16 times in one Nuxt run), against 4 of 25 for Sonnet, and every SvelteKit run of both models edited its `start` script, which the grader relies on.

## A one-run trial comes before every session

A full session is 5 runs per framework, so a bug in the harness wastes 25 of them. Every change starts with a single trial run of one framework instead, its results and transcript read before moving on to the next. A trial costs about a dollar, and pays for itself. Next.js's failed because of the suite rather than the site: the favorites test waited for the network to go idle after a reload, which Next's router never does on a second visit, so the suite now opens each visit in a fresh browser context that carries cookies and storage over. Sonnet's runs caught one more: the suite found form fields by their label's text, which takes in the text a server puts back in a textarea, so a working SolidStart site failed. It now finds them by their accessible name, and every Opus site still passes.

<Note title="How it was measured">

Claude Opus 5.5 at high effort and Claude Sonnet 5.5 at medium effort, Claude Code 2.1.289, SvelteKit 3.0.1, SolidStart 2.0.6, Astro 7.3.8, Nuxt 4.6.1 and Next.js 16.4.2, all on Bun, 5 runs each per model. Opus's Nuxt and Next.js runs came six days after its others, and Sonnet's all ran on 19 October. Every figure is the median of the passing runs. Cost is at API prices, as Claude Code reports it. The spec, the prompt, the starters, the suite and every run are in bench/llm: [Opus's runs](https://github.com/Kayno0o/devlog/blob/main/bench/llm/results/full-opus-1.51/results.md) and [Sonnet's](https://github.com/Kayno0o/devlog/blob/main/bench/llm/results/full-sonnet-medium/results.md).

</Note>

The same five frameworks, timed [on one products page](/posts/five-frameworks) in the browser, on the server and at build time.
