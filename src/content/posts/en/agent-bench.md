---
title: "One site, built by a coding agent in every framework"
description: "How I measure what a web framework costs a coding agent: one spec, a hidden test suite, sandboxed headless runs, and what came out for kay, SvelteKit, SolidStart, Astro, Nuxt and Next.js."
date: 2026-10-16
tags: [kay, benchmarks, llm]
draft: true
---

The [kay post](/posts/introducing-kay) gives this benchmark one section and four charts. This post is the whole of it: how a run works, what keeps it honest, and every measure, the ones that did not fit there included. The [five frameworks post](/posts/five-frameworks) runs the same bench without kay, on Sonnet 5.5 too.

The question is simple: when a coding agent builds a site, what does the framework cost it? Tokens, time, turns, docs read, check errors, lines of code. A framework an agent writes cheaply and correctly is one I can hand work to, and kay is meant to be one.

## The site

Every run builds Bookshelf, a small catalog of classic books, from one spec that only changes the framework's name:

- 8 books as Markdown files with a frontmatter, read as a content collection, each rendered on its own page.
- A books list with a tag filter that runs in the browser, and a favorite button whose state survives a reload in `localStorage`.
- A contact form checked on the server and in the browser, which also works with JavaScript turned off.
- A shared layout, an about page, and a real 404 with its status code.

Every text the tests look for is given word for word, so a run cannot fail on a typo of mine, only on its own. Styling is free and not graded.

## The hidden tests

A run is graded by a Playwright suite the agent never sees: 11 tests driving headless Chromium, run once per page or book where it applies. They check the layout and its current link, the top rated books in order, the list and its filter, every book page, favorites across a reload, the form with and without JavaScript, and the 404.

A suite is only as good as what it was proven against, so it also runs against a reference site built with Bun alone, no framework at all. If the reference fails, the suite is wrong, not the frameworks.

## The starters and their docs

Each run starts from the framework's own scaffolder, as minimal as it gets while still having a server for the form: `kay new --template blank --with server`, `sv create --template minimal` with the Node adapter, SolidStart 2's `basic`, `create-astro --template minimal` with the Node adapter, `create-nuxt --template minimal` with no modules, `create-next-app --empty` with the App Router. I only touch their scripts, so that `bun run check`, `bun run build` and `bun run start` mean the same thing everywhere, and add the `vue-tsc` and TypeScript 6 that Nuxt's check needs. Each `check` stays the starter's own, failing on errors only.

The docs sit offline in the project, since the prompt allows no network but `bun add`. They differ in kind as much as in size: kay's are the `llms.txt` and topic files its package ships, 0.6 MB in 39 files. SvelteKit's, SolidStart's and Nuxt's are the pages their `llms.txt` links, 3.4, 0.8 and 7.8 MB. Next.js's are the Markdown of the pages its `llms.txt` links, 3.1 MB, plus the docs in its package, which the `AGENTS.md` its scaffolder writes points to. Astro dropped its `llms.txt`, so its docs are the Markdown source of its site, 3.0 MB in 424 files.

Docs matter more for kay than for anyone else: the other five have years of code and answers on the web the model learned from, while what it knows about kay comes from those 39 files and the package itself.

## Keeping the runs apart

Each run is one headless Claude Code session, `claude -p --safe-mode`: no CLAUDE.md, no hooks, no plugins, no MCP servers, and an empty config directory of its own. It runs under bubblewrap, which hides my workspace, my Claude config and transcripts, the other runs, the reference site and the test browsers, with a private `/tmp` and process list. So the agent cannot peek at the tests, copy a previous run, or check its work in a browser: `check`, the build and its own reasoning are all it has.

Once the agent stops, the grader runs `bun run check` and `bun run build`, starts the site with `bun run start` on a given port, and runs the suite against it. A run passes when all three pass.

The harness alternates runs between frameworks, in a rotated order, so a slow hour on the API lands on everyone alike, but each sitting here covers only some of them: SvelteKit, SolidStart and Astro together, then Nuxt and Next.js one after the other, then kay alone, so time is the measure to read with the most salt. The report also lists what the grade does not catch: in 27 of 30 runs the agent reached for `python`, `node` or another package manager despite the prompt asking for Bun only, up to 16 times in one Nuxt run, and every SvelteKit run edited its `start` script, a grading input worth reading before trusting the result.

## Probe first

A full sitting is 5 runs per framework, so a mistake in the harness costs 30 runs. Each change starts with a probe instead: one run of one framework under a throwaway label, its results and transcript read, then the next framework. A probe costs about a dollar: $0.79 to $1.27 for the first round of kay, SvelteKit, SolidStart and Astro, $1.20 and $1.42 for Nuxt's and Next.js's, $0.83 to $1.71 for kay's later ones. Next.js's probe failed on the suite, not on its site: the favorites test waited for the network to go idle after a reload, which Next's router never lets happen on a second visit, so the suite now opens each visit in a fresh browser context carrying the cookies and storage over.

