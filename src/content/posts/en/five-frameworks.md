---
title: "Next.js, Nuxt, Astro, Svelte, Solid: benchmarked, then handed to an AI"
description: "The same app in five frameworks, timed in the browser, on the server and at build time. Then the same site built in each by a coding agent, on an expensive model and a cheaper one, and what it cost."
date: 2026-10-19
tags: [benchmarks, llm]
draft: false
---

Two questions about the same five frameworks. How fast are they once a page reaches a browser or a server? And what does it cost a coding agent to build a site with each? So, two benchmarks: a synthetic one, then one where an AI does the work. Everything ran on the same desktop, a Ryzen 5 7600 (12 threads) on Linux.

## How fast: one app in five frameworks

Each framework renders the same products page from the same data, written the way its own docs and its js-framework-benchmark entry would write it. SolidJS and Svelte run behind the same Elysia server, Astro and Nuxt through their own request handlers, and Next.js through its own HTTP server.

<BarChart title="Script time on load, products page" unit="ms" better="lower" rows={[{"label":"Astro","value":1.2},{"label":"Nuxt","value":5.3},{"label":"SolidJS","value":10.8},{"label":"Svelte","value":14.3},{"label":"Next.js","value":18.8}]} bench="syntheticNeutral" />

Astro runs so little on load because it only hydrates its two Solid islands. SolidJS, Svelte and Nuxt hydrate the whole page, so they also ship its data a second time as JSON, and Next.js streams its component payload alongside the HTML.

<BarChart title="HTML sent, products page, gzip" unit="KB" better="lower" rows={[{"label":"Astro","value":10.3},{"label":"Svelte","value":15.7},{"label":"SolidJS","value":21.6},{"label":"Nuxt","value":23.5},{"label":"Next.js","value":23.6}]} bench="syntheticNeutral" />

<BarChart title="Server rendering, products page" unit="renders/s" better="higher" digits={0} rows={[{"label":"Svelte","value":3886},{"label":"Astro","value":1822},{"label":"SolidJS","value":1748},{"label":"Nuxt","value":588}]} bench="syntheticNeutral" />

<BarChart title="Code written, products and table pages" unit="K characters" better="lower" digits={1} rows={[{"label":"Nuxt","value":2.9},{"label":"Svelte","value":3.3},{"label":"Astro","value":3.4},{"label":"SolidJS","value":3.7},{"label":"Next.js","value":4.1}]} bench="syntheticNeutral" source="whitespace and comments left out, as is the bench's server glue" />

Code is counted in characters, since a line count mostly measures the formatter: Prettier turns the Svelte app's 70 lines into 130.

<BarChart title="Production build time" unit="s" better="lower" digits={2} rows={[{"label":"Svelte","value":0.09},{"label":"SolidJS","value":0.14},{"label":"Astro","value":0.6},{"label":"Nuxt","value":1.97},{"label":"Next.js","value":2.15}]} bench="syntheticNeutral" />

<BarChart title="Build size, gzip" unit="KB" better="lower" rows={[{"label":"SolidJS","value":8.2},{"label":"Svelte","value":22.5},{"label":"Astro","value":138.1},{"label":"Next.js","value":328.9},{"label":"Nuxt","value":610.7}]} bench="syntheticNeutral" source="SolidJS and Svelte bundle no server" />

<BarChart title="JS shipped, table page, gzip" unit="KB" better="lower" rows={[{"label":"SolidJS","value":8.2},{"label":"Astro","value":9.6},{"label":"Svelte","value":22.5},{"label":"Nuxt","value":71.8},{"label":"Next.js","value":134.3}]} bench="syntheticNeutral" />

Astro's island is the very same Solid table as the SolidJS app, and neither ships a router.

<BenchTable title="Table operations" unit="ms" columns={["SolidJS","Svelte","Astro","Next.js","Nuxt"]} rows={[{"label":"Create 1,000 rows","values":[26.6,26.8,26.5,29.8,26.9]},{"label":"Replace 1,000 rows","values":[24.5,25.8,24.4,30.3,27.8]},{"label":"Update every 10th row","values":[2.7,2.8,2.7,4,3.5]},{"label":"Select a row","values":[0.3,1,0.3,1.2,0.6]},{"label":"Swap two rows","values":[2.1,2.1,2,20.6,2.5]},{"label":"Remove a row","values":[2,2.2,1.9,3.3,4.5]},{"label":"Create 10,000 rows","values":[228,231,239,363,267]},{"label":"Append 1,000 rows","values":[23.4,23.9,23.4,26.9,25.4]},{"label":"Clear 1,000 rows","values":[2.7,3.2,2.7,5,4.1]}]} bench="syntheticNeutral" />

