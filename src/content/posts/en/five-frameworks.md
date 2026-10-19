---
title: "Five frameworks, measured twice"
description: "Five web frameworks measured twice: a synthetic bench timing the same products page in the browser, on the server and at build time, and a coding agent building the same site in each."
date: 2026-10-19
tags: [benchmarks, llm]
draft: true
---

Two benchmarks, five frameworks each. The first is synthetic: the same products page and table in every framework, timed in the browser, on the server and at build time. The second hands the same small site to a coding agent in every framework and counts what building it cost. Every bench here ran on one desktop, a Ryzen 5 7600 with 12 threads on Linux.

## A synthetic bench

The same products page and the same data for each framework, each written the way its own docs and its js-framework-benchmark entry write it. SolidJS and Svelte are timed behind the same Elysia server, Astro and Nuxt through their own request handlers, and Next.js through its own HTTP server.

<BarChart title="Main-thread script on load, products page" unit="ms" better="lower" rows={[{"label":"Astro","value":1.3},{"label":"Nuxt","value":5.3},{"label":"SolidJS","value":10.7},{"label":"Svelte","value":13.8},{"label":"Next.js","value":18.8}]} bench="syntheticNeutral" />

Astro hydrates its two Solid islands only. SolidJS, Svelte and Nuxt hydrate the whole page, so they also send its data again as JSON, and Next.js streams its component payload along with the page.

<BarChart title="HTML sent, products page, gzip" unit="KB" better="lower" rows={[{"label":"Astro","value":10.3},{"label":"Svelte","value":15.7},{"label":"SolidJS","value":21.6},{"label":"Nuxt","value":23.5},{"label":"Next.js","value":23.6}]} bench="syntheticNeutral" />

<BarChart title="Server rendering, products page" unit="renders/s" better="higher" digits={0} rows={[{"label":"Svelte","value":3796},{"label":"Astro","value":1827},{"label":"SolidJS","value":1697},{"label":"Nuxt","value":585}]} bench="syntheticNeutral" />

<BarChart title="Code written, products and table pages" unit="K characters" better="lower" digits={1} rows={[{"label":"Nuxt","value":2.9},{"label":"Svelte","value":3.3},{"label":"Astro","value":3.4},{"label":"SolidJS","value":3.7},{"label":"Next.js","value":4.1}]} bench="syntheticNeutral" source="whitespace and comments left out, as is the bench's server glue" />

Counted in characters, as lines depend on formatting: Prettier turns the Svelte app's 70 lines into 130.

<BarChart title="Production build time" unit="s" better="lower" digits={2} rows={[{"label":"Svelte","value":0.09},{"label":"SolidJS","value":0.14},{"label":"Astro","value":0.63},{"label":"Nuxt","value":1.99},{"label":"Next.js","value":2.14}]} bench="syntheticNeutral" />

<BarChart title="Build output, gzip" unit="KB" better="lower" rows={[{"label":"SolidJS","value":8.2},{"label":"Svelte","value":22.5},{"label":"Astro","value":138.1},{"label":"Next.js","value":328.9},{"label":"Nuxt","value":610.7}]} bench="syntheticNeutral" source="SolidJS and Svelte bundle no server" />

<BarChart title="JS shipped, table page, gzip" unit="KB" better="lower" rows={[{"label":"SolidJS","value":8.2},{"label":"Astro","value":9.6},{"label":"Svelte","value":22.5},{"label":"Nuxt","value":71.8},{"label":"Next.js","value":134.3}]} bench="syntheticNeutral" />

Astro's island is the same Solid table as the SolidJS app, and neither has a router.

<BenchTable title="Table operations" unit="ms" columns={["SolidJS","Svelte","Astro","Next.js","Nuxt"]} rows={[{"label":"Create 1,000 rows","values":[26.1,27.6,26.7,29.6,26.9]},{"label":"Replace 1,000 rows","values":[24.7,25.7,24.7,29.8,27.5]},{"label":"Update every 10th row","values":[2.7,2.6,2.7,4,3.5]},{"label":"Select a row","values":[0.3,0.9,0.3,1.2,0.6]},{"label":"Swap two rows","values":[2,2.1,1.9,20.4,2.4]},{"label":"Remove a row","values":[1.9,2.2,1.9,3.2,4.5]},{"label":"Create 10,000 rows","values":[227,230,236,363,267]},{"label":"Append 1,000 rows","values":[23.6,23.9,23.4,26.6,25.8]},{"label":"Clear 1,000 rows","values":[2.7,3.2,2.8,5,4.3]}]} bench="syntheticNeutral" />

<Note title="How it was measured">

