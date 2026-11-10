---
title: "A SvelteKit site, moved to kay"
description: "A real SvelteKit site ported to kay and measured against the version it replaced, in production and in the dev server, losses included."
date: 2026-10-20
tags: [kay, benchmarks]
draft: true
social:
  x: "I moved a SvelteKit site, about 3,000 lines over 22 components, to kay, my Bun framework. It spends 88% less server CPU per visitor, and a phone paints a content page in 356 ms instead of 752. The costs: more memory at rest, and style edits show later in dev."
  bluesky: "A SvelteKit site of about 3,000 lines, moved to kay, my Bun framework: 88% less server CPU per visitor, and a phone paints in 356 ms instead of 752. The costs: more memory at rest, and style edits show later in the dev server."
  mastodon: "I moved a SvelteKit site, about 3,000 lines over 22 components, to kay, my Bun framework, and measured both in one sitting. kay spends 88% less server CPU per visitor, and a phone paints a content page in 356 ms instead of 752. The costs: more memory at rest, and style edits show later in the dev server. #Svelte #Bun #WebDev"
  reddit:
    title: "I moved a 3,000-line SvelteKit site to my own Bun framework and measured both, losses included"
    body: "I build kay, a Bun web framework, and moved a real SvelteKit site to it: a home page and content pages, 22 components. Measured in one sitting on one machine: 88% less server CPU per visitor, a first paint on a phone at 356 ms instead of 752, and a smaller Docker image. Where kay loses: more memory at rest, and the dev server shows template and style edits later than Vite."
    subreddits: []
---

This site ran on SvelteKit: a home page and content pages, about 3,000 lines over 22 Svelte components. Moved to [kay](/posts/introducing-kay), it serves pages for a fraction of the CPU and paints sooner on a phone, and it holds more memory at rest and shows style edits later in development. Both versions were measured in one sitting on one desktop, a Ryzen 5 7600 with 12 threads on Linux, runs interleaved, over loopback: the ratios carry over, the absolute numbers are optimistic.

<Stats
  items={[
    {"value": "-88%", "label": "server CPU per visitor"},
    {"value": "-58%", "label": "requests in home page"},
    {"value": "-20%", "label": "Docker image"},
    {"value": "-16%", "label": "lines of code"}
  ]}
/>

<BarChart
  title="First paint on a phone, content page"
  unit="ms"
  better="lower"
  digits={0}
  rows={[
    {"label": "kay", "value": 356},
    {"label": "SvelteKit", "value": 752}
  ]}
  bench="sveltekit"
  source="Lighthouse Pixel 7 preset (slow 4G, 4x CPU), median of 3 runs"
/>

<BarChart
  title="Client JavaScript, brotli"
  unit="KB"
  better="lower"
  rows={[
    {"label": "kay", "value": 30.6},
    {"label": "SvelteKit", "value": 70.1}
  ]}
  bench="sveltekit"
  source="every file the build writes"
/>

A page loads only what its islands need of it: 13 KB on a content page.

The home page is prerendered, and its contact form, the one part that differs per visitor, is a deferred server island: the browser fetches it about a screen before it scrolls into view, while kay serves the page itself from memory.

<BarChart
  title="Requests per second, home page"
  unit="req/s"
  better="higher"
  digits={0}
  rows={[
    {"label": "kay", "value": 40963},
    {"label": "SvelteKit", "value": 787}
  ]}
  bench="sveltekit"
  source="oha, 64 connections for 10 s, 2 rounds, kay's slower round"
/>

Most of that gap is prerendering, not rendering speed: back when kay rendered the whole page per request, as SvelteKit does, it served it at about twice SvelteKit's rate.

<BarChart
  title="Requests per second, content page"
  unit="req/s"
  better="higher"
  digits={0}
  rows={[
    {"label": "kay", "value": 43014},
    {"label": "SvelteKit", "value": 4228}
  ]}
  bench="sveltekit"
  source="oha, 64 connections for 10 s, 2 rounds, kay's slower round"
/>

kay's build keeps the content pages too, as they take nothing from the request, so they are served from memory as well. Only the 404 is still rendered per request, at 1.2 times SvelteKit's rate for less CPU.

<BarChart
  title="Build, cold caches"
  unit="s"
  better="lower"
  digits={2}
  rows={[
    {"label": "kay", "value": 2.94},
    {"label": "SvelteKit", "value": 3.97}
  ]}
  bench="sveltekit"
  source="hyperfine, median of 3 runs"
/>

Under load, kay peaks at 92 MiB of memory against SvelteKit's 134 to 136. The home page a phone downloads drops from 706 to 543 KB, mostly images: kay serves AVIF at the width drawn.

<BarChart
  title="Server memory at rest"
  unit="MiB"
  better="lower"
  digits={0}
  rows={[
    {"label": "SvelteKit", "value": 39},
    {"label": "kay", "value": 55}
  ]}
  bench="sveltekit"
  source="RSS after start"
/>

The phone paint above comes from inlining the stylesheet, which kay does by default for a stylesheet compressing under about 14 KB. With it linked, an earlier kay painted 85 to 140 ms behind SvelteKit. Inlining costs about 2 KB per page, and the stylesheet is no longer cached between pages.

## The dev server loads pages sooner and shows style edits later

<BarChart
  title="First load of the home page, dev server"
  unit="ms"
  better="lower"
  digits={0}
  rows={[
    {"label": "kay", "value": 120},
    {"label": "SvelteKit", "value": 1631}
  ]}
  bench="sveltekit"
  source="headless Chromium, load event, median of 2 rounds"
/>

<BarChart
  title="Template edit to screen, dev server"
  unit="ms"
  better="lower"
  digits={0}
  rows={[
    {"label": "SvelteKit", "value": 34},
    {"label": "kay", "value": 47}
  ]}
  bench="sveltekit"
  source="file write to the page showing it, median of 14 edits"
/>

kay's dev server starts in 915 ms with cold caches against Vite's 1,258, and serves a bundled client: 24 requests for the home page against Vite's 166 modules, so the home page answers in 381 ms from a warm start against 1,741. Its processes hold 239 MiB against Vite's 400.

Vite shows a style edit in 34 ms, kay in 71. kay takes a template or server code edit in without restarting, and shows a server code edit in 59 ms with the page's state kept, which SvelteKit only shows after a manual reload.

<Note title="How it was measured">

kay 1.60.1 on Bun 1.4.3, the dev server included. Paints come from Playwright under Lighthouse's phone and desktop presets, median of 3 runs; builds from hyperfine, median of 3 cold runs; the server from oha, 10 s at 64 connections, two rounds. The site's code is private, so the record is [bench/sveltekit-port.md](https://github.com/Kayno0o/devlog/blob/main/bench/sveltekit-port.md), every figure with its conditions.

</Note>

The other ports: [two Astro sites](/posts/ported-from-astro) and [an Elysia and Solid app](/posts/ported-from-solid).
