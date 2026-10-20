export type Framework = 'kay' | 'svelte' | 'solid' | 'astro' | 'next' | 'nuxt'

const frameworks = new Map<string, Framework>([['kay', 'kay'], ['Svelte', 'svelte'], ['SvelteKit', 'svelte'], ['SolidJS', 'solid'], ['SolidStart', 'solid'], ['Astro', 'astro'], ['Next', 'next'], ['Next.js', 'next'], ['Nuxt', 'nuxt'], ['Elysia + Solid', 'solid']])

// A label is a framework, then maybe its site: `SvelteKit` or `Astro, painter`.
export function frameworkOf(label: string): Framework | undefined {
  const comma = label.indexOf(',')

  return frameworks.get(comma === -1 ? label : label.slice(0, comma))
}
