import { zValidator } from '@hono/zod-validator'
import { $ } from 'bun'
import { Hono } from 'hono'
import { HTTPException } from 'hono/dist/types/http-exception'
import { z } from 'zod'
import { getConfig } from './lib/config'

const app = new Hono()

app.get('/workspaces', async (c) => {
  const config = await getConfig()
  return c.json(config)
})

app.post(
  '/workspaces/run',
  zValidator('json', z.object({ index: z.coerce.number() })),
  async (c) => {
    const json = c.req.valid('json')
    const config = await getConfig()

    const workspace = config.workspaces[json.index]

    if (!workspace) {
      throw new HTTPException(404, {
        message: 'Workspace not found',
      })
    }

    const promises = workspace.processes.map(async (process) => {
      for await (const command of process.commands) {
        await $`/bin/sh -c ${command}`.cwd(process.path)
      }
    })

    await Promise.all(promises)

    return c.json({ ok: true })
  },
)

export default {
  port: 0,
  fetch: app.fetch,
}
