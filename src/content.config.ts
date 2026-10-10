import { t } from 'kay'
import { collection } from 'kay/content'
import BarChart from './components/bar-chart.kay'
import Note from './components/note.kay'
import Screenshot from './components/screenshot.kay'
import Stats from './components/stats.kay'
import Tab from './components/tab.kay'
import Tabs from './components/tabs.kay'
import { highlight } from './highlight'

export const posts = collection('content/posts', {
  schema: t.Object({
    title: t.String(),
    description: t.String(),
    date: t.Date(),
    updated: t.Optional(t.Date()),
    tags: t.Array(t.String(), { default: [] }),
    draft: t.Optional(t.Boolean()),
  }),
  components: { BarChart, Note, Screenshot, Stats, Tab, Tabs },
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