<Note title="How it was measured">

solid-js 1.9.15, Svelte 5.57.1, Astro 7.3.8, Next.js 16.4.0 and Nuxt 4.6.1, on Bun 1.4.3 and headless Chromium 151. Each figure is the median of three full runs of the bench. Within a run, a page load is the median of 10 cold loads, a table operation the median of 10 runs after 2 warmups, and server rendering is measured in-process by mitata. Next.js sits that one out: it only serves through its own HTTP server, so each render would pay a network round trip the others don't. Builds are clean production builds, Next.js's including the type check it runs and the others skip. Their size is what each one deploys, without its runtime dependencies or source maps. Code is counted in characters, whitespace and comments left out: pages, layouts, components and config, not the file plugging each app into the bench. Formatted by Prettier, cloc 2.10 counts 122 lines for Nuxt, 130 for Svelte, 175 for Astro, 182 for SolidJS and 211 for Next.js.

</Note>

## Handing the same site to an AI

The second question: when a coding agent builds a site, what does the framework cost it? In tokens, time, turns, docs read, failed checks and lines of code. A framework an agent writes cheaply and correctly is one I can hand work to.

### The site

Every run builds Bookshelf, a small catalog of classic books, from one spec where only the framework's name changes:

- 8 books as Markdown files with frontmatter, read as a content collection, each on its own page.
- A book list with a tag filter that runs in the browser, and a favorite button whose state survives a reload through `localStorage`.
- A contact form validated on the server and in the browser, which also works with JavaScript off.
- A shared layout, an about page and a real 404, status code included.

Every text the tests look for is given word for word, so a run can only fail on its own typos, not mine. Styling is free and not graded.

### The hidden tests

A run is graded by a Playwright suite the agent never sees: 11 tests driving headless Chromium, repeated for each page or book where it applies. They check the layout and its active link, the top rated books in order, the list and its filter, every book page, favorites across a reload, the form with and without JavaScript, and the 404.

A test suite is only as good as what it was checked against, so this one also runs against a reference site built with Bun alone, no framework at all. If the reference fails, the suite is wrong, not the frameworks.

### The starters and their docs

Each run starts from the framework's own scaffolder, in its most minimal form that still has a server for the form: `sv create --template minimal` with the Node adapter, SolidStart 2's `basic`, `create-astro --template minimal` with the Node adapter, `create-nuxt --template minimal` with no modules, `create-next-app --empty` with the App Router. I only touch their scripts, so that `bun run check`, `bun run build` and `bun run start` do the same thing everywhere, and add the `vue-tsc` and TypeScript 6 that Nuxt's check needs. Each `check` stays the starter's own and only fails on errors.

The docs are copied offline into the project, since the prompt allows no network except `bun add`. They vary in kind as much as in size: for SvelteKit, SolidStart and Nuxt, the pages their `llms.txt` links, 3.4, 0.8 and 7.8 MB. For Next.js, the Markdown of the pages its `llms.txt` links, 3.1 MB, plus the docs in its package, which the `AGENTS.md` its scaffolder writes points to. Astro dropped its `llms.txt`, so its docs are the Markdown source of its site, 3.0 MB in 424 files.

### Each run sealed off

Each run is one headless Claude Code session, `claude -p --safe-mode`: no CLAUDE.md, no hooks, no plugins, no MCP servers, and an empty config directory of its own. It runs under bubblewrap, which hides my workspace, my Claude config and transcripts, the other runs, the reference site and the test browsers, with its own `/tmp` and process list. So the agent cannot peek at the tests, copy a previous run or check its work in a browser: all it has is `check`, the build and its own reasoning.

Once the agent stops, the grader runs `bun run check` and `bun run build`, starts the site with `bun run start` on a given port, and runs the suite against it. A run passes when all three pass.

