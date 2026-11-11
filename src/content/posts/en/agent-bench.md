---
title: "Claude had never seen kay. It wrote less code in it"
description: "I ran my coding-agent bench on kay, beside SvelteKit, SolidStart, Astro, Nuxt and Next.js: what a framework learned from its docs alone costs."
date: 2026-10-17T11:00:00Z
tags: [kay, benchmarks, llm]
draft: false
social:
  x: "A model learned Next.js and Svelte from years of code on the web, and kay, my Bun framework, from 39 doc files in the project. Building the same site, Claude Opus 5.5 read more docs for kay than for five other frameworks, and wrote 13K tokens against 17K to 34K."
  bluesky: "A model learns kay, my Bun framework, from 39 doc files in the project, not from the web. Building the same site in six frameworks, Claude Opus 5.5 read the most docs for kay, then wrote 13K tokens against 17K to 34K, and passed every test."
  mastodon: "Claude Opus 5.5 built the same site in kay, my Bun framework, and in five others, five times each, graded by browser tests it never saw. With kay it read the most docs, as it knows kay only from 39 files in the project, then wrote 13K tokens against 17K to 34K, the fewest lines, and its own tests in 4 runs of 5. #Bun #LLM #WebDev"
  reddit:
    title: "What a framework the model never saw costs a coding agent: kay against SvelteKit, SolidStart, Astro, Nuxt and Next.js"
    body: "I build kay, a Bun web framework, so the model knows it only from the docs it ships, 39 files in the project. Claude Opus 5.5 built the same site in kay and five other frameworks, five times each, sandboxed, graded by a hidden browser suite. With kay it read the most docs, then wrote fewer tokens and fewer lines than with any other, and wrote its own tests in 4 of 5 runs. All 30 runs passed."
    subreddits: []
---

Every other framework in the [coding-agent bench](/posts/coding-agent-bench) comes with years of code and answers on the web that the model learned from. kay has only its docs, 39 files in the project, and its package. So Claude Opus 5.5 built the same site in kay five times, beside the other five frameworks: it read more docs for kay than for any of them, and wrote less.

<Stats
  items={[
    {"value": "30 of 30", "label": "runs passing every check and test, kay's included"},
    {"value": "-24 to -62%", "label": "tokens written, kay against the other five frameworks"},
    {"value": "78 vs 0", "label": "lines of tests written, kay against the others"}
  ]}
/>

<Note title="The site kay's agent built, running">

<Embed src="/llm-bench/bookshelf/books" title="The Bookshelf site kay's agent built" />

</Note>

Filter its books, open one, mark it a favorite. It is the run of median cost, exported as static files, without its contact form, since that needs a server.

## Learning kay costs reads, and saves code

Each chart shows each framework's median over its runs, with the lowest and highest beside it.

<BarChart
  title="Docs read"
  unit="K characters"
  digits={0}
  rows={[
    {"label": "Nuxt", "value": 14, "range": [8, 22]},
    {"label": "Astro", "value": 29, "range": [8, 38]},
    {"label": "SolidStart", "value": 52, "range": [26, 64]},
    {"label": "Next.js", "value": 84, "range": [70, 114]},
    {"label": "SvelteKit", "value": 89, "range": [49, 103]},
    {"label": "kay", "value": 93, "range": [77, 107]}
  ]}
  bench="llm"
/>

<BarChart
  title="Largest context of one call"
  unit="K tokens"
  better="lower"
  digits={1}
  rows={[
    {"label": "Astro", "value": 45, "range": [43.1, 58.9]},
    {"label": "kay", "value": 64.8, "range": [58.5, 82.7]},
    {"label": "Nuxt", "value": 67, "range": [48.4, 91.2]},
    {"label": "SvelteKit", "value": 80.1, "range": [73.7, 106.6]},
    {"label": "Next.js", "value": 90, "range": [71.2, 120.1]},
    {"label": "SolidStart", "value": 91.7, "range": [84.7, 114.1]}
  ]}
  bench="llm"
/>

<BarChart
  title="Lines of code written, tests and styles left out"
  unit="lines"
  better="lower"
  digits={0}
  rows={[
    {"label": "kay", "value": 323, "range": [227, 336]},
    {"label": "Nuxt", "value": 444, "range": [437, 476]},
    {"label": "Astro", "value": 463, "range": [440, 491]},
    {"label": "SvelteKit", "value": 472, "range": [455, 518]},
    {"label": "SolidStart", "value": 537, "range": [523, 549]},
    {"label": "Next.js", "value": 616, "range": [537, 636]}
  ]}
  bench="llm"
