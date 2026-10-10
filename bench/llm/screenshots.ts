// Screenshots the books page each framework's agent built, from its passing run of median cost, as <framework>.jpg and <framework>-dark.jpg for the post; runs named after the label, such as kay-3, are shot alone, as <run>.jpg.
// Each site's own styles are swapped for screenshot.css in the devlog's colors, so the shots compare what the agents built, not how each styled it.
// bun bench/llm/screenshots.ts <label> [run...], once no benchmark is running, since it serves the graded builds
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { chromium } from 'playwright-core'
import { freePort, startSite } from './lib/site'
import { benchDir } from './lib/workspace'

interface Result {
  framework: string
  run: number
  metrics: { costUsd?: number }
  grade: { passed: boolean }
  workspace: string
}

const [label, ...named] = process.argv.slice(2)

if (label === undefined) {
  throw new Error('usage: bun bench/llm/screenshots.ts <label> [run...]')
}

const resultsDir = join(benchDir, 'results', label)
const outDir = join(benchDir, '../../public/llm-bench')
const colorToken = /--color-[\w-]+:[^;]+;/g
const tokens = (await Bun.file(join(benchDir, '../../src/app.css')).text()).match(colorToken) ?? []
const stylesheet = `:root { ${tokens.join(' ')} }\n${await Bun.file(join(benchDir, 'screenshot.css')).text()}`
const passing: Result[] = []

for await (const file of new Bun.Glob('*-*.json').scan(resultsDir)) {
  const result = await Bun.file(join(resultsDir, file)).json() as Result

  if (result.grade.passed) {
    passing.push(result)
  }
}

const name = (result: Result): string => `${result.framework}-${result.run}`
const shots: { result: Result, name: string }[] = []

if (named.length > 0) {
  for (const run of named) {
    const result = passing.find(candidate => name(candidate) === run)

    if (result === undefined) {
      throw new Error(`no passing run ${run} in ${resultsDir}`)
    }

    shots.push({ result, name: run })
  }
}
else {
  for (const [framework, results] of Map.groupBy(passing, result => result.framework)) {
    const sorted = results.toSorted((a, b) => (a.metrics.costUsd ?? 0) - (b.metrics.costUsd ?? 0))
    // the lower middle on an even count, so the run shown is one that happened
    const result = sorted[Math.floor((sorted.length - 1) / 2)]

    if (result !== undefined) {
      shots.push({ result, name: framework })
    }
  }
}

await mkdir(outDir, { recursive: true })

const browser = await chromium.launch()

try {
  for (const shot of shots) {
    const { result } = shot
    const site = await startSite(join(result.workspace, 'site'), freePort(4900))

    try {
      const page = await browser.newPage({ viewport: { width: 1024, height: 640 } })

      await page.goto(`${site.url}/books`, { waitUntil: 'networkidle' })
      await page.$$eval('link[rel="stylesheet"], style', (nodes) => {
        for (const node of nodes) {
          node.remove()
        }
      })
      await page.addStyleTag({ content: stylesheet })

      for (const [scheme, suffix] of [['light', ''], ['dark', '-dark']] as const) {
        await page.emulateMedia({ colorScheme: scheme })
        await page.screenshot({ path: join(outDir, `${shot.name}${suffix}.jpg`), type: 'jpeg', quality: 80 })
      }

      await page.close()
      console.log(`${shot.name}: ${name(result)}, $${(result.metrics.costUsd ?? 0).toFixed(2)}`)
    }
    finally {
      await site.stop()
    }
  }
}
finally {
  await browser.close()
}
