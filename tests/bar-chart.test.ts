import { expect, it } from 'bun:test'
import { renderToString } from 'kay/server'
import BarChart from '../src/components/bar-chart.kay'

const rows = [{ label: 'kay', value: 4788 }, { label: 'Svelte', value: 3853 }]

it('scales bars to the largest value and highlights one row', async () => {
  const html = await renderToString(BarChart, { title: 'Renders', unit: 'renders/s', rows, highlight: 'kay', better: 'higher', digits: 0 })

  expect(html).toContain('width: calc((100% - 6rem) * 1)')
  expect(html).toContain(`width: calc((100% - 6rem) * ${3853 / 4788})`)
  expect(html).toContain('bg-accent')
  expect(html).toContain('higher is better')
  expect(html).toContain('<td>4,788 renders/s</td>')
})
