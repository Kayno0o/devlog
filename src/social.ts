import type { Static } from 'kay'
import { s } from 'kay'

// the copy a post is shared with, written with the post and sent by the poster once it is live
export const social = s.Object({
  x: s.String(),
  bluesky: s.String(),
  mastodon: s.String(),
  reddit: s.Optional(s.Object({
    title: s.String(),
    body: s.Optional(s.String()),
    subreddits: s.Array(s.String()),
  })),
})

export type Social = Static<typeof social>

// the poster adds the post's link itself: in a reply on X, as a card on Bluesky, after the text on Mastodon, where a link counts 23
const limits = { x: 280, bluesky: 300, mastodon: 500 - 24, redditTitle: 300 }
const link = /https?:\/\//
const graphemes = new Intl.Segmenter('en', { granularity: 'grapheme' })

// X counts Latin text and common punctuation once and anything else, emoji included, twice
function xLength(text: string): number {
  let length = 0

  for (const char of text) {
    const code = char.codePointAt(0) ?? 0

    length += code <= 0x10FF || (code >= 0x2000 && code <= 0x206F) ? 1 : 2
  }

  return length
}

export function socialProblems(copy: Social): string[] {
  const problems: string[] = []
  const lengths = {
    x: xLength(copy.x),
    bluesky: [...graphemes.segment(copy.bluesky)].length,
    mastodon: [...copy.mastodon].length,
  }

  for (const platform of ['x', 'bluesky', 'mastodon'] as const) {
    if (lengths[platform] > limits[platform]) {
      problems.push(`${platform}: ${lengths[platform]} characters, at most ${limits[platform]}`)
    }

    if (link.test(copy[platform])) {
      problems.push(`${platform}: holds a link, which the poster adds`)
    }
  }

  if (copy.reddit !== undefined && copy.reddit.title.length > limits.redditTitle) {
    problems.push(`reddit: a title of ${copy.reddit.title.length} characters, at most ${limits.redditTitle}`)
  }

  return problems
}
