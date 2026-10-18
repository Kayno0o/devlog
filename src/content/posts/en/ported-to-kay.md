---
title: "Three real sites, moved to kay"
description: "A SvelteKit site and two Astro sites ported to kay and measured as they deploy: server load, paints, images, builds, memory and the dev server, what kay loses included."
date: 2026-10-17
tags: [kay, benchmarks]
draft: true
---

The [kay post](/posts/introducing-kay) measures kay on a products page and on a coding agent's build. A products page only goes so far, so this post is three real sites moved to kay: one from SvelteKit, two from Astro, each measured against the version it replaced. Every bench here ran on one desktop, a Ryzen 5 7600 with 12 threads on Linux.

## A real site, ported from SvelteKit

I ported a real site from SvelteKit to kay: a home page and content pages, about 3,000 lines over 22 Svelte components. Both versions were measured in one sitting, runs interleaved, over loopback: the ratios carry over, the absolute numbers are optimistic.

### What kay gains

<Stats items={[{"value": "-89%", "label": "server CPU per visitor"}, {"value": "-54%", "label": "requests in home page"}, {"value": "-20%", "label": "Docker image"}, {"value": "-17%", "label": "lines of code"}]} />

<BarChart title="First paint on a phone, content page" unit="ms" better="lower" digits={0} rows={[{"label": "kay", "value": 360}, {"label": "SvelteKit", "value": 756}]} bench="sveltekit" source="Lighthouse Pixel 7 preset (slow 4G, 4x CPU), median of 3 runs" />

<BarChart title="Client JavaScript, brotli" unit="KB" better="lower" rows={[{"label": "kay", "value": 46.2}, {"label": "SvelteKit", "value": 70.1}]} bench="sveltekit" source="every file the build writes" />

A page loads only the part its islands need: 14 KB on a content page.

The home page is prerendered, and its contact form, the one part that differs per visitor, is a deferred server island: the browser fetches it about a screen before it scrolls into view, while kay serves the page itself from memory.

<BarChart title="Requests per second, home page" unit="req/s" better="higher" digits={0} rows={[{"label": "kay", "value": 40887}, {"label": "SvelteKit", "value": 793}]} bench="sveltekit" source="oha, 64 connections for 10 s, 2 rounds, kay's slower round" />

Most of that gap is prerendering, not rendering speed: when kay rendered the whole page per request, as SvelteKit does, it served it at about twice SvelteKit's rate.

<BarChart title="Requests per second, content page" unit="req/s" better="higher" digits={0} rows={[{"label": "kay", "value": 39862}, {"label": "SvelteKit", "value": 4202}]} bench="sveltekit" source="oha, 64 connections for 10 s, 2 rounds, kay's slower round" />

kay's build keeps the content pages too, as they take nothing from the request, so they are served from memory as well. Only the 404 is still rendered per request, at 1.4 times SvelteKit's rate for less CPU.

<BarChart title="Build, cold caches" unit="s" better="lower" digits={2} rows={[{"label": "kay", "value": 2.98}, {"label": "SvelteKit", "value": 4.18}]} bench="sveltekit" source="hyperfine, median of 3 runs" />

Under load, kay peaks at 88 to 89 MiB of memory against SvelteKit's 130 to 137. The home page a phone downloads drops from 706 to 546 KB, mostly images: kay serves AVIF at the width drawn.

### What kay loses

<BarChart title="Server memory at rest" unit="MiB" better="lower" digits={0} rows={[{"label": "SvelteKit", "value": 38}, {"label": "kay", "value": 57}]} bench="sveltekit" source="RSS after start" />

- **Inlining has a price.** The phone paint above comes from inlining the stylesheet, which this port turned on before kay 1.46 made it the default for stylesheets compressing under about 14 KB: with it linked, kay 1.14 painted 85 to 140 ms behind SvelteKit. Inlining costs about 2 KB per page, and the stylesheet is no longer cached between pages.

### In development

<BarChart title="First load of the home page, dev server" unit="ms" better="lower" digits={0} rows={[{"label": "kay", "value": 134}, {"label": "SvelteKit", "value": 1653}]} bench="sveltekit" source="headless Chromium, load event, median of 2 rounds" />

<BarChart title="Template edit to screen, dev server" unit="ms" better="lower" digits={0} rows={[{"label": "SvelteKit", "value": 34}, {"label": "kay", "value": 42}]} bench="sveltekit" source="file write to the page showing it, median of 14 edits" />

