import { type Express } from 'express'
import errorHandler from './server-error-handler'

import path from 'path'
import { Manifest } from '../types'

export { default as renderHandler } from './server-render-handler'

export type App = Express & {
  manifests: {
    clientManifest: Manifest
    serverManifest: Manifest
  }
}

const injectManifest = ({ dir, app }: { dir: string; app: App }) => {
  const clientManifest = require(path.resolve(dir, './client-manifest.json'))
  const serverManifest = require(path.resolve(dir, './server-manifest.json'))

  if (!clientManifest || !serverManifest) {
    console.error('manifests not found!')
    process.exit(1)
  }

  app.manifests = {
    clientManifest,
    serverManifest
  }

  return app
}

export const prepare = ({ dir, app }: { dir: string; app: App }) => {
  injectManifest({ dir, app })
  app.use(errorHandler)
  return app
}
