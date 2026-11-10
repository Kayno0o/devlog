---
title: "One products page in Next.js, Nuxt, Astro, Svelte and Solid"
description: "The same products page in five frameworks, timed in the browser, on the server and at build time, with the code each one takes to write."
date: 2026-10-19
updated: 2026-11-10
tags: [benchmarks]
draft: false
social:
  x: "The same products page in Next.js, Nuxt, Astro, Svelte and SolidJS, timed in the browser, on the server and at build time. No framework comes out ahead on all of them. Hydrating a whole page ships its data a second time as JSON, which islands avoid."
  bluesky: "The same products page in Next.js, Nuxt, Astro, Svelte and SolidJS, timed in the browser, on the server and at build time. No framework comes out ahead on all of them. Hydrating a whole page ships its data twice, which islands avoid."
  mastodon: "The same products page in Next.js, Nuxt, Astro, Svelte and SolidJS, each written the way its own docs would, timed in the browser, on the server and at build time. No framework comes out ahead on all of them. Hydrating a whole page ships its data a second time as JSON, which islands avoid, and a line count mostly measures the formatter. #JavaScript #WebDev #WebPerf"
  reddit:
    title: "The same products page in Next.js, Nuxt, Astro, Svelte and SolidJS, timed in the browser, on the server and at build time"
    body: "I wrote one products page in five frameworks, each the way its own docs and its js-framework-benchmark entry would write it, and measured script time on load, HTML sent, JS shipped, table operations, server renders per second, code size, build time and build size. No framework comes out ahead on all of them. Next.js sits out the server render test, as it only renders through its own HTTP server. Versions and method are in the post."
    subreddits: []
---

The same products page, from the same data, in Next.js, Nuxt, Astro, Svelte and SolidJS, timed in the browser, on the server and at build time. No framework comes out ahead on all of them, and the reasons are in how each one renders and hydrates. Each page is written the way the framework's own docs and its js-framework-benchmark entry would write it, and everything ran on one desktop, a Ryzen 5 7600 with 12 threads on Linux.

## Hydrating a whole page sends its data twice

<BarChart
  title="Script time on load, products page"
  unit="ms"
  better="lower"
  rows={[
    {"label": "Astro", "value": 1.3},
    {"label": "Nuxt", "value": 5.2},
    {"label": "SolidJS", "value": 10.8},
    {"label": "Svelte", "value": 14.3},
    {"label": "Next.js", "value": 18.6}
  ]}
  bench="syntheticNeutral"
/>

Astro hydrates only its two Solid islands. SolidJS, Svelte and Nuxt hydrate the whole page, so they also ship its data a second time as JSON, and Next.js streams its component payload alongside the HTML.

<BarChart
  title="HTML sent, products page, gzip"
  unit="KB"
  better="lower"
  rows={[
    {"label": "Astro", "value": 10.3},
    {"label": "Svelte", "value": 15.7},
    {"label": "SolidJS", "value": 21.6},
    {"label": "Nuxt", "value": 23.5},
    {"label": "Next.js", "value": 23.6}
  ]}
  bench="syntheticNeutral"
/>

<BarChart
  title="JS shipped, table page, gzip"
  unit="KB"
  better="lower"
  rows={[
    {"label": "SolidJS", "value": 8.2},
    {"label": "Astro", "value": 9.6},
    {"label": "Svelte", "value": 22.5},
    {"label": "Nuxt", "value": 72.3},
    {"label": "Next.js", "value": 134.3}
  ]}
  bench="syntheticNeutral"
/>

Astro's island is the very same Solid table as the SolidJS app, and neither ships a router.