- **kay loads pages faster.** It starts in 871 ms with cold caches against Vite's 950, and serves a bundled client, 27 requests for the home page against Vite's 166 modules, so the home page answers in 363 ms from a warm start against 1,467. Its processes hold 258 MiB against Vite's 382.
- **Vite applies style edits sooner.** kay takes a template or server code edit in without restarting its server, but a style edit shows in 73 ms against Vite's 33. kay shows a server code edit in 55 ms with the page's state kept, which SvelteKit only shows after a manual reload.

<Note title="How it was measured">

kay 1.54.0 on Bun 1.4.3, the dev server included. Paints come from Playwright under Lighthouse's phone and desktop presets, median of 3 runs; builds from hyperfine, median of 3 cold runs; the server from oha, 10 s at 64 connections, two rounds. The site's code is private, so the record is [bench/sveltekit-port.md](https://github.com/Kayno0o/devlog/blob/main/bench/sveltekit-port.md), every figure with its conditions.

</Note>

## Two sites, ported from Astro

Two small business sites moved to kay from Astro: a cattery and a house painter. Each was built and served as it deploys, Astro's standalone server under Bun against kay's one executable, both behind nginx with HTTP/2, TLS and brotli.

### What kay gains

<Stats items={[{"value": "-32 to -37%", "label": "lines of code"}, {"value": "2.2 to 3.5x", "label": "faster cold start"}, {"value": "-27 to -85%", "label": "CSS per page"}]} />

<BarChart title="Requests per second, a content page" unit="req/s" better="higher" digits={0} rows={[{"label": "kay, painter", "value": 39805}, {"label": "kay, cattery", "value": 39322}, {"label": "Astro, cattery", "value": 12648}, {"label": "Astro, painter", "value": 11798}]} bench="astro" source="32 clients through nginx for 5 s" />

kay serves those pages prerendered and already compressed, so nginx spends about 20 µs on each instead of 470 to 540, and both sit near the load client's own ceiling of about 40,000 a second. Both sites load their contact form as a deferred server island, so every page but the cattery's home is prerendered.

<BarChart title="Server memory after load" unit="MB" better="lower" digits={0} rows={[{"label": "kay, painter", "value": 95}, {"label": "Astro, painter", "value": 125}, {"label": "kay, cattery", "value": 144}, {"label": "Astro, cattery", "value": 281}]} bench="astro" source="RSS after the load runs" />

<BarChart title="Deployed size" unit="MB" better="lower" digits={0} rows={[{"label": "kay, painter", "value": 98}, {"label": "kay, cattery", "value": 109}, {"label": "Astro, cattery", "value": 231}, {"label": "Astro, painter", "value": 301}]} bench="astro" source="dist and production node_modules against one executable" />

- **Lighter images**, served as AVIF at the width drawn: 55 against 143 KB and 36 against 161 KB per page on desktop, 115 against 143 KB and 105 against 185 KB on a phone.
- **Faster paints on the cattery**: on a phone, the largest paint lands at 1.78 s instead of 2.73 s, and a phone downloads 201 KB per page instead of 256.

### What kay loses

<BarChart title="JS shipped per page, brotli" unit="KB" better="lower" rows={[{"label": "Astro, painter", "value": 0.4}, {"label": "Astro, cattery", "value": 5.2}, {"label": "kay, cattery", "value": 13.1}, {"label": "kay, painter", "value": 13.1}]} bench="astro" source="average over every page" />

- **More JavaScript.** The painter's site shipped 0.4 KB on Astro, a few plain scripts inlined in its pages, and ships 13.1 KB on kay; the cattery's goes from 5.2 to 13.1 KB.
- **A heavier painter site on phones.** A phone downloads 170 KB per page against 126 KB, mostly fonts (107 against 35 KB) and that script. Its largest paint lands about 70 ms later on a phone and 35 ms later on desktop.
- **Slower builds.** A clean `kay build` encodes an AVIF and a WebP copy of every image, which `astro build` does not: 11.3 against 1.9 s on the cattery and 7.1 against 1.6 s on the painter, the cattery's build peaking at 1.9 GB against 1.1.

<Note title="How it was measured">

kay 1.28.0 on Bun 1.4.4, headless Chromium 151 and nginx 1.30.5 set up as in production, both sides in one sitting. Paints are medians of 5 cold loads per page under Lighthouse's throttling; load is 32 clients for 5 s per URL; builds are the median of 3 clean runs. The sites' code is private, so the record is [bench/astro-ports.md](https://github.com/Kayno0o/devlog/blob/main/bench/astro-ports.md), every figure with its conditions.

</Note>
