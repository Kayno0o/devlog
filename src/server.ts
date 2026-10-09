import { Elysia } from 'elysia'
import { pages } from 'kay/server'

// Only `kay dev` runs this; the site ships as the static files `kay build --static` writes.
export const app = new Elysia().use(await pages()).listen(3000)
