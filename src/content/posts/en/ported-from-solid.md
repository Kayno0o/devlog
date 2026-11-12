---
title: "Same app, 40% less code: Elysia and Solid to kay"
description: "I ported a signed-in app of mine from Elysia and Solid 2 to kay and measured it as it deploys: load, paints, memory and builds."
date: 2026-10-19T10:10:00Z
tags: [kay, benchmarks]
draft: false
social:
  x: "I moved my Elysia and Solid 2 app to kay, my Bun framework: 40% less code, a 7x faster cold start, and 73% fewer bytes for a phone. The cost: more layout shift on phones."
  bluesky: "I moved my Elysia + Solid 2 app to kay, my Bun framework: 40% less code, a 7x faster cold start, 73% fewer bytes for a phone. The cost: more layout shift on phones."
  mastodon: "I moved my Elysia + Solid 2 app to kay, my Bun framework, and it has 40% less code, starts 7x faster, and a phone downloads 73% fewer bytes. The cost: more layout shift on phones, as the web fonts reflow text the server already painted, and a slower build. #SolidJS #Bun #WebDev"
  reddit:
    title: "I moved a signed-in Elysia and Solid 2 app to my own Bun framework and measured both, losses included"
    body: "I build kay, a Bun web framework, and moved an app of mine to it from an Elysia API with Solid 2 islands and a hand-rolled server rendering tier. Both measured as they deploy, behind nginx, signed in: 40% less code, a 7x faster cold start, 73% fewer bytes a phone downloads, and a smaller deploy. Where kay loses: more layout shift on phones, as web fonts reflow the text the server painted, and a slower build, though still under a second."
    subreddits: []
---

This app ran on a stack of my own: an Elysia API, Solid 2 islands over a hand-rolled server rendering tier, and JWT sessions. It is private: its users sign in with Discord to rate profile cards. Moved to [kay](/posts/introducing-kay), signing in through kayjs-auth, it renders every page for a fraction of the CPU and paints much sooner, and it shifts more on a phone and builds slower.

Each side was built and served as it deploys, the Elysia server under Bun against kay's one executable, both behind nginx with HTTP/2, TLS and brotli, on one desktop, a Ryzen 5 7600 with 12 threads on Linux. Each reads its own Postgres, seeded alike, and every page but the sign-in page is measured signed in.

<Stats
  items={[
    {"value": "-40%", "label": "lines of code"},
    {"value": "7x", "label": "faster cold start"},
    {"value": "-73%", "label": "bytes a phone downloads"},
    {"value": "-64%", "label": "deployed size"}
  ]}
/>

## Pages render for a fraction of the old server's CPU

<BarChart
  title="Requests per second"
  unit="req/s"
  better="higher"
  digits={0}
  rows={[
    {"label": "kay", "value": 5208, "group": "home page"},
    {"label": "Elysia + Solid", "value": 1330, "group": "home page"},
    {"label": "kay", "value": 5139, "group": "a round's page"},
    {"label": "Elysia + Solid", "value": 1685, "group": "a round's page"}
  ]}
  bench="elysiaSolid"
  source="32 clients through nginx for 5 s"
/>

Both pages show the signed-in person's own data, so neither is prerendered: this is rendering, at a quarter to under a third of the old server's CPU per request. nginx spends about 50 µs on each instead of 374 to 427, as kay compresses the page itself where the old server left that to nginx.

## Phones paint sooner, and the old app's layout shifted less

<BarChart
  title="Paints on a phone"
  unit="ms"
  better="lower"
  digits={0}
  rows={[
    {"label": "kay", "value": 671, "group": "first paint"},
    {"label": "Elysia + Solid", "value": 1919, "group": "first paint"},
    {"label": "kay", "value": 1830, "group": "largest paint"},
    {"label": "Elysia + Solid", "value": 4016, "group": "largest paint"}
  ]}
  bench="elysiaSolid"
  source="Lighthouse's throttling, median of 5 cold loads per page"
/>

<BarChart
  title="Paints on a desktop"
  unit="ms"
  better="lower"
  digits={0}
  rows={[
    {"label": "kay", "value": 80, "group": "first paint"},
    {"label": "Elysia + Solid", "value": 286, "group": "first paint"},
    {"label": "kay", "value": 405, "group": "largest paint"},
    {"label": "Elysia + Solid", "value": 531, "group": "largest paint"}
  ]}
  bench="elysiaSolid"
  source="Lighthouse's throttling, median of 5 cold loads per page"
/>

kay renders the whole page on the server and inlines its styles, so a phone paints without waiting for a stylesheet or for hydration. That moves weight into the HTML, 10.8 KB a page against 1.7, and splits the JavaScript into more files, about 20 a page against 5.5, for fewer bytes in all.

The layout shifts more on a phone, 0.119 against 0.019. With the page painted from the server's HTML, the web fonts arrive once its text is on screen and reflow it. kay's metric-matched fallback font is meant to hide that swap, but it is Arial through `local()`, which never loads on a machine without Arial, as on the bench machine and likely on Android. The old side drew those sections only after hydration, by which time the fonts were in. On a desktop it shifts less, 0.007 against 0.017, once the port reserved the card image's box.

## The server holds less memory and starts sooner

<BarChart
  title="Server memory after load"
  unit="MB"
  better="lower"
  digits={0}
  rows={[
    {"label": "kay", "value": 120},
    {"label": "Elysia + Solid", "value": 196}
  ]}
  bench="elysiaSolid"
  source="PSS after the load runs"
/>

Once started, before any load, kay holds 71 MB against 121, and it answers its first request 41.5 ms after spawning instead of 297.

## The tests are shorter, and the old build was faster

<BarChart
  title="Build, clean"
  unit="s"
  better="lower"
  digits={2}
  rows={[
    {"label": "Elysia + Solid", "value": 0.38},
    {"label": "kay", "value": 0.74, "note": "no check"},
    {"label": "kay", "value": 0.81}
  ]}
  bench="elysiaSolid"
  source="median of 3 runs"
/>

`kay build` type-checks every template first, which the old build had no equivalent of, and still finishes in under a second, so nobody gets to fetch a coffee either way. The tests shrank with the code, 2,569 lines against 4,487.

<Note title="How it was measured">

kay 1.57.0 on Bun 1.4.3, headless Chromium 151 and nginx 1.30.5 set up as in production, both sides in one sitting. Paints are medians of 5 cold loads per page under Lighthouse's throttling, averaged over the pages; load is 32 clients for 5 s per URL over keepalive HTTP/1.1; builds are the median of 3 clean runs; lines are cloc's code lines of the sources and config. The app's code is private, so the record is [bench/elysia-solid-port.md](https://github.com/Kayno0o/devlog/blob/main/bench/elysia-solid-port.md), every figure with its conditions.

</Note>

The other ports: [a SvelteKit site](/posts/ported-from-sveltekit) and [two Astro sites](/posts/ported-from-astro).
