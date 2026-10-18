import { t } from 'kay/i18n'

// The benchmarks posts cite: a BarChart names one with `bench`, and its source line opens with its name from the messages and ends with the date.
export const benches = {
  synthetic: { date: '2026-10-18' },
  sveltekit: { date: '2026-10-18' },
  astro: { date: '2026-10-18' },
  llm: { date: '2026-10-17' },
} satisfies Record<string, { date?: string }>

export type BenchId = keyof typeof benches

export function benchSource(id: BenchId, detail: string | undefined): string {
  const bench: { date?: string } = benches[id]

  return [t(`benches.${id}`), detail, bench.date].filter(Boolean).join(', ')
}
