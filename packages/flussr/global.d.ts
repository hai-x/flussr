import { FC } from 'react'

declare namespace NodeJS {
  interface ProcessEnv {
    // process.env.PUBLIC_FOO
    IS_SERVER: string
  }
}

declare let __webpack_modules__: Record<string, any>
declare let __non_webpack_require__: () => any

declare global {
  interface Window {
    __COMP: [
      string,
      () => {
        default: FC
      }
    ][]

    __STREAM_DATA__?: any
  }
}
