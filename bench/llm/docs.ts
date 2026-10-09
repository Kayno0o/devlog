// Writes each starter's offline docs/ folder from its framework's official docs, and records where they came from in starters/docs-sources.json.
import { cpSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'

const starters = join(import.meta.dir, 'starters')

interface Source {
  source: string
  revision?: string
  fetchedAt: string
  files: number
}

async function mirror(index: string, out: string): Promise<number> {
  const origin = new URL(index).origin
  let text = await (await fetch(index)).text()
  const links = [...new Set([...text.matchAll(/\]\((\S+?)\)/g)].map(match => match[1] ?? ''))]
  const local = links.map(link => ({ link, url: new URL(link, index) })).filter(({ url }) => url.origin === origin)
  let files = 1
  const queue = [...local]
  const worker = async (): Promise<void> => {
    for (let next = queue.shift(); next; next = queue.shift()) {
      const response = await fetch(next.url)

      if (!response.ok) {
        console.warn(`skipped ${next.url.href}: ${response.status}`)

        continue
      }

      const path = join(out, decodeURIComponent(next.url.pathname))

      mkdirSync(dirname(path), { recursive: true })
      await Bun.write(path, await response.text())
      files++
    }
  }

  await Promise.all(Array.from({ length: 8 }, worker))
  for (const { link, url } of local) {
    text = text.replaceAll(`](${link})`, () => `](.${decodeURIComponent(url.pathname)})`)
  }
  await Bun.write(join(out, 'llms.txt'), text)

  return files
}

async function astro(out: string): Promise<{ files: number, revision: string }> {
  const clone = join(out, '..', '.astro-docs')

  rmSync(clone, { recursive: true, force: true })
  const git = async (...args: string[]): Promise<string> => {
    const process = Bun.spawn(['git', ...args], { cwd: clone, stdout: 'pipe', stderr: 'inherit' })

    if (await process.exited !== 0) {
      throw new Error(`git ${args.join(' ')} failed`)
    }

    return (await new Response(process.stdout).text()).trim()
  }

  mkdirSync(clone)
  await git('clone', '--depth', '1', '--filter=blob:none', '--sparse', 'https://github.com/withastro/docs', '.')
  await git('sparse-checkout', 'set', 'src/content/docs/en')
  const revision = await git('rev-parse', 'HEAD')

  cpSync(join(clone, 'src/content/docs/en'), out, { recursive: true })
  rmSync(clone, { recursive: true, force: true })
  const files = [...new Bun.Glob('**/*').scanSync(out)].length

  return { files, revision }
}

const sources: Record<string, Source> = {}
const fetchedAt = new Date().toISOString()

for (const framework of ['kay', 'sveltekit', 'solidstart', 'astro']) {
  const out = join(starters, framework, 'docs')

  rmSync(out, { recursive: true, force: true })
  mkdirSync(out, { recursive: true })

  if (framework === 'kay') {
    const kay = join(starters, 'kay/node_modules/kay')

    cpSync(join(kay, 'llms.txt'), join(out, 'llms.txt'))
    cpSync(join(kay, 'llms'), join(out, 'llms'), { recursive: true })
    const { version } = await Bun.file(join(kay, 'package.json')).json() as { version: string }

    sources.kay = { source: `kay ${version} package (llms.txt, llms/)`, fetchedAt, files: 1 + [...new Bun.Glob('*.md').scanSync(join(out, 'llms'))].length }
  }
  else if (framework === 'sveltekit') {
    sources.sveltekit = { source: 'https://svelte.dev/llms.txt and the files it links', fetchedAt, files: await mirror('https://svelte.dev/llms.txt', out) }
  }
  else if (framework === 'solidstart') {
    sources.solidstart = { source: 'https://docs.solidjs.com/llms.txt and the pages it links', fetchedAt, files: await mirror('https://docs.solidjs.com/llms.txt', out) }
  }
  else {
    // Astro dropped its llms.txt in April 2026, so its docs are the English Markdown source of docs.astro.build
    const { files, revision } = await astro(out)

    sources.astro = { source: 'https://github.com/withastro/docs src/content/docs/en', revision, fetchedAt, files }
  }

  console.log(`${framework}: ${sources[framework]?.files} files`)
}

await Bun.write(join(starters, 'docs-sources.json'), `${JSON.stringify(sources, null, 2)}\n`)
