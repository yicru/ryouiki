import { Hono } from 'hono'
import { getConfig } from './lib/config'

const app = new Hono()

app.get('/workspaces', async (c) => {
  const config = await getConfig()
  return c.json(config)
})

export default {
  port: 4000,
  fetch: app.fetch,
}
