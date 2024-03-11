import os from 'node:os'
import * as path from 'node:path'
import { z } from 'zod'

const processSchema = z.object({
  path: z.string(),
  commands: z.array(z.string()),
})

const workspaceSchema = z.object({
  name: z.string(),
  processes: z.array(processSchema),
})

const configSchema = z.object({
  workspaces: z.array(workspaceSchema),
})

export const getConfig = async () => {
  const configPath = path.join(os.homedir(), '.config/ryouiki/config.json')

  if (await Bun.file(configPath).exists()) {
    const rawConfig = await import(configPath)
    const result = configSchema.safeParse(rawConfig)
    if (result.success) return result.data
  }

  const initialConfig = {
    workspaces: [],
  }

  await Bun.write(configPath, JSON.stringify(initialConfig, null, 2), {
    createPath: true,
  })

  return initialConfig
}
