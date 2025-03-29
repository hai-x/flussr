import { RspackOptions } from '@rspack/core'

export const commonRspackConfig = (): RspackOptions => {
  const isDev = process.env.__DEV__

  return {
    mode: isDev ? 'development' : 'production',
    experiments: {
      css: true
    },
    devtool: isDev ? 'cheap-module-source-map' : 'source-map',
    optimization: {
      minimize: false
    },
    resolve: {
      extensions: ['.js', '.jsx', '.json', '.mjs', '.wasm', '.ts', '.tsx']
    }
  }
}