<Stats items={[{"value":"30 of 30","label":"runs passing every check and test"},{"value":"$45.15","label":"all 30 runs at API prices"}]} />

## Results

Each chart shows each framework's median over its runs, with the lowest and highest beside it.

<Stats items={[{"value":"13K vs 17K to 34K","label":"tokens written, kay against the others"}]} />

<BarChart title="Time to build the site" unit="min" better="lower" digits={1} rows={[{"label":"Astro","value":2.6,"range":[2.5,3.6]},{"label":"kay","value":3.4,"range":[1.8,4.7]},{"label":"SvelteKit","value":4.5,"range":[3.3,12.4]},{"label":"Next.js","value":5.9,"range":[4.8,8.5]},{"label":"Nuxt","value":7.9,"range":[4.3,9.5]},{"label":"SolidStart","value":9.3,"range":[6.5,12.9]}]} bench="llm" />

kay's agents wrote no CSS, where the others wrote about a hundred lines in a typical run, so the line counts leave styles out.

<BarChart title="Lines of code written, tests and styles left out" unit="lines" better="lower" digits={0} rows={[{"label":"kay","value":323,"range":[227,336]},{"label":"Nuxt","value":444,"range":[437,476]},{"label":"Astro","value":463,"range":[440,491]},{"label":"SvelteKit","value":472,"range":[455,518]},{"label":"SolidStart","value":537,"range":[523,549]},{"label":"Next.js","value":616,"range":[537,636]}]} bench="llm" />

<BarChart title="Cost of the site, API prices" unit="USD" better="lower" digits={2} rows={[{"label":"Astro","value":0.78,"range":[0.75,1.12]},{"label":"kay","value":0.95,"range":[0.78,1.54]},{"label":"Nuxt","value":1.46,"range":[0.91,1.8]},{"label":"SvelteKit","value":1.52,"range":[1.23,2.22]},{"label":"Next.js","value":1.87,"range":[1.37,2.85]},{"label":"SolidStart","value":1.94,"range":[1.86,2.79]}]} bench="llm" />

<BarChart title="Thinking tokens" unit="K tokens" better="lower" digits={1} rows={[{"label":"kay","value":3.1,"range":[2.4,5]},{"label":"Astro","value":4.3,"range":[3.5,5.7]},{"label":"SvelteKit","value":8.5,"range":[8,13.3]},{"label":"Nuxt","value":10.2,"range":[7.5,13.8]},{"label":"Next.js","value":10.6,"range":[8.8,20.7]},{"label":"SolidStart","value":11.5,"range":[9.7,15.6]}]} bench="llm" />

<Stats items={[{"value":"78 vs 0","label":"lines of tests written, kay against the others"}]} />

kay's agents wrote their own tests in 4 of 5 runs, where no other framework's agent wrote one. Those lines are left out of every line count, though the tokens that wrote them count everywhere else.

<BarChart title="Turns" unit="turns" better="lower" digits={0} rows={[{"label":"Astro","value":24,"range":[21,31]},{"label":"kay","value":27,"range":[21,47]},{"label":"SvelteKit","value":40,"range":[30,51]},{"label":"Nuxt","value":47,"range":[30,56]},{"label":"Next.js","value":50,"range":[38,72]},{"label":"SolidStart","value":53,"range":[45,74]}]} bench="llm" />

<BarChart title="Docs read" unit="K characters" digits={0} rows={[{"label":"Nuxt","value":14,"range":[8,22]},{"label":"Astro","value":29,"range":[8,38]},{"label":"SolidStart","value":52,"range":[26,64]},{"label":"Next.js","value":84,"range":[70,114]},{"label":"SvelteKit","value":89,"range":[49,103]},{"label":"kay","value":93,"range":[77,107]}]} bench="llm" />

<BarChart title="Largest context of one call" unit="K tokens" better="lower" digits={1} rows={[{"label":"Astro","value":45,"range":[43.1,58.9]},{"label":"kay","value":64.8,"range":[58.5,82.7]},{"label":"Nuxt","value":67,"range":[48.4,91.2]},{"label":"SvelteKit","value":80.1,"range":[73.7,106.6]},{"label":"Next.js","value":90,"range":[71.2,120.1]},{"label":"SolidStart","value":91.7,"range":[84.7,114.1]}]} bench="llm" />

Learning kay from its docs costs reads, and those reads fill the context.

<Note title="How it was measured">

Claude Opus 5.5 at high effort, Claude Code 2.1.289, kay 1.51.0, SvelteKit 3.0.1, SolidStart 2.0.6, Astro 7.3.8, Nuxt 4.6.1, Next.js 16.4.2, all on Bun, 5 runs each, Nuxt's and Next.js's six days after SvelteKit's, SolidStart's and Astro's, kay's a few hours after those. Every figure is the median of the passing runs. Cost is at API prices, as Claude Code reports it. The spec, the prompt, the starters, the suite and every run are in [bench/llm](https://github.com/Kayno0o/devlog/blob/main/bench/llm/results/full-opus-1.51/results.md).

</Note>
