---
title: "kayjs: fast to run, easy to write"
description: Why I built my own web framework on Bun, how a .kay file becomes HTML and islands, and what it costs next to SolidJS, Svelte, Astro, Next.js and Nuxt.
date: 2026-10-20
tags: [kay, benchmarks]
draft: true
---

Yes, another JavaScript framework. In my defense, it is the one I wanted to use.

kay runs on Bun and Elysia. A `.kay` file is one component: TypeScript fences, then a pug-like indented template. Pages render to plain HTML on the server, and only the interactive parts, the islands, ship JavaScript. It is still experimental, so expect breaking changes for a while.

## What a component looks like

The same page in kay, in the three it borrows from, and in Next.js and Nuxt, each passing its own checker:

<Tabs label="One page in six frameworks">

<Tab group="component" label="kay" checked>

```kay
--- server
const greeting = 'Hello from the server'
--- script
const count = signal(0)
---
h1 {greeting}
button(onClick={() => count++}) Clicked {count()} times
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

<Tab group="component" label="Next.js">

```tsx
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  )
}
```

```tsx
import Counter from './counter'

export default function Page() {
  const greeting = 'Hello from the server'

  return (
    <>
      <h1>{greeting}</h1>
      <Counter />
    </>
  )
}
```

The page is a server component and renders as in kay. State needs a client component, in a file of its own marked `'use client'`.

</Tab>

<Tab group="component" label="Nuxt">

```ts
export default defineEventHandler(() => 'Hello from the server')
```

```vue
<script setup lang="ts">
const { data: greeting } = await useFetch('/api/greeting')
const count = ref(0)
</script>

<template>
  <h1>{{ greeting }}</h1>
  <button @click="count++">Clicked {{ count }} times</button>
