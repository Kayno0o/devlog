---
title: "kayjs: fast to run, easy to write"
description: Why I built my own web framework on Bun, how a .kay file becomes HTML and islands, and what it costs next to SolidJS, Svelte and Astro.
date: 2026-10-09
tags: [kay, benchmarks]
draft: true
---

Yes, another JavaScript framework. In my defense, it is the one I wanted to use.

kay runs on Bun and Elysia. A `.kay` file is one component: TypeScript fences, then a pug-like indented template. Pages render to plain HTML on the server, and only the interactive parts, the islands, ship JavaScript. It is still experimental, so expect breaking changes for a while.

## What a component looks like

The same page in kay and in the three it borrows from, each passing its own checker:

<Tabs label="One page in four frameworks">

<Tab group="component" label="kay" checked>

```kay
--- server
const greeting = 'Hello from the server'
--- script
const count = signal(0)
---
h1 {greeting}
button(onClick={() => count++}) Clicked {count} times
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

```tsx
import { createSignal } from 'solid-js'

export default function Counter() {
  const [count, setCount] = createSignal(0)

  return (
    <button onClick={() => setCount(count() + 1)}>
      Clicked {count()} times
    </button>
  )
}
```

```astro
---
import Counter from '../components/Counter'

const greeting = 'Hello from the server'
---
<h1>{greeting}</h1>
<Counter client:load />
```

The server part renders as in kay. Astro leaves state in the browser to a component of another framework, here SolidJS, in a file of its own and hydrated as an island.

</Tab>

</Tabs>

## Why I built it

I care about speed everywhere: how fast a page loads and runs, how fast the server answers, how fast a build or a test run finishes, and how little the server needs, in memory and in what it takes to deploy.

I also care about how much code it takes. I have two apps of my own, one in SvelteKit at about 27,000 lines and one in SolidJS at about 34,000, blanks and comments left out: at that size, every line a framework saves is one less to write, read and keep working. Neither is migrated to kay yet, and that will get its own post.

For a while I used Astro with SolidJS inside: fast pages for little code, at the price of two frameworks and two ways to write a component in one project. SvelteKit, SolidStart and Astro also all build on Vite, which sometimes makes builds and unit tests slow. kay is what I built to have it all in one place, built and tested by Bun alone. It mixes what I liked in each:

- **Astro**: the TypeScript fence on top, islands as the only JavaScript a page ships, content collections.
- **pug**: indented templates with no closing tags. I loved pug long ago and never saw a framework support it. It is short to write, quick to read, and fewer tokens for an agent.
- **SolidJS**: signals and fine-grained updates, no virtual DOM.
- **Svelte and SvelteKit**: a compiler doing the work ahead of time, file-based routes with layouts, typed form actions.

## How it works

1. The compiler reads a `.kay` file once and emits two twins: an HTML string builder for the server and a DOM builder for the browser.
2. The server renders every page to a string. A static page gets no markers and no script.
3. An island renders on the server with hydration markers, then claims those nodes in the browser instead of rendering again.
4. `kay build --static` writes the whole site as files, like this devlog, served by plain nginx.

Bun does everything underneath: the server, the bundler, the test runner and the database driver, and a whole site compiles into a single executable. Every build type-checks the project first, templates included, so a broken prop or a mistyped link never ships.

## A synthetic bench

The same products page, the same data and the same Elysia server for each framework, each written the way its own docs and its js-framework-benchmark entry write it. Every bench in this post ran on one desktop, a Ryzen 5 7600 with 12 threads on Linux.

### What kay gains

<BarChart title="Main-thread script on load, products page" unit="ms" better="lower" rows={[{"label": "kay", "value": 0.3}, {"label": "SolidJS", "value": 12.0}, {"label": "Svelte", "value": 15.7}]} bench="synthetic" />

kay hydrates its islands only. SolidJS and Svelte hydrate the whole page, so they also send its data again as JSON.

<BarChart title="HTML sent, products page, gzip" unit="KB" better="lower" rows={[{"label": "kay", "value": 8.2}, {"label": "Svelte", "value": 15.7}, {"label": "SolidJS", "value": 21.6}]} bench="synthetic" />

<BarChart title="Server rendering, products page" unit="renders/s" better="higher" digits={0} rows={[{"label": "kay", "value": 4185}, {"label": "Svelte", "value": 3684}, {"label": "SolidJS", "value": 1685}]} bench="synthetic" />

### What kay loses

<BarChart title="JS shipped, table page, gzip" unit="KB" better="lower" rows={[{"label": "SolidJS", "value": 8.2}, {"label": "kay", "value": 11.2}, {"label": "Svelte", "value": 22.5}]} bench="synthetic" />

SolidJS ships less JavaScript. kay's includes its in-place page navigation, which the Solid app, having no router, does without.

<BarChart title="Create 1,000 rows" unit="ms" better="lower" rows={[{"label": "SolidJS", "value": 30.8}, {"label": "Svelte", "value": 32.4}, {"label": "kay", "value": 33.9}]} bench="synthetic" />

On the whole table benchmark, kay is within 11% of the fastest on every operation, and first on replacing and appending 1,000 rows and on selecting a row. It is last on creating rows, by 5% on 1,000 and 7% on 10,000, on swapping rows, by 4%, and on updating every 10th row, by 5%.

<Note title="How it was measured">

kay 1.28.0, solid-js 1.9.15 and Svelte 5.57.1, on Bun 1.4.4 and headless Chromium 151. Each figure is the median of three runs of the whole bench. Within a run, page loads are medians of 10 cold loads, table operations medians of 10 runs after 2 warmups, and server rendering is measured in-process by mitata. Every table and its notes are in kay's [bench/results.md](https://github.com/Kayno0o/kayjs/blob/main/bench/results.md), and `bun run bench` in kay's repository runs it again.

</Note>

## A real site, ported from SvelteKit

A products table only goes so far, so I ported a real site from SvelteKit to kay: a home page and content pages, about 3,000 lines over 22 Svelte components. Both versions were measured in one sitting, runs interleaved, over loopback: the ratios carry over, the absolute numbers are optimistic.

### What kay gains

<Stats items={[{"value": "-87%", "label": "server CPU per visitor"}, {"value": "-55%", "label": "requests in home page"}, {"value": "-19%", "label": "Docker image"}, {"value": "-16%", "label": "lines of code"}]} />

<BarChart title="First paint on a phone, content page" unit="ms" better="lower" digits={0} rows={[{"label": "kay", "value": 408}, {"label": "SvelteKit", "value": 752}]} bench="sveltekit" source="Lighthouse Pixel 7 preset (slow 4G, 4x CPU), median of 3 runs" />

<BarChart title="Client JavaScript, brotli" unit="KB" better="lower" rows={[{"label": "kay", "value": 45.9}, {"label": "SvelteKit", "value": 70.1}]} bench="sveltekit" source="every file the build writes" />

A page loads only the part its islands need: 16 KB on a content page.

The home page is prerendered, and its contact form, the one part that differs per visitor, is a deferred server island: the browser fetches it about a screen before it scrolls into view, while kay serves the page itself from memory.

<BarChart title="Requests per second, home page" unit="req/s" better="higher" digits={0} rows={[{"label": "kay", "value": 37793}, {"label": "SvelteKit", "value": 790}]} bench="sveltekit" source="oha, 64 connections for 10 s, 2 rounds, kay's slower round" />

Most of that gap is prerendering, not rendering speed: when kay rendered the whole page per request, as SvelteKit does, it served it at about twice SvelteKit's rate.

<BarChart title="Build, cold caches" unit="s" better="lower" digits={2} rows={[{"label": "kay", "value": 3.04}, {"label": "SvelteKit", "value": 4.25}]} bench="sveltekit" source="hyperfine, median of 3 runs" />

Under load, kay peaks at 79 MiB of memory against SvelteKit's 136 to 142. The home page a phone downloads drops from 706 to 558 KB, mostly images: kay serves AVIF at the width drawn.

### What kay loses

<BarChart title="Server memory at rest" unit="MiB" better="lower" digits={0} rows={[{"label": "SvelteKit", "value": 42}, {"label": "kay", "value": 51}]} bench="sveltekit" source="RSS after start" />

- **The default is not the fast path.** The phone paint above needs `inlineStyles`, which is opt-in: with the stylesheet linked, as kay does by default, kay painted 85 to 140 ms behind SvelteKit. Inlining costs about 2 KB per page, and the stylesheet is no longer cached between pages.
- **Short pages with inlined styles.** Pages rendered per request carry the whole stylesheet, so kay serves them at 0.9 to 1.0 times SvelteKit's rate, for 1.1 to 1.2 times its CPU per request. With it linked, kay served them at 1.8 to 2.2 times SvelteKit's rate.

### In development

<BarChart title="First load of the home page, dev server" unit="ms" better="lower" digits={0} rows={[{"label": "kay", "value": 93}, {"label": "SvelteKit", "value": 2030}]} bench="sveltekit" source="headless Chromium, load event, median of 2 rounds" />

<BarChart title="Template edit to screen, dev server" unit="ms" better="lower" digits={0} rows={[{"label": "SvelteKit", "value": 38}, {"label": "kay", "value": 361}]} bench="sveltekit" source="file write to the page showing it, median of 14 edits" />

- **kay starts and loads faster.** It serves a bundled client, 19 requests for the home page against Vite's 166 modules, starts in 666 ms against 1,273 with cold caches, and holds 167 MiB against 488.
- **Vite applies edits sooner.** kay restarts its server on every edit, so a template or style change shows in about 360 ms against Vite's 40. It shows a server code edit in the same time with the page's state kept, which SvelteKit only shows after a manual reload.

<Note title="How it was measured">

kay 1.31.0 on Bun 1.4.4 canary, kay 1.32.0 for the dev server. Paints come from Playwright under Lighthouse's phone and desktop presets, median of 3 runs; builds from hyperfine, median of 3 cold runs; the server from oha, 10 s at 64 connections, two rounds. The site's code is private, so the record is [bench/sveltekit-port.md](https://github.com/Kayno0o/devlog/blob/main/bench/sveltekit-port.md), every figure with its conditions.

</Note>

## Two sites, ported from Astro

Two small business sites moved to kay from Astro: a cattery and a house painter. Each was built and served as it deploys, Astro's standalone server under Bun against kay's one executable, both behind nginx with HTTP/2, TLS and brotli.

### What kay gains

<Stats items={[{"value": "-32 to -37%", "label": "lines of code"}, {"value": "2.2 to 3.5x", "label": "faster cold start"}, {"value": "-27 to -85%", "label": "CSS per page"}]} />

<BarChart title="Requests per second, a content page" unit="req/s" better="higher" digits={0} rows={[{"label": "kay, painter", "value": 39805}, {"label": "kay, cattery", "value": 39322}, {"label": "Astro, cattery", "value": 12648}, {"label": "Astro, painter", "value": 11798}]} bench="astro" source="32 clients through nginx for 5 s" />

kay serves those pages prerendered and already compressed, so nginx spends about 20 µs on each instead of 470 to 540, and both sit near the load client's own ceiling of about 40,000 a second. Both sites load their contact form as a deferred server island, so every page but the cattery's home is prerendered.

<BarChart title="Server memory after load" unit="MB" better="lower" digits={0} rows={[{"label": "Astro, cattery", "value": 281}, {"label": "kay, cattery", "value": 144}, {"label": "Astro, painter", "value": 125}, {"label": "kay, painter", "value": 95}]} bench="astro" source="RSS after the load runs" />

<BarChart title="Deployed size" unit="MB" better="lower" digits={0} rows={[{"label": "Astro, painter", "value": 301}, {"label": "Astro, cattery", "value": 231}, {"label": "kay, cattery", "value": 109}, {"label": "kay, painter", "value": 98}]} bench="astro" source="dist and production node_modules against one executable" />

- **Lighter images**, served as AVIF at the width drawn: 55 against 143 KB and 36 against 161 KB per page on desktop, 115 against 143 KB and 105 against 185 KB on a phone.
- **Faster paints on the cattery**: on a phone, the largest paint lands at 1.78 s instead of 2.73 s, and a phone downloads 201 KB per page instead of 256.

### What kay loses

<BarChart title="JS shipped per page, brotli" unit="KB" better="lower" rows={[{"label": "Astro, painter", "value": 0.4}, {"label": "Astro, cattery", "value": 5.2}, {"label": "kay, cattery", "value": 13.1}, {"label": "kay, painter", "value": 13.1}]} bench="astro" source="average over every page" />

- **More JavaScript.** The painter's site shipped 0.4 KB on Astro, a few plain scripts inlined in its pages, and ships 13.1 KB on kay, mostly the runtime its islands and in-place navigation need; the cattery's goes from 5.2 to 13.1 KB.
- **A heavier painter site on phones.** A phone downloads 170 KB per page against 126 KB, mostly fonts (107 against 35 KB) and that script. Its largest paint lands about 70 ms later on a phone and 35 ms later on desktop.
- **Slower builds.** A clean `kay build` encodes an AVIF and a WebP copy of every image at each width, and type-checks, which `astro build` does not: 11.3 against 1.9 s on the cattery and 7.1 against 1.6 s on the painter, the cattery's build peaking at 1.9 GB against 1.1.

<Note title="How it was measured">

kay 1.28.0 on Bun 1.4.4, headless Chromium 151 and nginx 1.30.5 set up as in production, both sides in one sitting. Paints are medians of 5 cold loads per page under Lighthouse's throttling; load is 32 clients for 5 s per URL; builds are the median of 3 clean runs. The sites' code is private, so the record is [bench/astro-ports.md](https://github.com/Kayno0o/devlog/blob/main/bench/astro-ports.md), every figure with its conditions.

</Note>

## Built for LLMs too

kay is meant to be as easy for a coding agent to write as for me:

- One component format and one way to do each thing, so there is less to choose between and less to get wrong.
- Indented templates with no closing tags: fewer tokens to read and to write for the same page.
- Typed end to end, templates included: `kay check` points at the `.kay` line, so an agent fixes its own mistakes without a browser.
- The whole reference ships as `llms.txt` and one file per topic, read on demand instead of searched for.

To check that, Claude Opus 5.5 built the same small site in each framework: a book catalog read from Markdown files, a tag filter that runs in the browser, a favorite button, and a contact form checked on the server and in the browser that also works without JavaScript. Each run starts from the framework's own starter with its docs in the project, in a sandbox with no browser and no network, and a hidden suite of browser tests grades the site.

<Note title="The site kay's agent built, running">

<Embed src="/llm-bench/bookshelf/books" title="The Bookshelf site kay's agent built" />

</Note>

Filter its books, open one, mark it a favorite. It is the run of median cost, moved to the current kay and exported as static files, without its contact form, since that needs a server. Styling was free and not graded: kay's agents mostly wrote none, where the others wrote about a hundred lines of CSS every run, so the line counts below leave styles out.

### What kay gains

<Stats items={[{"value":"13K vs 17K to 34K","label":"tokens written, kay against the others"}]} />

<BarChart title="Time to build the site" unit="min" better="lower" digits={1} rows={[{"label":"kay","value":2.6,"range":[1.9,2.8]},{"label":"Astro","value":2.6,"range":[2.5,3.6]},{"label":"SvelteKit","value":4.5,"range":[3.3,12.4]},{"label":"SolidStart","value":9.3,"range":[6.5,12.9]}]} bench="llm" />

<BarChart title="Lines of code written, tests and styles left out" unit="lines" better="lower" digits={0} rows={[{"label":"kay","value":348,"range":[333,360]},{"label":"Astro","value":463,"range":[440,491]},{"label":"SvelteKit","value":472,"range":[455,518]},{"label":"SolidStart","value":537,"range":[523,549]}]} bench="llm" />

kay is the one framework the model had never seen: all it knows comes from the docs in the project. It still builds the site as fast as Astro and faster than the other two, in 25 to 35% fewer lines than any of them.

### What kay loses

<BarChart title="Cost of the site, API prices" unit="USD" better="lower" digits={2} rows={[{"label":"Astro","value":0.78,"range":[0.75,1.12]},{"label":"kay","value":0.95,"range":[0.88,1.11]},{"label":"SvelteKit","value":1.52,"range":[1.23,2.22]},{"label":"SolidStart","value":1.94,"range":[1.86,2.79]}]} bench="llm" />

<BarChart title="Docs read" unit="K characters" digits={0} rows={[{"label":"Astro","value":29,"range":[8,38]},{"label":"SolidStart","value":52,"range":[26,64]},{"label":"SvelteKit","value":89,"range":[49,103]},{"label":"kay","value":96,"range":[83,116]}]} bench="llm" />

Astro builds the site for less. The model already knows Astro, while it learns kay from its docs, reading three times as much, and every call after those reads pays for them again. kay still costs less than SvelteKit and SolidStart, which the model knows too.

<Note title="How it was measured">

kay 1.27.0, its runs a few hours after the others, with the same model and Claude Code. Each run is one headless Claude Code session, Opus 5.5 at high effort, with no project instructions, hooks or plugins, in a fresh copy of the framework's starter under bubblewrap, so it cannot see the tests, the other runs or anything else on the machine. A run passes when the starter's own `check`, the build and every acceptance test pass; every framework passed all 5 of its runs, and every figure is the median of those runs. Cost is at API prices, as Claude Code reports it. The spec, the prompt, the starters and every run are in [bench/llm](https://github.com/Kayno0o/devlog/blob/main/bench/llm/results/full-opus-1.27/results.md).

</Note>

## Should you use it?

For a side project, a personal site or a small business site, if you like what you saw above: go for it, and tell me what breaks. For anything you would be paged for at night, not yet. kay is a one-person project, it has no ecosystem to speak of, and a minor version may still break your code: the tilde in its version range is there for a reason. Read the changelog before every bump, or enjoy the surprise.

## Try it

kay is published to my own registry, not npm. Tell Bun where the `@kaynooo` scope lives once, in `~/.bunfig.toml`:

```toml
[install.scopes]
"@kaynooo" = "https://git.kaynooo.fr/api/packages/kaynooo/npm/"
```

Then start a project:

```sh
bunx -p @kaynooo/kayjs kay new my-app
cd my-app
bun install
bun run dev
```

The docs are at [kayjs.kaynooo.fr](https://kayjs.kaynooo.fr), and the code, issues and questions on [GitHub](https://github.com/Kayno0o/kayjs).
