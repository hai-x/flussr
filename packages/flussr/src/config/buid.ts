import path from 'path'
import { globSync } from 'glob'
import { BuildConfig } from './type'

export const defaultConfig: BuildConfig = {
  context: process.cwd(),
  outputPath: path.resolve(process.cwd(), '.flussr'),
  srcContext: path.resolve(process.cwd(), 'src'),
  pages: {},
  flussrConfig: {
    rspack: () => () => ({})
  }
}

export const getBuildConfig = (buildConfig: Partial<BuildConfig>) => {
  const buildConf: BuildConfig = Object.assign({}, defaultConfig, buildConfig)
  if (!buildConf.pages.length) {
    buildConf.pages = globSync('src/pages/*', {
      cwd: buildConf.context
    }).reduce<Record<string, string>>((prev, cur) => {
      const name = path.basename(cur)
      return {
        ...prev,
        [name]: cur
      }
    }, {})
  }

  return buildConf
}
