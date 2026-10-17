import { s } from 'kay'
import { collection } from 'kay/content'
import BarChart from './components/bar-chart.kay'
import BenchTable from './components/bench-table.kay'
import Embed from './components/embed.kay'
import Note from './components/note.kay'
import Stats from './components/stats.kay'
import Tab from './components/tab.kay'
import Tabs from './components/tabs.kay'
import { highlight } from './highlight'

export const posts = collection('content/posts', {
  localized: true,
  schema: s.Object({
    title: s.String(),
    description: s.String(),
    date: s.Date(),
    updated: s.Optional(s.Date()),
    tags: s.Array(s.String(), { default: [] }),
    draft: s.Optional(s.Boolean()),
  }),
  components: { BarChart, BenchTable, Embed, Note, Stats, Tab, Tabs },
  highlight,
  draft: post => post.data.draft === true,
  sort: (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  feed: {
    path: '/rss.xml',
    title: 'devlog',
    description: 'Notes on building kay, a Bun web framework.',
    item: post => ({ title: post.data.title, path: `/posts/${post.slug}`, date: post.data.date, description: post.data.description }),
  },
})