Runs alternate between frameworks in a rotating order, so a slow hour on the API hits everyone alike. Opus's sessions still covered only some of them, SvelteKit, SolidStart and Astro together, then Nuxt and Next.js six days later, so take its times with a pinch of salt; Sonnet's ran in one go. The report also flags what grading can't catch: in 24 of 25 Opus runs the agent reached for `python`, `node` or another package manager although the prompt asked for Bun only (16 times in one Nuxt run), against 4 of 25 for Sonnet, and every SvelteKit run of both models edited its `start` script, which the grader relies on.

### Trial runs first

A full session is 5 runs per framework, so a bug in the harness wastes 25 of them. Every change starts with a single trial run of one framework instead, its results and transcript read before moving on to the next. A trial costs about a dollar, and pays for itself: Next.js's failed, because of the suite rather than the site. The favorites test waited for the network to go idle after a reload, which Next's router never does on a second visit, so the suite now opens each visit in a fresh browser context that carries cookies and storage over. Sonnet's runs caught one more: the suite found form fields by their label's text, which takes in the text a server puts back in a textarea, so a working SolidStart site failed. It now finds them by their accessible name, and every Opus site still passes.

<Stats items={[{"value":"25 of 25","label":"Opus runs passing every check and test"},{"value":"22 of 25","label":"Sonnet runs passing every check and test"},{"value":"$39.93 vs $5.50","label":"all 25 runs, Opus against Sonnet, at API prices"}]} />

### Results

Opus 5.5 at high effort is the expensive end, so the same 25 runs went to Sonnet 5.5 at medium effort too, closer to what a team would use every day. Each chart shows each framework's median passing run, with its lowest and highest beside it.

Every Sonnet failure was a bug a browser would have shown at once, and the agent had none. Twice, SvelteKit's favorites store wrote its state while the page rendered, which Svelte refuses once the page hydrates, so the book list and book pages fell to the error page. Once, Astro's layout compared the path with `/about`, which a prerendered page sees as `/about/`, so no nav link was marked active.

<BarChart title="Tokens written, thinking included" unit="K tokens" better="lower" digits={1} rows={[{"label":"Astro","group":"Sonnet 5.5","value":5.8,"range":[5.5,6.2]},{"label":"Next.js","group":"Sonnet 5.5","value":7.1,"range":[6.3,9.6]},{"label":"Nuxt","group":"Sonnet 5.5","value":7.2,"range":[6.7,8.4]},{"label":"SolidStart","group":"Sonnet 5.5","value":10.5,"range":[9.6,15.6]},{"label":"SvelteKit","group":"Sonnet 5.5","value":12.7,"range":[12.7,13.2]},{"label":"Astro","group":"Opus 5.5","value":17,"range":[15.8,23.9]},{"label":"SvelteKit","group":"Opus 5.5","value":25.3,"range":[21.1,36.6]},{"label":"Nuxt","group":"Opus 5.5","value":28.7,"range":[20.1,36.2]},{"label":"Next.js","group":"Opus 5.5","value":29.7,"range":[24.4,46.6]},{"label":"SolidStart","group":"Opus 5.5","value":33.9,"range":[32.2,44.6]}]} bench="llmModels" />

<BarChart title="Time to build the site" unit="min" better="lower" digits={1} rows={[{"label":"Astro","group":"Sonnet 5.5","value":0.9,"range":[0.7,1.1]},{"label":"Next.js","group":"Sonnet 5.5","value":1.4,"range":[0.8,1.8]},{"label":"SolidStart","group":"Sonnet 5.5","value":1.8,"range":[1.5,3.5]},{"label":"Nuxt","group":"Sonnet 5.5","value":2.1,"range":[1.3,3.1]},{"label":"SvelteKit","group":"Sonnet 5.5","value":3.3,"range":[2.4,3.3]},{"label":"Astro","group":"Opus 5.5","value":2.6,"range":[2.5,3.6]},{"label":"SvelteKit","group":"Opus 5.5","value":4.5,"range":[3.3,12.4]},{"label":"Next.js","group":"Opus 5.5","value":5.9,"range":[4.8,8.5]},{"label":"Nuxt","group":"Opus 5.5","value":7.9,"range":[4.3,9.5]},{"label":"SolidStart","group":"Opus 5.5","value":9.3,"range":[6.5,12.9]}]} bench="llmModels" />

