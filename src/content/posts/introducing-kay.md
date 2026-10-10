---
title: kay, a Bun web framework built to be fast to run and fast to write
description: Why I built my own framework, how a .kay file becomes HTML and islands, and what it costs next to SolidJS, Svelte and Astro.
date: 2026-10-09
tags: [kay, benchmarks]
draft: true
---

kay is a web framework on Bun and Elysia. A `.kay` file is one component: TypeScript fences, then a pug-like indented template. Pages render to plain HTML on the server, and only the interactive parts, the islands, ship JavaScript.

## What a component looks like

The same page in kay and in the three it borrows from, each passing its own checker:

<Tabs label="One page in four frameworks">

<Tab group="component" label="kay" checked>

```kay
--- server
const greeting = 'Hello from the server'
---
---
const count = signal(0)
---
h1 {greeting}
button(onClick={() => count.set(count + 1)}) Clicked {count} times
```

The first fence runs on the server only, the second also in the browser, and the template reads both.

</Tab>

<Tab group="component" label="SvelteKit">

```ts
export function load() {
  return { greeting: 'Hello from the server' }
}
```

```svelte
<script lang="ts">
  let { data } = $props()
  let count = $state(0)
</script>

<h1>{data.greeting}</h1>
<button onclick={() => count++}>Clicked {count} times</button>
```

The server data lives in a second file, `+page.server.ts`, which the page receives as `data`.

</Tab>

<Tab group="component" label="SolidStart">

```tsx
import { createAsync, query } from '@solidjs/router'
import { createSignal } from 'solid-js'

const getGreeting = query(async () => {
  'use server'
  return 'Hello from the server'
}, 'greeting')

export default function Counter() {
  const greeting = createAsync(() => getGreeting())
  const [count, setCount] = createSignal(0)

  return (
    <>
      <h1>{greeting()}</h1>
      <button onClick={() => setCount(count() + 1)}>
        Clicked {count()} times
      </button>
    </>
  )
}
```

The server part is marked `'use server'` and read back asynchronously.

</Tab>

<Tab group="component" label="Astro">

```astro
---
const greeting = 'Hello from the server'
---
<h1>{greeting}</h1>
<button>Clicked <span>0</span> times</button>

<script>
  const count = document.querySelector('button span')!
  document.querySelector('button')!.addEventListener('click', () => {
    count.textContent = String(Number(count.textContent) + 1)
  })
</script>
```

The server part renders as in kay, but Astro keeps no state in the browser: the counter is DOM code in a script, or a component of another framework, such as SolidJS, in a file of its own.

</Tab>

</Tabs>

## Why I built it

I care about speed everywhere: how fast a page loads and runs, how fast the server answers, and how fast a build or a test run finishes. And about how little the server needs: the memory it holds and what it takes to deploy.

And about how much code it takes. My personal dashboard's SvelteKit front-end is about 27,000 lines of code, and the SolidJS dashboard of my modpack server about 34,000, blanks and comments left out. At that size, every line a framework saves is one less to write, read and keep working.

I love how fast SolidJS and Svelte run, but I don't like Svelte's syntax, and SolidJS has no static export and no server rendering. Astro renders on the server, but has nothing easy for dynamic components or pages unless you bring in SolidJS.

So Astro with SolidJS inside was my main choice for a while: fast pages for the least code possible. SolidJS was still missing server rendering, though, and kay is what I built to have it all in one place.

I also wanted to leave Vite behind: SvelteKit, SolidStart and Astro all build on it, and it sometimes makes builds and unit tests slow. kay builds and tests with Bun alone, and gets Bun's speed at both.

## Where it comes from

kay is a mix of what I liked in other tools, in one file format:

- **Astro**: the TypeScript fence on top of the component, islands as the only JavaScript a page ships, and content collections.
- **pug**: indented templates with no closing tags. I found pug a long time ago and loved it, but never saw a framework support it, Astro included. It is short to write and quick to read, and that compactness also means fewer tokens for an agent to read and write.
- **SolidJS**: signals and fine-grained updates, with no virtual DOM.
- **Svelte and SvelteKit**: a compiler that does the work ahead of time, file-based routes with layouts, and typed form actions.

## How it works

1. The compiler reads a `.kay` file once and emits two twins: an HTML string builder for the server and a DOM builder for the browser.
2. The server renders every page to a string. A static page gets no markers and no script.
3. An island renders on the server with hydration markers, then claims those nodes in the browser instead of rendering again.
4. `kay build --static` writes the whole site as files, like this devlog, served by plain nginx.

## A synthetic bench

