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

## Numbers

The same products page, the same data and the same Elysia server for each framework, from kay's own bench.

<Stats items={[{"value": "8.7 KB", "label": "JS shipped, gzip"}, {"value": "0.4 ms", "label": "script on load"}, {"value": "4788", "label": "server renders per second"}]} />

<BarChart title="Server rendering, products page" unit="renders/s" better="higher" highlight="kay" digits={0} rows={[{"label": "kay", "value": 4788}, {"label": "Svelte", "value": 3853}, {"label": "SolidJS", "value": 1754}]} source="kayjs bench/results.md, kay 1.3.0, 2026-10-07" />

<BarChart title="Main-thread script on load, products page" unit="ms" better="lower" highlight="kay" rows={[{"label": "kay", "value": 0.4}, {"label": "SolidJS", "value": 12.4}, {"label": "Svelte", "value": 15.6}]} source="kayjs bench/results.md, kay 1.3.0, 2026-10-07" />

<BarChart title="HTML sent, products page, gzip" unit="KB" better="lower" highlight="kay" rows={[{"label": "kay", "value": 8.1}, {"label": "Svelte", "value": 15.6}, {"label": "SolidJS", "value": 21.6}]} source="kayjs bench/results.md, kay 1.3.0, 2026-10-07" />

| Products page | kay | SolidJS | Svelte |
| --- | --- | --- | --- |
| JS shipped (gzip) | 8.7 KB | 8.0 KB | 21.8 KB |
| HTML (gzip) | 8.1 KB | 21.6 KB | 15.6 KB |
| JS heap | 1248 KB | 3008 KB | 3122 KB |

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