</template>
```

The page script runs on the server and again in the browser, so the server-only part goes to an API route, `server/api/greeting.ts`, which the page fetches.

</Tab>

</Tabs>

## Why I built it

I care about speed everywhere: how fast a page loads and runs, how fast the server answers, how fast a build or a test run finishes, and how little the server needs, in memory and in what it takes to deploy.

I also care about how much code it takes. I have two apps of my own, one in SvelteKit at about 27,000 lines and one in SolidJS at about 34,000, blanks and comments left out: at that size, every line a framework saves is one less to write, read and keep working.

For a while I used Astro with SolidJS inside: fast pages for little code, at the price of two frameworks and two ways to write a component in one project. SvelteKit, SolidStart and Astro also all build on Vite, which sometimes makes builds and unit tests slow. kay is what I built to have it all in one place, built and tested by Bun alone. It mixes what I liked in each:

- **Astro**: the TypeScript fence on top, islands as the only JavaScript a page ships, content collections.
- **pug**: indented templates with no closing tags. I loved pug long ago and never saw a framework support it. It is short to write, quick to read, and fewer tokens for an agent.
- **SolidJS**: signals and fine-grained updates, no virtual DOM.
- **Svelte and SvelteKit**: a compiler doing the work ahead of time, file-based routes with layouts, typed form actions.

## How it works

1. The compiler reads a `.kay` file once and emits two twins: an HTML string builder for the server and a DOM builder for the browser.
2. The server renders every page to a string. A static page gets no hydration markers and no JavaScript bundle.
3. An island renders on the server with hydration markers, then claims those nodes in the browser instead of rendering again.
4. `kay build --static` writes the whole site as files, like this devlog, served by plain nginx.

Bun does everything underneath: the server, the bundler, the test runner and the database driver, and a whole site compiles into a single executable. Every build type-checks the project first, templates included, so a broken prop or a mistyped link never ships.

## A synthetic bench

The same products page and the same data for each framework, each written the way its own docs and its js-framework-benchmark entry write it. kay, SolidJS and Svelte are timed behind the same Elysia server, Astro and Nuxt through their own request handlers, and Next.js through its own HTTP server. Every bench in this post ran on one desktop, a Ryzen 5 7600 with 12 threads on Linux.

<BarChart title="Main-thread script on load, products page" unit="ms" better="lower" rows={[{"label": "kay", "value": 0.3}, {"label": "Astro", "value": 1.2}, {"label": "Nuxt", "value": 5.3}, {"label": "SolidJS", "value": 10.8}, {"label": "Svelte", "value": 14.3}, {"label": "Next.js", "value": 18.8}]} bench="synthetic" />

kay hydrates its islands only, and Astro its two Solid ones. SolidJS, Svelte and Nuxt hydrate the whole page, so they also send its data again as JSON, and Next.js streams its component payload along with the page.

<BarChart title="HTML sent, products page, gzip" unit="KB" better="lower" rows={[{"label": "kay", "value": 8.4}, {"label": "Astro", "value": 10.3}, {"label": "Svelte", "value": 15.7}, {"label": "SolidJS", "value": 21.6}, {"label": "Nuxt", "value": 23.5}, {"label": "Next.js", "value": 23.6}]} bench="synthetic" />

<BarChart title="Server rendering, products page" unit="renders/s" better="higher" digits={0} rows={[{"label": "kay", "value": 4208}, {"label": "Svelte", "value": 3886}, {"label": "Astro", "value": 1822}, {"label": "SolidJS", "value": 1748}, {"label": "Nuxt", "value": 588}]} bench="synthetic" />

<BarChart title="Code written, products and table pages" unit="K characters" better="lower" digits={1} rows={[{"label": "kay", "value": 1.9}, {"label": "Nuxt", "value": 2.9}, {"label": "Svelte", "value": 3.3}, {"label": "Astro", "value": 3.4}, {"label": "SolidJS", "value": 3.7}, {"label": "Next.js", "value": 4.1}]} bench="synthetic" source="whitespace and comments left out, as is the bench's server glue" />

Counted in characters, as lines depend on formatting: Prettier turns the Svelte app's 70 lines into 130.

<BarChart title="Production build time" unit="s" better="lower" digits={2} rows={[{"label": "Svelte", "value": 0.09}, {"label": "SolidJS", "value": 0.14}, {"label": "kay", "value": 0.39, "note": "no type check"}, {"label": "Astro", "value": 0.6}, {"label": "kay", "value": 0.87}, {"label": "Nuxt", "value": 1.97}, {"label": "Next.js", "value": 2.15}]} bench="synthetic" />

<BarChart title="Build output, gzip" unit="KB" better="lower" rows={[{"label": "SolidJS", "value": 8.2}, {"label": "Svelte", "value": 22.5}, {"label": "kay", "value": 40.5}, {"label": "Astro", "value": 138.1}, {"label": "Next.js", "value": 328.9}, {"label": "Nuxt", "value": 610.7}]} bench="synthetic" source="kay, SolidJS and Svelte bundle no server" />

<BarChart title="JS shipped, table page, gzip" unit="KB" better="lower" rows={[{"label": "SolidJS", "value": 8.2}, {"label": "Astro", "value": 9.6}, {"label": "kay", "value": 11.9}, {"label": "Svelte", "value": 22.5}, {"label": "Nuxt", "value": 71.8}, {"label": "Next.js", "value": 134.3}]} bench="synthetic" />

Astro's island is the same Solid table as the SolidJS app, and neither has a router, where kay's JavaScript includes the listener its in-place page navigation starts from.

<BenchTable title="Table operations" unit="ms" columns={["kay", "SolidJS", "Svelte", "Astro", "Next.js", "Nuxt"]} rows={[{"label": "Create 1,000 rows", "values": [29.5, 26.6, 26.8, 26.5, 29.8, 26.9]}, {"label": "Replace 1,000 rows", "values": [25.2, 24.5, 25.8, 24.4, 30.3, 27.8]}, {"label": "Update every 10th row", "values": [2.8, 2.7, 2.8, 2.7, 4, 3.5]}, {"label": "Select a row", "values": [0.2, 0.3, 1, 0.3, 1.2, 0.6]}, {"label": "Swap two rows", "values": [2.3, 2.1, 2.1, 2, 20.6, 2.5]}, {"label": "Remove a row", "values": [2, 2, 2.2, 1.9, 3.3, 4.5]}, {"label": "Create 10,000 rows", "values": [259, 228, 231, 239, 363, 267]}, {"label": "Append 1,000 rows", "values": [24.2, 23.4, 23.9, 23.4, 26.9, 25.4]}, {"label": "Clear 1,000 rows", "values": [3, 2.7, 3.2, 2.7, 5, 4.1]}]} bench="synthetic" />

<Note title="How it was measured">

kay 1.60.0, solid-js 1.9.15, Svelte 5.57.1, Astro 7.3.8, Next.js 16.4.0 and Nuxt 4.6.1, on Bun 1.4.3 and headless Chromium 151. Each figure is the median of three runs of the whole bench. Within a run, page loads are medians of 10 cold loads, table operations medians of 10 runs after 2 warmups, and server rendering is measured in-process by mitata. Next.js sits that one out: it serves only through its own HTTP server, so its renders would carry a socket round trip the others never pay. Builds are clean production builds, kay's with and without its type check, which Next.js runs too and the others skip; their size is what each deploys, without the dependencies it runs on or source maps. Every table and its notes are in kay's [bench/results.md](https://github.com/Kayno0o/kayjs/blob/main/bench/results.md), and `bun run bench` in kay's repository runs it again. Code is counted at kay 1.60.0, in characters other than whitespace and comments: pages, layouts, components and config, not the file mounting each app in the bench. Formatted by each framework's formatter, kay fmt for kay and Prettier for the others, cloc 2.10 counts kay 73 lines, Nuxt 122, Svelte 130, Astro 175, SolidJS 182 and Next.js 211.

</Note>

## Real sites, ported to kay

Four real sites moved to kay: one from SvelteKit, about 3,000 lines over 22 components, two small business sites from Astro, and a small signed-in app from Elysia and Solid, each measured as it deploys against the version it replaced. What kay loses there: slower template and style edits in the dev server, more memory at rest than SvelteKit, more JavaScript and slower builds than Astro, more layout shift on phones and a slower build than Elysia and Solid.

<Stats items={[{"value": "-88%", "label": "server CPU per visitor, from SvelteKit"}, {"value": "2.9 to 3.3x", "label": "requests per second on a content page, from Astro"}, {"value": "-16 to -40%", "label": "lines of code"}]} />

## Built for LLMs too

kay is meant to be as easy for a coding agent to write as for me:

- One component format and one way to do each thing, so there is less to choose between and less to get wrong.
- Indented templates with no closing tags: fewer tokens to read and to write for the same page.
- Typed end to end, templates included: `kay check` points at the `.kay` line, so an agent fixes its own mistakes without a browser.
- The whole reference ships as `llms.txt` and one file per topic, read on demand instead of searched for.

To check that, Claude Opus 5.5 built the same small site in each framework: a book catalog read from Markdown files, a tag filter that runs in the browser, a favorite button, and a contact form checked on the server and in the browser that also works without JavaScript. Each run starts from the framework's own starter with its docs in the project, in a sandbox with no browser and no network but `bun add`, and a hidden suite of browser tests grades the site.

<Note title="The site kay's agent built, running">

<Embed src="/llm-bench/bookshelf/books" title="The Bookshelf site kay's agent built" />

</Note>

Filter its books, open one, mark it a favorite. It is the run of median cost, exported as static files, without its contact form, since that needs a server. Styling was free and not graded: kay's agents wrote none, where the others wrote about a hundred lines of CSS in a typical run, so the line counts below leave styles out.

<Stats items={[{"value":"13K vs 17K to 34K","label":"tokens written, kay against the others"}]} />

<BarChart title="Time to build the site" unit="min" better="lower" digits={1} rows={[{"label":"Astro","value":2.6,"range":[2.5,3.6]},{"label":"kay","value":3.4,"range":[1.8,4.7]},{"label":"SvelteKit","value":4.5,"range":[3.3,12.4]},{"label":"Next.js","value":5.9,"range":[4.8,8.5]},{"label":"Nuxt","value":7.9,"range":[4.3,9.5]},{"label":"SolidStart","value":9.3,"range":[6.5,12.9]}]} bench="llm" />

<BarChart title="Lines of code written, tests and styles left out" unit="lines" better="lower" digits={0} rows={[{"label":"kay","value":323,"range":[227,336]},{"label":"Nuxt","value":444,"range":[437,476]},{"label":"Astro","value":463,"range":[440,491]},{"label":"SvelteKit","value":472,"range":[455,518]},{"label":"SolidStart","value":537,"range":[523,549]},{"label":"Next.js","value":616,"range":[537,636]}]} bench="llm" />

<BarChart title="Cost of the site, API prices" unit="USD" better="lower" digits={2} rows={[{"label":"Astro","value":0.78,"range":[0.75,1.12]},{"label":"kay","value":0.95,"range":[0.78,1.54]},{"label":"Nuxt","value":1.46,"range":[0.91,1.8]},{"label":"SvelteKit","value":1.52,"range":[1.23,2.22]},{"label":"Next.js","value":1.87,"range":[1.37,2.85]},{"label":"SolidStart","value":1.94,"range":[1.86,2.79]}]} bench="llm" />

<BarChart title="Docs read" unit="K characters" digits={0} rows={[{"label":"Nuxt","value":14,"range":[8,22]},{"label":"Astro","value":29,"range":[8,38]},{"label":"SolidStart","value":52,"range":[26,64]},{"label":"Next.js","value":84,"range":[70,114]},{"label":"SvelteKit","value":89,"range":[49,103]},{"label":"kay","value":93,"range":[77,107]}]} bench="llm" />

kay is the one framework the model learns on the spot, from the docs and the package in the project, where it comes in having seen plenty of the others, and every call after those reads pays for them again.

<Note title="How it was measured">

kay 1.51.0, its runs a week after SvelteKit's, SolidStart's and Astro's and a few hours after Nuxt's and Next.js's, with the same model and Claude Code, Opus 5.5 at high effort. A run passes when the starter's own `check`, the build and every acceptance test pass; every framework passed all 5 of its runs, and every figure is the median of those runs. Cost is at API prices, as Claude Code reports it. How a run is set up, kept apart from the others and graded is in the [five frameworks post](/posts/five-frameworks); the spec, the prompt, the starters and every run are in [bench/llm](https://github.com/Kayno0o/devlog/blob/main/bench/llm/results/full-opus-1.51/results.md).

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