/>

Styling was free and not graded: kay's agents wrote no CSS, where the others wrote about a hundred lines in a typical run, so the line counts leave styles out. kay's agents also wrote their own tests in 4 of 5 runs, where no other framework's agent wrote one. Those lines are left out too, though the tokens that wrote them count everywhere else.

<BarChart
  title="Thinking tokens"
  unit="K tokens"
  better="lower"
  digits={1}
  rows={[
    {"label": "kay", "value": 3.1, "range": [2.4, 5]},
    {"label": "Astro", "value": 4.3, "range": [3.5, 5.7]},
    {"label": "SvelteKit", "value": 8.5, "range": [8, 13.3]},
    {"label": "Nuxt", "value": 10.2, "range": [7.5, 13.8]},
    {"label": "Next.js", "value": 10.6, "range": [8.8, 20.7]},
    {"label": "SolidStart", "value": 11.5, "range": [9.7, 15.6]}
  ]}
  bench="llm"
/>

<BarChart
  title="Turns"
  unit="turns"
  better="lower"
  digits={0}
  rows={[
    {"label": "Astro", "value": 24, "range": [21, 31]},
    {"label": "kay", "value": 27, "range": [21, 47]},
    {"label": "SvelteKit", "value": 40, "range": [30, 51]},
    {"label": "Nuxt", "value": 47, "range": [30, 56]},
    {"label": "Next.js", "value": 50, "range": [38, 72]},
    {"label": "SolidStart", "value": 53, "range": [45, 74]}
  ]}
  bench="llm"
/>

<BarChart
  title="Time to build the site"
  unit="min"
  better="lower"
  digits={1}
  rows={[
    {"label": "Astro", "value": 2.6, "range": [2.5, 3.6]},
    {"label": "kay", "value": 3.4, "range": [1.8, 4.7]},
    {"label": "SvelteKit", "value": 4.5, "range": [3.3, 12.4]},
    {"label": "Next.js", "value": 5.9, "range": [4.8, 8.5]},
    {"label": "Nuxt", "value": 7.9, "range": [4.3, 9.5]},
    {"label": "SolidStart", "value": 9.3, "range": [6.5, 12.9]}
  ]}
  bench="llm"
/>

<BarChart
  title="Cost of the site, API prices"
  unit="USD"
  better="lower"
  digits={2}
  rows={[
    {"label": "Astro", "value": 0.78, "range": [0.75, 1.12]},
    {"label": "kay", "value": 0.95, "range": [0.78, 1.54]},
    {"label": "Nuxt", "value": 1.46, "range": [0.91, 1.8]},
    {"label": "SvelteKit", "value": 1.52, "range": [1.23, 2.22]},
    {"label": "Next.js", "value": 1.87, "range": [1.37, 2.85]},
    {"label": "SolidStart", "value": 1.94, "range": [1.86, 2.79]}
  ]}
  bench="llm"
/>

## kay's runs follow the same rules

The site, the hidden tests, the sandbox and the grading are those of the [coding-agent bench](/posts/coding-agent-bench). kay's run starts from `kay new --template blank --with server`, with its docs as its package ships them: the `llms.txt` and its topic files, 0.6 MB in 39 files, against 0.8 to 7.8 MB for the others.

kay's sitting came last, alone, so its times compare less well than its tokens or lines. Like the others, its agent sometimes reached for `python` or `node` although the prompt asked for Bun only, in 3 of its 5 runs.

<Note title="How it was measured">

Claude Opus 5.5 at high effort, Claude Code 2.1.289, kay 1.51.0, SvelteKit 3.0.1, SolidStart 2.0.6, Astro 7.3.8, Nuxt 4.6.1, Next.js 16.4.2, all on Bun, 5 runs each, Nuxt's and Next.js's six days after SvelteKit's, SolidStart's and Astro's, kay's a few hours after those. Every figure is the median of the passing runs. Cost is at API prices, as Claude Code reports it. The spec, the prompt, the starters, the suite and every run are in [bench/llm](https://github.com/Kayno0o/devlog/blob/main/bench/llm/results/full-opus-1.51/results.md).

</Note>
