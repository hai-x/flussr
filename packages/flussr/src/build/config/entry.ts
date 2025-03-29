import { BuildConfig } from '../../config'
import path from 'path'
import fs from 'fs'

export const getEntry = ({
  config,
  serverBuild
}: {
  config: BuildConfig
  serverBuild: boolean
}): Record<string, string[]> => {
  const entry = {}
  const pages = config.pages
  for (const pageName of Object.keys(pages)) {
    const pageContext = pages[pageName]
    const pagePath = path.resolve(pageContext, './index.tsx')

    if (serverBuild) {
      entry[pageName] = [pagePath]
    } else {
      const loaderPath = require.resolve('../client/client-page-loader')
      entry[pageName] = [
        `${loaderPath}?${JSON.stringify({
          pageName,
          pagePath
        })}!`,
        require.resolve('../../client')
      ]
    }
  }
  if (serverBuild) {
    if ('server' in entry) {
      throw new Error('Entry names have conflict with *server*')
    }
    const serverEntry = path.resolve(config.srcContext, './server.ts')
    if (fs.existsSync(serverEntry)) entry['server'] = serverEntry
  }
  return entry
}