The same products page, the same data and the same Elysia server for each framework, from kay's own bench. Each one is written the way its own docs and its js-framework-benchmark entry write it. Every bench in this post ran on one desktop, a Ryzen 5 7600 with 12 threads on Linux.

<BarChart title="Main-thread script on load, products page" unit="ms" better="lower" rows={[{"label": "kay", "value": 0.4}, {"label": "SolidJS", "value": 12.4}, {"label": "Svelte", "value": 15.6}]} bench="synthetic" />

kay hydrates its islands only. SolidJS and Svelte hydrate the whole page, so they also send its data again as JSON.

<BarChart title="HTML sent, products page, gzip" unit="KB" better="lower" rows={[{"label": "kay", "value": 8.1}, {"label": "Svelte", "value": 15.6}, {"label": "SolidJS", "value": 21.6}]} bench="synthetic" />

<BarChart title="Server rendering, products page" unit="renders/s" better="higher" digits={0} rows={[{"label": "kay", "value": 4788}, {"label": "Svelte", "value": 3853}, {"label": "SolidJS", "value": 1754}]} bench="synthetic" />

<Note title="How it was measured">

Bun 1.4.2 and headless Chromium 151. Page loads are medians of 10 cold loads, table operations medians of 10 runs after 2 warmups, and server rendering is measured in-process by mitata. Every table and its notes are in kay's [bench/results.md](https://github.com/Kayno0o/kayjs/blob/main/bench/results.md), and `bun run bench` in kay's repository runs it again.

</Note>

## A real site, ported from SvelteKit

Benchmarks of a products table only go so far, so I ported a real site from SvelteKit to kay: a home page and content pages, about 3,000 lines of code over 22 Svelte components. Both versions were measured in one sitting, runs interleaved, over loopback: the ratios carry over, the absolute numbers are optimistic.

<Stats items={[{"value": "0.25 vs 1.63 ms", "label": "server CPU per visitor"}, {"value": "26 vs 65", "label": "requests to load the home page"}, {"value": "184 vs 228 MB", "label": "Docker image"}, {"value": "2,590 vs 3,037", "label": "lines of code"}]} />

<BarChart title="First paint on a phone, content page" unit="ms" better="lower" digits={0} rows={[{"label": "kay", "value": 424}, {"label": "SvelteKit", "value": 752}]} bench="sveltekit" source="Lighthouse Pixel 7 preset (slow 4G, 4x CPU), median of 3 runs" />

<BarChart title="Client JavaScript, brotli" unit="KB" better="lower" rows={[{"label": "kay", "value": 16.6}, {"label": "SvelteKit", "value": 70.1}]} bench="sveltekit" />

The home page is prerendered, and its contact form, the one part that differs per visitor, is a deferred server island: the browser fetches it about a screen before it scrolls into view. kay serves the page itself from memory.

<BarChart title="Requests per second, home page" unit="req/s" better="higher" digits={0} rows={[{"label": "kay", "value": 14332}, {"label": "SvelteKit", "value": 760}]} bench="sveltekit" source="oha, 64 connections for 10 s, 2 rounds, kay's slower round" />

<BarChart title="Build, cold caches" unit="s" better="lower" digits={2} rows={[{"label": "kay", "value": 2.38}, {"label": "SvelteKit", "value": 3.68}]} bench="sveltekit" source="hyperfine, 3 runs" />

Under load, kay peaks at 85 MiB of memory against SvelteKit's 134. The home page a phone downloads drops from 706 to 552 KB, mostly images: kay serves AVIF at the width drawn.

<Note title="How it was measured">

