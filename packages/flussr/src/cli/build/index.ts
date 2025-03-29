import rspack from '@rspack/core'
import { getClientBuildConfig, getServerBuildConfig } from '../../build'
import fs from 'fs'
import path from 'path'
import { loadConfig, BuildConfig, getBuildConfig } from '../../config'

export const build = async (buildConfig?: Partial<BuildConfig>) => {
  const flussrConfig = await loadConfig()
  const _buildConfig = getBuildConfig(
    Object.assign({}, buildConfig, { flussrConfig })
  )

  const compiler = rspack([
    getServerBuildConfig(_buildConfig),
    getClientBuildConfig(_buildConfig)
  ])

  return new Promise((resolve, reject) => {
    compiler.run((err, multi) => {
      if (err) {
        console.error(`Build with fatal error...`)
        console.error(err.stack || err)
        reject()
      }
      ;[
        { name: 'Server', stats: multi?.stats?.[0] },
        {
          name: 'Client',
          stats: multi?.stats?.[1]
        }
      ].forEach(({ name, stats }) => {
        if (stats?.hasErrors()) {
          const errors = stats?.toJson()?.errors || []
          console.error(`${name} build error...`)
          errors.forEach((error) => {
            console.error(error.message)
            if (error.stack) {
              console.error(error.stack)
            }
          })
          reject()
        }
      })

      compiler.close((closeErr) => {
        if (closeErr) {
          console.error(`Build with close error...`)
          reject()
        }
        fs.writeFileSync(
          path.join(_buildConfig.outputPath, 'package.json'),
          JSON.stringify({ type: 'commonjs' })
        )
        resolve(undefined)
      })
    })
  })
}
