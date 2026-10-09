---
title: kay, a Bun web framework built to be fast to run and fast to write
description: Why I built my own framework, how a .kay file becomes HTML and islands, and what it costs next to SolidJS and Svelte.
date: 2026-10-09
tags: [kay, benchmarks]
draft: true
---

kay is a web framework on Bun and Elysia. A `.kay` file is one component: TypeScript fences, then a pug-like indented template. Pages render to plain HTML on the server, and only the interactive parts, the islands, ship JavaScript.

## What a component looks like

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

## How it works

1. The compiler reads a `.kay` file once and emits two twins: an HTML string builder for the server and a DOM builder for the browser.
2. The server renders every page to a string. A static page gets no markers and no script.
3. An island renders on the server with hydration markers, then claims those nodes in the browser instead of rendering again.
4. `kay build --static` writes the whole site as files, like this devlog, served by plain nginx.

## A synthetic bench

The same products page, the same data and the same Elysia server for each framework, from kay's own bench. Each one is written the way its own docs and its js-framework-benchmark entry write it.

### Where kay wins

<Stats items={[{"value": "0.4 ms", "label": "script on load"}, {"value": "8.1 KB", "label": "HTML sent, gzip"}, {"value": "4788", "label": "server renders per second"}]} />

<BarChart title="Main-thread script on load, products page" unit="ms" better="lower" highlight="kay" rows={[{"label": "kay", "value": 0.4}, {"label": "SolidJS", "value": 12.4}, {"label": "Svelte", "value": 15.6}]} source="kayjs bench/results.md, kay 1.3.0, 2026-10-07" />

kay hydrates its islands only. SolidJS and Svelte hydrate the whole page, so they also send its data again as JSON.

<BarChart title="HTML sent, products page, gzip" unit="KB" better="lower" highlight="kay" rows={[{"label": "kay", "value": 8.1}, {"label": "Svelte", "value": 15.6}, {"label": "SolidJS", "value": 21.6}]} source="kayjs bench/results.md, kay 1.3.0, 2026-10-07" />

<BarChart title="Server rendering, products page" unit="renders/s" better="higher" highlight="kay" digits={0} rows={[{"label": "kay", "value": 4788}, {"label": "Svelte", "value": 3853}, {"label": "SolidJS", "value": 1754}]} source="kayjs bench/results.md, kay 1.3.0, 2026-10-07" />

### Where kay loses

<BarChart title="JS shipped, table page, gzip" unit="KB" better="lower" highlight="kay" rows={[{"label": "SolidJS", "value": 8.0}, {"label": "kay", "value": 9.7}, {"label": "Svelte", "value": 21.8}]} source="kayjs bench/results.md, kay 1.3.0, 2026-10-07" />

SolidJS ships less JavaScript, in one file where kay needs two. kay's in-place page navigation accounts for about 2.3 KB of it, listeners every page with an island carries, which the Solid app, having no router, does without.

<BarChart title="Update every 10th row of 1,000" unit="ms" better="lower" highlight="kay" rows={[{"label": "Svelte", "value": 3.0}, {"label": "SolidJS", "value": 3.1}, {"label": "kay", "value": 3.6}]} source="kayjs bench/results.md, kay 1.3.0, 2026-10-07" />

On the table benchmark kay is within 1 to 20% of the fastest, and last on partial updates and swaps: it replaces rows immutably under a keyed `for`, where Solid and Svelte write one signal per row.

| Table operation, ms | kay | SolidJS | Svelte |
| --- | --- | --- | --- |
| create 1,000 rows | 31.1 | 29.7 | 32.3 |
| update every 10th row | 3.6 | 3.1 | 3.0 |
| select row | 0.2 | 0.3 | 1.1 |
| swap rows | 2.5 | 2.2 | 2.1 |
| create 10,000 rows | 250 | 256 | 256 |

## A real site, ported from SvelteKit

Benchmarks of a products table only go so far, so I ported a real site from SvelteKit to kay: a home page and content pages, about 3,000 lines of code over 22 Svelte components. Both versions were measured in one sitting, runs interleaved, on one desktop over loopback: the ratios carry over, the absolute numbers are optimistic.

### What kay gains

<Stats items={[{"value": "-46%", "label": "phone first paint, content page"}, {"value": "16 vs 70 KB", "label": "client JS, brotli"}, {"value": "25 vs 65", "label": "requests, home page"}]} />

<BarChart title="First paint on a phone, content page" unit="ms" better="lower" highlight="kay, inlined styles" digits={0} rows={[{"label": "kay, inlined styles", "value": 407}, {"label": "SvelteKit", "value": 757}, {"label": "kay, linked styles", "value": 863}]} source="SvelteKit vs kay 1.14.0, Lighthouse Pixel 7 preset (slow 4G, 4x CPU), 3 runs each, 2026-10-09" />

<BarChart title="Client JavaScript, brotli" unit="KB" better="lower" highlight="kay" rows={[{"label": "kay", "value": 16.1}, {"label": "SvelteKit", "value": 70.1}]} source="SvelteKit vs kay 1.13.0, 2026-10-09" />

<BarChart title="Build, cold caches" unit="s" better="lower" highlight="kay" digits={2} rows={[{"label": "kay", "value": 2.22}, {"label": "SvelteKit", "value": 3.57}]} source="SvelteKit vs kay 1.13.0, hyperfine, 3 runs, 2026-10-09" />

The home page a phone downloads drops from 706 to 547 KB, mostly images: kay serves AVIF at the width drawn. The Docker image goes from 228 to 184 MB, and the code from 3,037 to 2,590 lines.

### What kay loses

<BarChart title="Server memory at rest" unit="MiB" better="lower" highlight="kay" digits={0} rows={[{"label": "SvelteKit", "value": 37}, {"label": "kay", "value": 59}]} source="SvelteKit vs kay 1.13.0, RSS after start, 2026-10-09" />

- **Memory.** kay holds about 1.6 times SvelteKit's memory at rest and 1.5 times at peak, 198 against 130 MiB under load.
- **The default is not the fast path.** The phone paint above needs `inlineStyles`, which is opt-in: with the stylesheet linked, as kay does by default, kay paints 85 to 140 ms behind SvelteKit. Inlining costs about 2 KB per page and the stylesheet is no longer cached between pages.
- **CPU on short pages.** kay serves rendered pages at 1.6 to 2 times SvelteKit's rate, yet spends 9 to 11% more CPU per short page, compressing with brotli where SvelteKit uses gzip. Those server figures were taken with linked stylesheets.

## What comes with it

- **Bun underneath.** One fast runtime for the server, the bundler, the test runner and the database driver, and the whole site compiles into a single executable.
- **Builds check first.** `kay build` type-checks the whole project, templates included, before it bundles anything, so a broken prop or a mistyped link never ships. The port above still builds faster than it did on SvelteKit.

## Built for LLMs too

kay is meant to be as easy for a coding agent to write as for me:

- One component format and one way to do each thing, so there is less to choose between and less to get wrong.
- Indented templates with no closing tags: fewer tokens to read and to write for the same page.
- Typed end to end, templates included: `kay check` points at the `.kay` line, so an agent fixes its own mistakes without a browser.
- The whole reference ships as `llms.txt` and one file per topic, read on demand instead of searched for.

<Note title="Benchmark coming">

The same app written by an LLM in kay and in other frameworks, measuring tokens, wall time, turns and check errors. Until it runs, this section makes no claim with a number in it.

</Note>

## What is next

TODO
