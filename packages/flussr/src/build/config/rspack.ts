import {
  type RspackOptions,
  HotModuleReplacementPlugin,
  ProgressPlugin,
  DefinePlugin
} from '@rspack/core'
import path from 'path'
import { type BuildConfig } from '../../config'
import { getEntry } from './entry'
import webpackNodeExternals from 'webpack-node-externals'
import ReactRefreshPlugin from '@rspack/plugin-react-refresh'

import { RspackManifestPlugin } from 'rspack-manifest-plugin'
import { flussrServerBundleContext } from '../../constants'
import { commonRspackConfig } from './common'

export const getServerBuildConfig = (buildConfig: BuildConfig) => {
  const isDev = process.env.__DEV__
  const { outputPath } = buildConfig
  const common = commonRspackConfig()
  const _config: RspackOptions = {
    ...common,
    entry: getEntry({
      config: buildConfig,
      serverBuild: true
    }),
    target: 'node',
    // TODO
    externals: [webpackNodeExternals(), 'react', 'react-dom'],
    output: {
      path: path.resolve(outputPath, './server'),
      libraryTarget: 'commonjs2',
      filename: '[name]/index.js'
    },
    module: {
      rules: [
        {
          test: /\.svg|png$/,
          type: 'asset'
        },
        {
          test: /\.(?:js|jsx|mjs|cjs|ts|tsx|mts|cts)$/,
          type: 'javascript/auto',
          use: [
            {
              loader: 'builtin:swc-loader',
              options: {
                env: {
                  mode: undefined,
                  targets: [
                    'chrome >= 87',
                    'edge >= 88',
                    'firefox >= 78',
                    'safari >= 14'
                  ]
                },
                isModule: 'unknown',
                jsc: {
                  externalHelpers: true,
                  parser: {
                    decorators: true,
                    syntax: 'typescript',
                    tsx: true
                  },
                  transform: {
                    react: {
                      pragma: 'React.createElement',
                      pragmaFrag: 'React.Fragment',
                      throwIfNamespace: true,
                      development: isDev,
                      useBuiltins: false
                    }
                  }
                }
              }
            }
          ]
        },
        {
          test: /\.(sass|scss)$/,
          use: [
            {
              loader: 'sass-loader',
              options: {
                // using `modern-compiler` and `sass-embedded` together significantly improve build performance,
                // requires `sass-loader >= 14.2.1`
                api: 'modern-compiler',
                implementation: require.resolve('sass-embedded')
              }
            }
          ],
          // set to 'css/auto' if you want to support '*.module.(scss|sass)' as CSS Modules, otherwise set type to 'css'
          type: 'css/auto'
        }
      ]
    },
    optimization: {
      ...common.optimization,
      splitChunks: false
    },
    plugins: [
      new ProgressPlugin({ prefix: 'server' }),
      new DefinePlugin({
        'typeof window': JSON.stringify('undefined'),
        'process.env.IS_SERVER': JSON.stringify(true),
        'process.env.NODE_ENV': JSON.stringify(
          isDev ? 'development' : 'production'
        )
      }),
      new RspackManifestPlugin({
        fileName: path.join(outputPath, 'server-manifest.json'),
        generate(seed, files) {
          const v = files.reduce(
            (manifest, file) =>
              Object.assign(manifest, { [file.name]: file.path }),
            seed
          )
          v[flussrServerBundleContext] = path.resolve(outputPath, './server')
          return v
        }
      })
    ].filter(Boolean)
  }

  buildConfig.flussrConfig?.rspack?.({ isServer: true })(_config)

  return _config
}

export const getClientBuildConfig = (buildConfig: BuildConfig) => {
  const isDev = process.env.__DEV__
  const { outputPath } = buildConfig
  const common = commonRspackConfig()

  const _config: RspackOptions = {
    ...common,
    node: false,
    entry: getEntry({
      config: buildConfig,
      serverBuild: false
    }),
    target: 'web',
    output: {
      publicPath: '/static/',
      path: path.resolve(outputPath, './static'),
      chunkFilename: '[id].chunk.js'
    },
    module: {
      rules: [
        {
          test: /\.svg|png$/,
          type: 'asset'
        },
        {
          test: /\.(?:js|jsx|mjs|cjs|ts|tsx|mts|cts)$/,
          type: 'javascript/auto',
          use: [
            {
              loader: 'builtin:swc-loader',
              options: {
                env: {
                  mode: undefined,
                  targets: [
                    'chrome >= 87',
                    'edge >= 88',
                    'firefox >= 78',
                    'safari >= 14'
                  ]
                },
                isModule: 'unknown',
                jsc: {
                  externalHelpers: true,
                  parser: {
                    decorators: true,
                    syntax: 'typescript',
                    tsx: true
                  },
                  transform: {
                    react: {
                      development: isDev,
                      refresh: isDev
                    }
                  }
                }
              }
            }
          ]
        },
        {
          test: /\.(sass|scss)$/,
          use: [
            {
              loader: 'sass-loader',
              options: {
                // using `modern-compiler` and `sass-embedded` together significantly improve build performance,
                // requires `sass-loader >= 14.2.1`
                api: 'modern-compiler',
                implementation: require.resolve('sass-embedded')
              }
            }
          ],
          // set to 'css/auto' if you want to support '*.module.(scss|sass)' as CSS Modules, otherwise set type to 'css'
          type: 'css/auto'
        }
      ]
    },

    plugins: [
      isDev && new ReactRefreshPlugin(),
      isDev && new HotModuleReplacementPlugin(),
      new ProgressPlugin({ prefix: 'client' }),
      new DefinePlugin({
        'process.env.IS_SERVER': JSON.stringify(false),
        'process.env.NODE_ENV': JSON.stringify(
          isDev ? 'development' : 'production'
        )
      }),
      new RspackManifestPlugin({
        fileName: path.join(outputPath, 'client-manifest.json'),
        generate(seed, files = [], entries) {
          const _entries: Record<
            string,
            {
              js: string[]
              css: string[]
            }
          > = {}
          for (const key of Object.keys(entries)) {
            _entries[key] = {
              js: entries[key]
                .filter((x) => x.endsWith('.js'))
                .map((x) => files.find((file) => file.name === x)?.path!)
                .filter(Boolean),
              css: entries[key]
                .filter((x) => x.endsWith('.css'))
                .map((x) => files.find((file) => file.name === x)?.path!)
                .filter(Boolean)
            }
          }
          return _entries
        }
      })
    ].filter(Boolean)
  }

  buildConfig.flussrConfig?.rspack?.({ isServer: false })(_config)

  return _config
}
