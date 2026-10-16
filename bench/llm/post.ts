// Prints the Stats and BarChart lines of the post's "Built for LLMs too" section from one label's summary.json.
// bun bench/llm/post.ts <label>
import { join } from 'node:path'
import process from 'node:process'
import { benches } from '../../src/benches'
import messages from '../../src/messages/en'
import { benchDir } from './lib/workspace'

interface Spread {
  median: number
  min: number
  max: number
}

interface Summary {
  model: string
  requested: { effort: string }
  to: string
  frameworks: Record<string, { runs: number, passed: number, measures: Record<string, Spread> }>
}

const label = process.argv[2]

if (label === undefined) {
  throw new Error('usage: bun bench/llm/post.ts <label>')
}

const summary = await Bun.file(join(benchDir, 'results', label, 'summary.json')).json() as Summary
// claude-opus-5-5 reads Opus 5.5.
const modelId = /^claude-(\w+)-(\d+)-(\d+)$/
const names: Record<string, string> = { kay: 'kay', sveltekit: 'SvelteKit', solidstart: 'SolidStart', astro: 'Astro', nuxt: 'Nuxt', next: 'Next.js' }
const frameworks = Object.entries(summary.frameworks)
const spread = (framework: string, key: string): Spread => summary.frameworks[framework]?.measures[key] ?? { median: 0, min: 0, max: 0 }
const median = (framework: string, key: string): number => spread(framework, key).median
const runs = frameworks.reduce((sum, [, framework]) => sum + framework.runs, 0)
const passed = frameworks.reduce((sum, [, framework]) => sum + framework.passed, 0)
const model = summary.model.replace(modelId, (_, family: string, major: string, minor: string) => `${family[0]?.toUpperCase()}${family.slice(1)} ${major}.${minor}`)
const source = `LLM benchmark, ${model}, effort ${summary.requested.effort}, median of the passing runs, ${summary.to.slice(0, 10)}`

if (`${messages.benches.llm}, ${benches.llm.date}` !== source) {
  console.error(`benches.llm in src/messages/en.ts, then its date in src/benches.ts, should read: ${source}`)
}

function chart(title: string, unit: string, key: string, digits: number, { scale = 1, lowerIsBetter = true } = {}): string {
  const round = (value: number): number => Number((value / scale).toFixed(digits))
  const rows = frameworks.map(([framework]) => {
    const { median, min, max } = spread(framework, key)

    return { label: names[framework] ?? framework, value: round(median), range: [round(min), round(max)] }
  }).toSorted((a, b) => a.value - b.value)

  return `<BarChart title="${title}" unit="${unit}" ${lowerIsBetter ? 'better="lower" ' : ''}digits={${digits}} rows={${JSON.stringify(rows)}} bench="llm" />`
}

const others = frameworks.filter(([framework]) => framework !== 'kay').map(([framework]) => median(framework, 'outputTokens'))
const thousands = (value: number): string => `${Math.round(value / 1000)}K`

const stats = [
  { value: `${passed} of ${runs}`, label: 'runs passing every check and test' },
  { value: `${thousands(median('kay', 'outputTokens'))} vs ${thousands(Math.min(...others))} to ${thousands(Math.max(...others))}`, label: 'tokens written, kay against the others' },
]

console.log([
  `<Stats items={${JSON.stringify(stats)}} />`,
  chart('Time to build the site', 'min', 'minutes', 1),
  chart('Lines of code written, tests and styles left out', 'lines', 'linesWritten', 0),
  chart('Cost of the site, API prices', 'USD', 'costUsd', 2),
  chart('Docs read', 'K characters', 'docsChars', 0, { scale: 1000, lowerIsBetter: false }),
].join('\n\n'))
