import path from 'path'
import express from 'express'
import { DevConfig } from '../../config'
import { build } from '../build'

export const dev = async (devConfig: Partial<DevConfig>) => {
  const { dir } = devConfig
  try {
    await build()
    const _dir = path.resolve(dir || '.')
    const distDir = path.join(_dir, '.flussr')
    const app = express()
    const { prepare } = require('../../server')
    prepare({ dir: distDir, app })
    app.use(express.static(distDir))
    app.use(express.static(path.join(_dir, 'public')))
    const { default: start } = require(path.join(distDir, 'server/server'))
    start(app)
    app.listen(4000, () => console.log('listening...'))
  } catch (err) {
    console.error('err', err)
    process.exit(1)
  }
}
