// Prints the lines of code of each app in kay's synthetic bench, at a kayjs ref, as the rows of a BarChart.
// bun bench/synthetic-loc.ts [ref] (KAYJS points at the kayjs checkout, ~/Workspace/kayjs by default)
import { mkdtemp, rm } from 'node:fs/promises'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { $ } from 'bun'

const labels: Record<string, string> = { kay: 'kay', solid: 'SolidJS', svelte: 'Svelte', astro: 'Astro', next: 'Next.js', nuxt: 'Nuxt' }
// The server glue mounting and building each app in the bench (Next's is a relay only the bench needs), type shims and package files are left out.
const skipped = String.raw`^(app\.ts|build\.ts|entry\.ts|.*\.d\.ts|.*\.json)$`

const kayjs = process.env.KAYJS ?? join(homedir(), 'Workspace', 'kayjs')
const ref = process.argv[2] ?? 'HEAD'
const commit = (await $`git -C ${kayjs} rev-parse --short ${ref}`.text()).trim()
const dir = await mkdtemp(join(tmpdir(), 'synthetic-loc-'))

try {
  await $`git -C ${kayjs} archive ${commit} bench/apps | tar -x -C ${dir}`

  const rows = await Promise.all(Object.entries(labels).map(async ([app, label]) => {
    // .kay files take C-style comments, which is how they're written.
    const report = await $`cloc --json --quiet --force-lang=C++,kay --not-match-f=${skipped} ${join(dir, 'bench', 'apps', app)}`.json() as { SUM: { code: number } }

    return { label, value: report.SUM.code }
  }))

  console.log(`kayjs ${commit}, cloc ${(await $`cloc --version`.text()).trim()}`)
  console.log(JSON.stringify(rows.toSorted((a, b) => a.value - b.value)))
}
finally {
  await rm(dir, { recursive: true, force: true })
}
