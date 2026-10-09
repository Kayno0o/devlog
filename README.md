# devlog

A minimalist devlog built with [kay](https://git.kaynooo.fr/kaynooo/kayjs) as a static site: no server, no JavaScript shipped, light and dark themes from the reader's system setting.

## Writing a post

Add a Markdown file to `src/content/posts/`; its file name is the slug, served at `/posts/<slug>`.

```md
---
title: The post's title
description: One sentence, shown on the home page and in the feed.
date: 2026-10-09
tags: [kay, benchmarks]
draft: true
---
```

A draft shows in `bun run dev` only, never in the build or the feed. Code blocks are highlighted at build time by Shiki, `kay` fences included.

Components usable in a post, each tag on its own line, attributes as JSON in braces:

```md
<BarChart title="Server rendering" unit="renders/s" better="higher" highlight="kay" digits={0} rows={[{"label": "kay", "value": 4788}, {"label": "Svelte", "value": 3853}]} source="where the numbers come from" />

<Stats items={[{"value": "8.7 KB", "label": "JS shipped, gzip"}]} />

<Note title="Heads up">

Markdown inside, after a blank line.

</Note>
```

Markdown tables render as they are, for numbers that read better side by side than as bars.

## Commands

```sh
bun install
bun run dev     # http://localhost:3000, drafts included
bun run check   # kay check
bun run test
bun run lint
bun run build   # static site into dist/
```

## Running it

```sh
docker compose -f compose.prod.yaml up -d --build
```

nginx serves `dist` on `127.0.0.1:37144`, with the precompressed `.gz` copies. `SITE_URL` (default `https://devlog.kaynooo.fr`) sets the origin the feed, sitemap and canonical links use.