solid-js 1.9.15, Svelte 5.57.1, Astro 7.3.8, Next.js 16.4.0 and Nuxt 4.6.1, on Bun 1.4.3 and headless Chromium 151. Each figure is the median of three runs of the whole bench. Within a run, page loads are medians of 10 cold loads, table operations medians of 10 runs after 2 warmups, and server rendering is measured in-process by mitata. Next.js sits that one out: it serves only through its own HTTP server, so its renders would carry a socket round trip the others never pay. Builds are clean production builds, Next.js's including the type check it runs and the others skip; their size is what each deploys, without the dependencies it runs on or source maps. Code is counted in characters other than whitespace and comments: pages, layouts, components and config, not the file mounting each app in the bench. Formatted by Prettier, cloc 2.10 counts Nuxt 122 lines, Svelte 130, Astro 175, SolidJS 182 and Next.js 211.

</Note>

## A site, built by a coding agent

The question is simple: when a coding agent builds a site, what does the framework cost it? Tokens, time, turns, docs read, check errors, lines of code. A framework an agent writes cheaply and correctly is one I can hand work to.

### The site

Every run builds Bookshelf, a small catalog of classic books, from one spec that only changes the framework's name:

- 8 books as Markdown files with a frontmatter, read as a content collection, each rendered on its own page.
- A books list with a tag filter that runs in the browser, and a favorite button whose state survives a reload in `localStorage`.
- A contact form checked on the server and in the browser, which also works with JavaScript turned off.
- A shared layout, an about page, and a real 404 with its status code.

Every text the tests look for is given word for word, so a run cannot fail on a typo of mine, only on its own. Styling is free and not graded.

### The hidden tests

A run is graded by a Playwright suite the agent never sees: 11 tests driving headless Chromium, run once per page or book where it applies. They check the layout and its current link, the top rated books in order, the list and its filter, every book page, favorites across a reload, the form with and without JavaScript, and the 404.

A suite is only as good as what it was proven against, so it also runs against a reference site built with Bun alone, no framework at all. If the reference fails, the suite is wrong, not the frameworks.

### The starters and their docs

Each run starts from the framework's own scaffolder, as minimal as it gets while still having a server for the form: `sv create --template minimal` with the Node adapter, SolidStart 2's `basic`, `create-astro --template minimal` with the Node adapter, `create-nuxt --template minimal` with no modules, `create-next-app --empty` with the App Router. I only touch their scripts, so that `bun run check`, `bun run build` and `bun run start` mean the same thing everywhere, and add the `vue-tsc` and TypeScript 6 that Nuxt's check needs. Each `check` stays the starter's own, failing on errors only.

The docs sit offline in the project, since the prompt allows no network but `bun add`. They differ in kind as much as in size: SvelteKit's, SolidStart's and Nuxt's are the pages their `llms.txt` links, 3.4, 0.8 and 7.8 MB. Next.js's are the Markdown of the pages its `llms.txt` links, 3.1 MB, plus the docs in its package, which the `AGENTS.md` its scaffolder writes points to. Astro dropped its `llms.txt`, so its docs are the Markdown source of its site, 3.0 MB in 424 files.

### Keeping the runs apart

Each run is one headless Claude Code session, `claude -p --safe-mode`: no CLAUDE.md, no hooks, no plugins, no MCP servers, and an empty config directory of its own. It runs under bubblewrap, which hides my workspace, my Claude config and transcripts, the other runs, the reference site and the test browsers, with a private `/tmp` and process list. So the agent cannot peek at the tests, copy a previous run, or check its work in a browser: `check`, the build and its own reasoning are all it has.

Once the agent stops, the grader runs `bun run check` and `bun run build`, starts the site with `bun run start` on a given port, and runs the suite against it. A run passes when all three pass.

The harness alternates runs between frameworks, in a rotated order, so a slow hour on the API lands on everyone alike, but each sitting here covers only some of them: SvelteKit, SolidStart and Astro together, then Nuxt and Next.js one after the other, so time is the measure to read with the most salt. The report also lists what the grade does not catch: in 24 of 25 runs the agent reached for `python`, `node` or another package manager despite the prompt asking for Bun only, up to 16 times in one Nuxt run, and every SvelteKit run edited its `start` script, a grading input worth reading before trusting the result.

### Probe first

A full sitting is 5 runs per framework, so a mistake in the harness costs 25 runs. Each change starts with a probe instead: one run of one framework under a throwaway label, its results and transcript read, then the next framework. A probe costs about a dollar. Next.js's probe failed on the suite, not on its site: the favorites test waited for the network to go idle after a reload, which Next's router never lets happen on a second visit, so the suite now opens each visit in a fresh browser context carrying the cookies and storage over.

