import { expect, it } from 'bun:test'
import { socialProblems } from '../src/social'

const frontmatter = /^---\n([\s\S]*?)\n---\n/
const fits = { x: 'x'.repeat(280), bluesky: 'b'.repeat(300), mastodon: 'm'.repeat(476) }

it('takes copy that fits each platform with room for the link', () => {
  expect(socialProblems({ ...fits, reddit: { title: 't'.repeat(300), subreddits: ['bun'] } })).toEqual([])
})

it('counts what each platform counts', () => {
  expect(socialProblems({ ...fits, x: `${'x'.repeat(279)}é` })).toEqual([])
  expect(socialProblems({ ...fits, x: `${'x'.repeat(279)}🚀` })).toEqual(['x: 281 characters, at most 280'])
  expect(socialProblems({ ...fits, bluesky: `${'b'.repeat(299)}👩‍💻` })).toEqual([])
  expect(socialProblems({ ...fits, mastodon: 'm'.repeat(477) })).toEqual(['mastodon: 477 characters, at most 476'])
  expect(socialProblems({ ...fits, reddit: { title: 't'.repeat(301), subreddits: [] } })).toEqual(['reddit: a title of 301 characters, at most 300'])
})

it('leaves the link to the poster', () => {
  expect(socialProblems({ ...fits, bluesky: 'Read it: https://log.kaynooo.fr/posts/a' })).toEqual(['bluesky: holds a link, which the poster adds'])
})

it('fits every post\'s copy to its platforms', async () => {
  const problems: string[] = []

  for (const path of new Bun.Glob('src/content/posts/*/*.md').scanSync()) {
    const yaml = (await Bun.file(path).text()).match(frontmatter)?.[1] ?? ''
    const { social } = Bun.YAML.parse(yaml) as { social?: Parameters<typeof socialProblems>[0] }

    if (social !== undefined) {
      problems.push(...socialProblems(social).map(problem => `${path}: ${problem}`))
    }
  }

  expect(problems).toEqual([])
})
