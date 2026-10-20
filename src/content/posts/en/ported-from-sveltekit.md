---
title: "A SvelteKit site, moved to kay"
description: "A real SvelteKit site ported to kay and measured against the version it replaced: server load, paints, builds, memory and the dev server, what kay loses included."
date: 2026-10-20
tags: [kay, benchmarks]
draft: true
---

The [kay post](/posts/introducing-kay) measures kay on a products page and on a coding agent's build. A products page only goes so far, so here is a real site moved to kay from SvelteKit: a home page and content pages, about 3,000 lines over 22 Svelte components. Both versions were measured in one sitting on one desktop, a Ryzen 5 7600 with 12 threads on Linux, runs interleaved, over loopback: the ratios carry over, the absolute numbers are optimistic.

<Stats items={[{"value": "-88%", "label": "server CPU per visitor"}, {"value": "-58%", "label": "requests in home page"}, {"value": "-20%", "label": "Docker image"}, {"value": "-16%", "label": "lines of code"}]} />

<BarChart title="First paint on a phone, content page" unit="ms" better="lower" digits={0} rows={[{"label": "kay", "value": 356}, {"label": "SvelteKit", "value": 752}]} bench="sveltekit" source="Lighthouse Pixel 7 preset (slow 4G, 4x CPU), median of 3 runs" />

<BarChart title="Client JavaScript, brotli" unit="KB" better="lower" rows={[{"label": "kay", "value": 30.6}, {"label": "SvelteKit", "value": 70.1}]} bench="sveltekit" source="every file the build writes" />

A page loads only what its islands need of it: 13 KB on a content page.

The home page is prerendered, and its contact form, the one part that differs per visitor, is a deferred server island: the browser fetches it about a screen before it scrolls into view, while kay serves the page itself from memory.

<BarChart title="Requests per second, home page" unit="req/s" better="higher" digits={0} rows={[{"label": "kay", "value": 40963}, {"label": "SvelteKit", "value": 787}]} bench="sveltekit" source="oha, 64 connections for 10 s, 2 rounds, kay's slower round" />

Most of that gap is prerendering, not rendering speed: when kay 1.16 rendered the whole page per request, as SvelteKit does, it served it at about twice SvelteKit's rate.

<BarChart title="Requests per second, content page" unit="req/s" better="higher" digits={0} rows={[{"label": "kay", "value": 43014}, {"label": "SvelteKit", "value": 4228}]} bench="sveltekit" source="oha, 64 connections for 10 s, 2 rounds, kay's slower round" />

kay's build keeps the content pages too, as they take nothing from the request, so they are served from memory as well. Only the 404 is still rendered per request, at 1.2 times SvelteKit's rate for less CPU.

<BarChart title="Build, cold caches" unit="s" better="lower" digits={2} rows={[{"label": "kay", "value": 2.94}, {"label": "SvelteKit", "value": 3.97}]} bench="sveltekit" source="hyperfine, median of 3 runs" />

Under load, kay peaks at 92 MiB of memory against SvelteKit's 134 to 136. The home page a phone downloads drops from 706 to 543 KB, mostly images: kay serves AVIF at the width drawn.

<BarChart title="Server memory at rest" unit="MiB" better="lower" digits={0} rows={[{"label": "SvelteKit", "value": 39}, {"label": "kay", "value": 55}]} bench="sveltekit" source="RSS after start" />

Inlining has a price: the phone paint above comes from inlining the stylesheet, which this port turned on before kay 1.46 made it the default for stylesheets compressing under about 14 KB: with it linked, kay 1.14 painted 85 to 140 ms behind SvelteKit. Inlining costs about 2 KB per page, and the stylesheet is no longer cached between pages.

## In development

<BarChart title="First load of the home page, dev server" unit="ms" better="lower" digits={0} rows={[{"label": "kay", "value": 120}, {"label": "SvelteKit", "value": 1631}]} bench="sveltekit" source="headless Chromium, load event, median of 2 rounds" />

<BarChart title="Template edit to screen, dev server" unit="ms" better="lower" digits={0} rows={[{"label": "SvelteKit", "value": 34}, {"label": "kay", "value": 47}]} bench="sveltekit" source="file write to the page showing it, median of 14 edits" />

- **kay loads pages faster.** It starts in 915 ms with cold caches against Vite's 1,258, and serves a bundled client, 24 requests for the home page against Vite's 166 modules, so the home page answers in 381 ms from a warm start against 1,741. Its processes hold 239 MiB against Vite's 400.
- **Vite shows template and style edits sooner.** kay takes a template or server code edit in without restarting its server, but a style edit shows in 71 ms against Vite's 34. kay shows a server code edit in 59 ms with the page's state kept, which SvelteKit only shows after a manual reload.

<Note title="How it was measured">

kay 1.60.1 on Bun 1.4.3, the dev server included. Paints come from Playwright under Lighthouse's phone and desktop presets, median of 3 runs; builds from hyperfine, median of 3 cold runs; the server from oha, 10 s at 64 connections, two rounds. The site's code is private, so the record is [bench/sveltekit-port.md](https://github.com/Kayno0o/devlog/blob/main/bench/sveltekit-port.md), every figure with its conditions.

</Note>
