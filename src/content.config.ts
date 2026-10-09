import { t } from 'kay'
import { collection } from 'kay/content'
import BarChart from './components/bar-chart.kay'
import Note from './components/note.kay'
import Stats from './components/stats.kay'
import { highlight } from './highlight'
import { feedPath } from './site'

export const posts = collection('content/posts', {
  schema: t.Object({
    title: t.String(),
    description: t.String(),
    date: t.Date(),
    tags: t.Array(t.String(), { default: [] }),
    draft: t.Optional(t.Boolean()),
  }),
  components: { BarChart, Note, Stats },
  highlight,
  draft: post => post.data.draft === true,
  sort: (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  feed: {
    path: feedPath,
    title: 'devlog',
    description: 'Notes on building kay, a Bun web framework.',
    item: post => ({ title: post.data.title, path: `/posts/${post.slug}`, date: post.data.date, description: post.data.description }),
  },
})
