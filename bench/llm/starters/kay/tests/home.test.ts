import { expect, it } from 'bun:test'
import { testSite } from 'kay/test'

const site = await testSite()

it('greets from the server', async () => {
  const home = await site.visit('/')

  expect(home.status).toBe(200)
  expect(home.html).toContain('Hello from the server')
})