Bun 1.4.3 canary. Paints come from Playwright under Lighthouse's phone and desktop presets, median of 3 runs; builds from hyperfine, 3 cold runs; the server from oha, 10 s at 64 connections, two rounds. The site's code is private, so the record is [bench/sveltekit-port.md](https://github.com/Kayno0o/devlog/blob/main/bench/sveltekit-port.md), every figure with its conditions.

</Note>

## Two sites, ported from Astro

Two small business sites moved to kay from Astro: a cattery and a house painter. Each was built and served as it deploys, Astro's standalone server under Bun against kay's one executable, both behind nginx with HTTP/2, TLS and brotli.

<Stats items={[{"value": "-32 to -37%", "label": "lines of code"}, {"value": "2.0 to 3.6x", "label": "faster cold start"}, {"value": "-27 to -85%", "label": "CSS per page"}]} />

<BarChart title="Requests per second, a content page" unit="req/s" better="higher" digits={0} rows={[{"label": "kay, painter", "value": 34994}, {"label": "kay, cattery", "value": 31202}, {"label": "Astro, cattery", "value": 12523}, {"label": "Astro, painter", "value": 11376}]} bench="astro" source="32 clients through nginx for 5 s" />

kay serves those pages prerendered and already compressed, so nginx spends about 25 µs on each instead of 470 to 540. Both sites load their contact form as a deferred server island, so every page but the cattery's home is prerendered.

<BarChart title="Server memory after load" unit="MB" better="lower" digits={0} rows={[{"label": "Astro, cattery", "value": 283}, {"label": "kay, cattery", "value": 142}, {"label": "Astro, painter", "value": 134}, {"label": "kay, painter", "value": 104}]} bench="astro" source="RSS after the load runs" />

<BarChart title="Deployed size" unit="MB" better="lower" digits={0} rows={[{"label": "Astro, painter", "value": 301}, {"label": "Astro, cattery", "value": 231}, {"label": "kay, cattery", "value": 109}, {"label": "kay, painter", "value": 98}]} bench="astro" source="dist and production node_modules against one executable" />

- **Lighter images**, served as AVIF at the width drawn: 55 against 143 KB and 36 against 161 KB per page on desktop, 115 against 143 KB and 105 against 185 KB on a phone.
- **Faster paints on the cattery**: on a phone, the largest paint lands at 1.77 s instead of 2.73 s, and a phone downloads 197 KB per page instead of 256.

<Note title="How it was measured">

Bun 1.4.2, headless Chromium 151 and nginx 1.30.5 set up as in production. Sizes compare exactly; paints and throughput come from two sittings, so small gaps there are noise, and kay's throughput ran on a loaded machine, so it understates kay. Paints are medians of 5 cold loads per page under Lighthouse's throttling; load is 32 clients for 5 s per URL; builds are the median of 3 clean runs. The sites' code is private, so the record is [bench/astro-ports.md](https://github.com/Kayno0o/devlog/blob/main/bench/astro-ports.md), every figure with its conditions.

</Note>

## What comes with it

- **Bun underneath.** One fast runtime for the server, the bundler, the test runner and the database driver, and the whole site compiles into a single executable.
- **Builds check first.** `kay build` type-checks the whole project, templates included, before it bundles anything, so a broken prop or a mistyped link never ships. The port above still builds faster than it did on SvelteKit.

## Built for LLMs too

kay is meant to be as easy for a coding agent to write as for me:

- One component format and one way to do each thing, so there is less to choose between and less to get wrong.
- Indented templates with no closing tags: fewer tokens to read and to write for the same page.
- Typed end to end, templates included: `kay check` points at the `.kay` line, so an agent fixes its own mistakes without a browser.
- The whole reference ships as `llms.txt` and one file per topic, read on demand instead of searched for.

To check that, Claude Opus 5.5 built the same small site in each framework: a book catalog read from Markdown files, a tag filter that runs in the browser, a favorite button, and a contact form checked on the server and in the browser that also works without JavaScript. Each run starts from the framework's own starter with its docs in the project, in a sandbox with no browser and no network, and a hidden suite of browser tests grades the site.

<Tabs label="The books page each agent built">

<Tab group="site" label="kay" checked>

![The books page kay's agent built: a centered column with a header bar, the tag buttons and the list of books](/llm-bench/kay-3.jpg)

The one kay run of five that wrote CSS, 15 lines of it; the other four left the page unstyled.

</Tab>

<Tab group="site" label="SvelteKit">

![The books page SvelteKit's agent built: a centered column with a header bar, the tag buttons and the list of books](/llm-bench/sveltekit.jpg)

</Tab>

<Tab group="site" label="SolidStart">

![The books page SolidStart's agent built: a centered column with a header bar, the tag buttons and the list of books](/llm-bench/solidstart.jpg)

</Tab>

<Tab group="site" label="Astro">

![The books page Astro's agent built: a centered column on a warm background, the tag buttons and the list of books](/llm-bench/astro.jpg)

</Tab>

</Tabs>

Styling was left free and was not graded. kay's agents mostly wrote none, where the others wrote about a hundred lines of CSS every run, so the line counts below leave styles out.

<Stats items={[{"value":"15 of 15","label":"runs passing every check and test"},{"value":"14K vs 17K to 34K","label":"tokens written, kay against the others"}]} />

<BarChart title="Time to build the site" unit="min" better="lower" digits={1} rows={[{"label":"kay","value":2.1},{"label":"Astro","value":2.6},{"label":"SvelteKit","value":4.5},{"label":"SolidStart","value":9.3}]} bench="llm" />

<BarChart title="Lines of code written, tests and styles left out" unit="lines" better="lower" digits={0} rows={[{"label":"kay","value":335},{"label":"Astro","value":458},{"label":"SvelteKit","value":473},{"label":"SolidStart","value":534}]} bench="llm" />

kay is the one framework the model had never seen: all it knows comes from the docs in the project. It still builds the site fastest, in a quarter to a third fewer lines than the others.

<Note title="How it was measured">

Each run is one headless Claude Code session, Opus 5.5 at high effort, with no project instructions, hooks or plugins, in a fresh copy of the framework's starter under bubblewrap, so it cannot see the tests, the other runs or anything else on the machine. A run passes when the starter's own `check`, the build and every acceptance test pass, and every figure is the median of the passing runs. Cost is at API prices, as Claude Code reports it. The spec, the prompt, the starters and every run are in [bench/llm](https://github.com/Kayno0o/devlog/blob/main/bench/llm/results/full-opus/results.md).

</Note>

## Where kay loses

### In the browser

<BarChart title="JS shipped, table page, gzip" unit="KB" better="lower" rows={[{"label": "SolidJS", "value": 8.0}, {"label": "kay", "value": 9.7}, {"label": "Svelte", "value": 21.8}]} bench="synthetic" />

<BarChart title="JS shipped per page, brotli" unit="KB" better="lower" rows={[{"label": "Astro, painter", "value": 0.4}, {"label": "Astro, cattery", "value": 5.2}, {"label": "kay, cattery", "value": 10.3}, {"label": "kay, painter", "value": 10.4}]} bench="astro" source="average over every page" />

SolidJS ships 1.7 KB less on the synthetic table page, and the Astro sites shipped 0.4 and 5.2 KB per page where kay ships about 10: the painter's site was a few plain scripts inlined in its pages. Most of kay's is the runtime its islands need, plus about 2.3 KB of in-place page navigation, which the Solid app, having no router, does without.

<BarChart title="Update every 10th row of 1,000" unit="ms" better="lower" rows={[{"label": "Svelte", "value": 3.0}, {"label": "SolidJS", "value": 3.1}, {"label": "kay", "value": 3.6}]} bench="synthetic" />

On the rest of the table benchmark kay is within 20% of the fastest, and first on selecting a row and on creating 10,000 rows. It is last on partial updates and swaps: it replaces rows immutably under a keyed `for`, where Solid and Svelte write one signal per row.

### On a phone

- **The default is not the fast path.** The SvelteKit port's faster phone paint needs `inlineStyles`, which is opt-in: with the stylesheet linked, as kay does by default, kay painted 85 to 140 ms behind SvelteKit. Inlining costs about 2 KB per page and the stylesheet is no longer cached between pages.
- **A heavier painter site.** A phone downloads 167 KB per page against 126 KB on Astro, mostly fonts, 107 against 35 KB, and kay's script. Its largest paint lands about 100 ms later on a phone and 35 ms later on desktop.

### On the server and in builds

<BarChart title="Server memory at rest" unit="MiB" better="lower" digits={0} rows={[{"label": "SvelteKit", "value": 36}, {"label": "kay", "value": 61}]} bench="sveltekit" source="RSS after start" />

- **Short pages with inlined styles.** Pages rendered per request carry the whole stylesheet, so kay serves them at about SvelteKit's rate for 1.2 to 1.3 times its CPU per request. With it linked, kay served them at 1.8 to 2.2 times SvelteKit's rate.
- **Slower builds than Astro.** A clean `kay build` encodes an AVIF and a WebP copy of every image at each width, and type-checks, which `astro build` does not: 11.1 against 1.9 s on the cattery and 7.5 against 1.5 s on the painter, the cattery's build peaking at 1.9 GB against 1.1.

### With a coding agent

<BarChart title="Cost of the site, API prices" unit="USD" better="lower" digits={2} rows={[{"label":"Astro","value":0.79},{"label":"kay","value":1.03},{"label":"SvelteKit","value":1.53},{"label":"SolidStart","value":1.94}]} bench="llm" />

<BarChart title="Docs read" unit="K characters" digits={0} rows={[{"label":"Astro","value":30},{"label":"SolidStart","value":38},{"label":"kay","value":67},{"label":"SvelteKit","value":70}]} bench="llm" />

Astro's agent builds the books site for less. The model already knows Astro, while it learns kay from its docs, reading about twice as much, and every call after those reads pays for them again. kay still costs less than SvelteKit and SolidStart, which the model knows too.

## What is next

TODO