<BarChart title="Cost of the site, at API prices" unit="USD" better="lower" digits={2} rows={[{"label":"Astro","group":"Sonnet 5.5","value":0.12,"range":[0.11,0.13]},{"label":"Next.js","group":"Sonnet 5.5","value":0.15,"range":[0.14,0.21]},{"label":"Nuxt","group":"Sonnet 5.5","value":0.15,"range":[0.14,0.19]},{"label":"SolidStart","group":"Sonnet 5.5","value":0.23,"range":[0.22,0.43]},{"label":"SvelteKit","group":"Sonnet 5.5","value":0.38,"range":[0.37,0.39]},{"label":"Astro","group":"Opus 5.5","value":0.78,"range":[0.75,1.12]},{"label":"Nuxt","group":"Opus 5.5","value":1.46,"range":[0.91,1.8]},{"label":"SvelteKit","group":"Opus 5.5","value":1.52,"range":[1.23,2.22]},{"label":"Next.js","group":"Opus 5.5","value":1.87,"range":[1.37,2.85]},{"label":"SolidStart","group":"Opus 5.5","value":1.94,"range":[1.86,2.79]}]} bench="llmModels" />

The charts from here on are Opus's alone.

Styling was free and not graded, so line counts leave CSS out: 77 to 113 lines in the median runs.

<BarChart title="Lines of code written, tests and styles left out" unit="lines" better="lower" digits={0} rows={[{"label":"Nuxt","value":444,"range":[437,476]},{"label":"Astro","value":463,"range":[440,491]},{"label":"SvelteKit","value":472,"range":[455,518]},{"label":"SolidStart","value":537,"range":[523,549]},{"label":"Next.js","value":616,"range":[537,636]}]} bench="llm" />

<BarChart title="Thinking tokens" unit="K tokens" better="lower" digits={1} rows={[{"label":"Astro","value":4.3,"range":[3.5,5.7]},{"label":"SvelteKit","value":8.5,"range":[8,13.3]},{"label":"Nuxt","value":10.2,"range":[7.5,13.8]},{"label":"Next.js","value":10.6,"range":[8.8,20.7]},{"label":"SolidStart","value":11.5,"range":[9.7,15.6]}]} bench="llm" />

<BarChart title="Agent turns" unit="turns" better="lower" digits={0} rows={[{"label":"Astro","value":24,"range":[21,31]},{"label":"SvelteKit","value":40,"range":[30,51]},{"label":"Nuxt","value":47,"range":[30,56]},{"label":"Next.js","value":50,"range":[38,72]},{"label":"SolidStart","value":53,"range":[45,74]}]} bench="llm" />

<BarChart title="Docs read" unit="K characters" digits={0} rows={[{"label":"Nuxt","value":14,"range":[8,22]},{"label":"Astro","value":29,"range":[8,38]},{"label":"SolidStart","value":52,"range":[26,64]},{"label":"Next.js","value":84,"range":[70,114]},{"label":"SvelteKit","value":89,"range":[49,103]}]} bench="llm" />

<BarChart title="Largest context in one call" unit="K tokens" better="lower" digits={1} rows={[{"label":"Astro","value":45,"range":[43.1,58.9]},{"label":"Nuxt","value":67,"range":[48.4,91.2]},{"label":"SvelteKit","value":80.1,"range":[73.7,106.6]},{"label":"Next.js","value":90,"range":[71.2,120.1]},{"label":"SolidStart","value":91.7,"range":[84.7,114.1]}]} bench="llm" />

<Note title="How it was measured">

Claude Opus 5.5 at high effort and Claude Sonnet 5.5 at medium effort, Claude Code 2.1.289, SvelteKit 3.0.1, SolidStart 2.0.6, Astro 7.3.8, Nuxt 4.6.1 and Next.js 16.4.2, all on Bun, 5 runs each per model. Opus's Nuxt and Next.js runs came six days after its others, and Sonnet's all ran on 19 October. Every figure is the median of the passing runs. Cost is at API prices, as Claude Code reports it. The spec, the prompt, the starters, the suite and every run are in bench/llm: [Opus's runs](https://github.com/Kayno0o/devlog/blob/main/bench/llm/results/full-opus-1.51/results.md) and [Sonnet's](https://github.com/Kayno0o/devlog/blob/main/bench/llm/results/full-sonnet-medium/results.md).

</Note>
