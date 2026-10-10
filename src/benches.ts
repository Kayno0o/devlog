// The benchmarks posts cite: a BarChart names one with `bench`, and its source line opens with the name and ends with the date.
export const benches = {
  synthetic: { name: 'kay\'s bench', date: '2026-10-10' },
  sveltekit: { name: 'SvelteKit port', date: '2026-10-10' },
  astro: { name: 'Astro ports', date: '2026-10-10' },
  llm: { name: 'LLM benchmark, Opus 5.5, effort high, median of the passing runs', date: '2026-10-10' },
} satisfies Record<string, { name: string, date?: string }>

export type BenchId = keyof typeof benches

export function benchSource(id: BenchId, detail: string | undefined): string {
  const bench: { name: string, date?: string } = benches[id]

  return [bench.name, detail, bench.date].filter(Boolean).join(', ')
}
