# LLM benchmark

The same site built by a coding agent in kay, SvelteKit, SolidStart and Astro, measuring what each framework costs the agent: tokens split into uncached input, cache writes, cache reads and output, time, turns, tool calls, docs read, check errors and code written.

- `spec.md`: the site, identical for every framework, with its books in `content/books/`.
- `prompt.md`: the prompt, identical apart from the framework's name.
- `starters/`: each framework's own starter as its scaffolder wrote it (`kay new --template server`, `sv create --template minimal` with `adapter-node`, `create-solid` SolidStart 2 `basic`, `create-astro --template minimal` with `@astrojs/node`), patched only to share the `check`, `build` and `start` scripts the spec names. `bun bench/llm/docs.ts` fetches each one's official docs into its `docs/` (gitignored) and records the source in `starters/docs-sources.json`.
- `acceptance/site.test.ts`: the hidden acceptance suite. With no `SITE_URL` it runs against `reference/`, a site built with Bun alone, which is how `bun run test` proves the suite.
- `run.ts`: one headless `claude -p --safe-mode` session per framework and run (no CLAUDE.md, hooks, plugins or MCP servers), in a fresh copy of the starter under `~/.cache/llm-bench/<label>/`, then graded: `bun run check`, `bun run build`, then the suite against `bun run start`. Runs are interleaved across frameworks, and a run already in `results/<label>/` is skipped, so a stopped benchmark resumes.
- `report.ts`: writes `results/<label>/results.md` and `summary.json` from the run files.

## Running it

```sh
bun bench/llm/docs.ts
bun bench/llm/run.ts --frameworks kay --runs 1 --model sonnet --budget 5 --label smoke
bun bench/llm/run.ts --runs 5 --model opus
```

Options: `--frameworks` (comma separated), `--runs` (5), `--model` (opus), `--effort` (high), `--budget` in USD per run (30), `--minutes` per run (90), `--label` (date and model), `--grade-only` to grade workspaces again without running the agent.