<Stats items={[{"value":"25 of 25","label":"runs passing every check and test"},{"value":"$39.93","label":"all 25 runs at API prices"}]} />

### Results

Each chart shows the median run of each framework, with the lowest and highest beside it.

<BarChart title="Tokens written, thinking included" unit="K tokens" better="lower" digits={1} rows={[{"label":"Astro","value":17,"range":[15.8,23.9]},{"label":"SvelteKit","value":25.3,"range":[21.1,36.6]},{"label":"Nuxt","value":28.7,"range":[20.1,36.2]},{"label":"Next.js","value":29.7,"range":[24.4,46.6]},{"label":"SolidStart","value":33.9,"range":[32.2,44.6]}]} bench="llm" />

<BarChart title="Time to build the site" unit="min" better="lower" digits={1} rows={[{"label":"Astro","value":2.6,"range":[2.5,3.6]},{"label":"SvelteKit","value":4.5,"range":[3.3,12.4]},{"label":"Next.js","value":5.9,"range":[4.8,8.5]},{"label":"Nuxt","value":7.9,"range":[4.3,9.5]},{"label":"SolidStart","value":9.3,"range":[6.5,12.9]}]} bench="llm" />

Styling is free and not graded, so the line counts leave styles out: 77 to 113 lines in the median runs.

<BarChart title="Lines of code written, tests and styles left out" unit="lines" better="lower" digits={0} rows={[{"label":"Nuxt","value":444,"range":[437,476]},{"label":"Astro","value":463,"range":[440,491]},{"label":"SvelteKit","value":472,"range":[455,518]},{"label":"SolidStart","value":537,"range":[523,549]},{"label":"Next.js","value":616,"range":[537,636]}]} bench="llm" />

<BarChart title="Cost of the site, API prices" unit="USD" better="lower" digits={2} rows={[{"label":"Astro","value":0.78,"range":[0.75,1.12]},{"label":"Nuxt","value":1.46,"range":[0.91,1.8]},{"label":"SvelteKit","value":1.52,"range":[1.23,2.22]},{"label":"Next.js","value":1.87,"range":[1.37,2.85]},{"label":"SolidStart","value":1.94,"range":[1.86,2.79]}]} bench="llm" />

<BarChart title="Thinking tokens" unit="K tokens" better="lower" digits={1} rows={[{"label":"Astro","value":4.3,"range":[3.5,5.7]},{"label":"SvelteKit","value":8.5,"range":[8,13.3]},{"label":"Nuxt","value":10.2,"range":[7.5,13.8]},{"label":"Next.js","value":10.6,"range":[8.8,20.7]},{"label":"SolidStart","value":11.5,"range":[9.7,15.6]}]} bench="llm" />

<BarChart title="Turns" unit="turns" better="lower" digits={0} rows={[{"label":"Astro","value":24,"range":[21,31]},{"label":"SvelteKit","value":40,"range":[30,51]},{"label":"Nuxt","value":47,"range":[30,56]},{"label":"Next.js","value":50,"range":[38,72]},{"label":"SolidStart","value":53,"range":[45,74]}]} bench="llm" />

<BarChart title="Docs read" unit="K characters" digits={0} rows={[{"label":"Nuxt","value":14,"range":[8,22]},{"label":"Astro","value":29,"range":[8,38]},{"label":"SolidStart","value":52,"range":[26,64]},{"label":"Next.js","value":84,"range":[70,114]},{"label":"SvelteKit","value":89,"range":[49,103]}]} bench="llm" />

<BarChart title="Largest context of one call" unit="K tokens" better="lower" digits={1} rows={[{"label":"Astro","value":45,"range":[43.1,58.9]},{"label":"Nuxt","value":67,"range":[48.4,91.2]},{"label":"SvelteKit","value":80.1,"range":[73.7,106.6]},{"label":"Next.js","value":90,"range":[71.2,120.1]},{"label":"SolidStart","value":91.7,"range":[84.7,114.1]}]} bench="llm" />

<Note title="How it was measured">

Claude Opus 5.5 at high effort, Claude Code 2.1.289, SvelteKit 3.0.1, SolidStart 2.0.6, Astro 7.3.8, Nuxt 4.6.1, Next.js 16.4.2, all on Bun, 5 runs each, Nuxt's and Next.js's six days after the others'. Every figure is the median of the passing runs, and all 25 passed. Cost is at API prices, as Claude Code reports it. The spec, the prompt, the starters, the suite and every run are in [bench/llm](https://github.com/Kayno0o/devlog/blob/main/bench/llm/results/full-opus-1.51/results.md).

</Note>
