import { RspackOptions } from '@rspack/core'

export type FlussrConfig = {
  rspack?: ({
    isServer
  }: {
    isServer: boolean
  }) => (options: RspackOptions) => RspackOptions
}

export type BuildConfig = {
  context: string
  srcContext: string
  outputPath: string
  pages: Record<string, string>
  flussrConfig: FlussrConfig
}

export type DevConfig = BuildConfig & {
  dir: string
}
