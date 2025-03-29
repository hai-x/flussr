import path from 'path'
import fs from 'fs'
import { type FlussrConfig } from './type'
export * from './buid'
export * from './type'

const resolveConfigPath = (cwd: string = process.cwd()) => {
  const CONFIG_FILES = [
    'flussr.config.mjs',
    'flussr.config.ts',
    'flussr.config.js',
    'flussr.config.cjs',
    'flussr.config.mts',
    'flussr.config.cts'
  ]

  for (const file of CONFIG_FILES) {
    const configFile = path.join(cwd, file)

    if (fs.existsSync(configFile)) {
      return configFile
    }
  }

  return null
}

export const loadConfig = async (cwd: string = process.cwd()) => {
  const _default: FlussrConfig = {
    rspack: () => () => ({})
  }
  const confPath = resolveConfigPath(cwd)
  if (!confPath) return _default
  const { createJiti } = await import('jiti')
  const jiti = createJiti(__filename, {
    moduleCache: false,
    interopDefault: true
  })
  const modDefault = await jiti.import<FlussrConfig>(confPath, {
    default: true
  })
  return modDefault
}
