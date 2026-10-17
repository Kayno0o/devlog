import { expect, it } from 'bun:test'
import { renderToString } from 'kay/server'
import BenchTable from '../src/components/bench-table.kay'

const columns = ['kay', 'SolidJS', 'Svelte']
const rows = [{ label: 'Swap rows', values: [2.3, 1.9, 1.9] }, { label: 'Select a row', values: [0.2, 0.3, 1] }]

it('marks each row\'s best cells and gives the others their gap to it', async () => {
  const html = await renderToString(BenchTable, { title: 'Table operations', unit: 'ms', columns, rows, bench: 'synthetic' })

  expect(html.match(/bg-accent\/20/g)).toHaveLength(3)
  expect(html).toContain('<span class="block text-xs text-muted">+21%</span>')
  expect(html).toContain('<span class="block text-xs text-muted">+400%</span>')
  expect(html).toContain('ms, lower is better')
  expect(html).toContain('Source: kay\'s bench, 2026-10-17')
})

it('heads a column per framework, in order, kay in bold', async () => {
  const html = await renderToString(BenchTable, { title: 'Table operations', unit: 'ms', columns, rows })

  expect(html.indexOf('>kay')).toBeLessThan(html.indexOf('>SolidJS'))
  expect(html.indexOf('>SolidJS')).toBeLessThan(html.indexOf('>Svelte'))
  expect(html).toMatch(/<th class="[^"]*font-semibold[^"]*" scope="col"><span[^>]*>kay/)
})

it('takes the highest as best when higher is better, in French too', async () => {
  const html = await renderToString(BenchTable, { title: 'Rendu', unit: 'rendus/s', better: 'higher', columns: ['kay', 'Svelte'], rows: [{ label: 'Produits', values: [4000, 3000] }] }, { locale: 'fr' })

  expect(html).toContain('meilleur')
  expect(html).toContain('-25 %')
  expect(html).toContain('rendus/s, plus haut, c\'est mieux')
})

it('gives a row\'s values the same decimals, none when all are whole', async () => {
  const html = await renderToString(BenchTable, { title: 'Table operations', unit: 'ms', columns: ['kay', 'Svelte'], rows: [{ label: 'Remove a row', values: [1.9, 2] }, { label: 'Create 10,000 rows', values: [228, 264] }] })

  expect(html).toContain('<span class="block">2.0</span>')
  expect(html).toContain('<span class="block">264</span>')
})