<BenchTable
  title="Table operations"
  unit="ms"
  columns={["SolidJS", "Svelte", "Astro", "Next.js", "Nuxt"]}
  rows={[
    {"label": "Create 1,000 rows", "values": [26.9, 26.1, 26.4, 29.9, 26.4]},
    {"label": "Replace 1,000 rows", "values": [24.3, 25.9, 24.5, 29.9, 27.4]},
    {"label": "Update every 10th row", "values": [2.7, 2.6, 2.6, 4.1, 3.5]},
    {"label": "Select a row", "values": [0.3, 1, 0.3, 1.2, 0.7]},
    {"label": "Swap two rows", "values": [2.1, 2.1, 1.9, 20.4, 2.5]},
    {"label": "Remove a row", "values": [2, 2.2, 1.9, 3.2, 4.4]},
    {"label": "Create 10,000 rows", "values": [226, 232, 234, 360, 266]},
    {"label": "Append 1,000 rows", "values": [22.9, 23.4, 23.1, 26.6, 25.4]},
    {"label": "Clear 1,000 rows", "values": [2.6, 3.2, 2.5, 5, 4.2]}
  ]}
  bench="syntheticNeutral"
/>

## Next.js renders only through its own server

<BarChart
  title="Server rendering, products page"
  unit="renders/s"
  better="higher"
  digits={0}
  rows={[
    {"label": "Svelte", "value": 3861},
    {"label": "Astro", "value": 1898},
    {"label": "SolidJS", "value": 1712},
    {"label": "Nuxt", "value": 583}
  ]}
  bench="syntheticNeutral"
/>

Rendering is timed in-process, so Next.js sits it out: each of its renders would pay a network round trip the others never do.

## A line count mostly measures the formatter

<BarChart
  title="Code written, products and table pages"
  unit="K characters"
  better="lower"
  digits={1}
  rows={[
    {"label": "Nuxt", "value": 2.9},
    {"label": "Svelte", "value": 3.3},
    {"label": "Astro", "value": 3.4},
    {"label": "SolidJS", "value": 3.7},
    {"label": "Next.js", "value": 4.1}
  ]}
  bench="syntheticNeutral"
  source="whitespace and comments left out, as is the bench's server glue"
/>

So code is counted in characters: Prettier alone turns the Svelte app's 70 lines into 130.

## A build with no server in it stays small

<BarChart
  title="Production build time"
  unit="s"
  better="lower"
  digits={2}
  rows={[
    {"label": "Svelte", "value": 0.09},
    {"label": "SolidJS", "value": 0.14},
    {"label": "Astro", "value": 1.19},
    {"label": "Next.js", "value": 2.18},
    {"label": "Nuxt", "value": 2.58}
  ]}
  bench="syntheticNeutral"
/>

<BarChart
  title="Build size, gzip"
  unit="KB"
  better="lower"
  rows={[
    {"label": "SolidJS", "value": 8.2},
    {"label": "Svelte", "value": 22.5},
    {"label": "Astro", "value": 137.8},
    {"label": "Next.js", "value": 328.6},
    {"label": "Nuxt", "value": 614.7}
  ]}
  bench="syntheticNeutral"
  source="SolidJS and Svelte bundle no server"
/>

Next.js's build includes the type check it runs and the others skip.

<Note title="How it was measured">

solid-js 1.9.17, Svelte 5.57.1, Astro 7.3.8, Next.js 16.4.3 and Nuxt 4.6.2, on Bun 1.4.4 and headless Chromium 151. SolidJS and Svelte run behind the same Elysia server, Astro and Nuxt through their own request handlers, and Next.js through its own HTTP server. Each figure is the median of three full runs of the bench. Within a run, a page load is the median of 10 cold loads, a table operation the median of 10 runs after 2 warmups, and server rendering is measured in-process by mitata. Builds are clean production builds; their size is what each one deploys, without its runtime dependencies or source maps. Code is counted in characters, whitespace and comments left out: pages, layouts, components and config, not the file plugging each app into the bench. Formatted by Prettier, cloc 2.10 counts 122 lines for Nuxt, 130 for Svelte, 175 for Astro, 182 for SolidJS and 211 for Next.js.

</Note>

The same five frameworks were also [handed to a coding agent](/posts/coding-agent-bench), on an expensive model and a cheaper one.
