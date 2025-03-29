import { RequestHandler } from 'express'
import { renderToPipeableStream, renderToStaticMarkup } from 'react-dom/server'
import { type Manifests, type Manifest } from '../types'
import path from 'path'
import { flussrInitData, flussrServerBundleContext } from '../constants'
import serialize from 'serialize-javascript'
import { PassThrough } from 'stream'
import { createSuspenseMap, StreamCtx } from '../context/StreamCtx'
import { InitData, InitDataCtx } from '../context/InitDataCtx'
import { PageExportsCtx } from '../context/PageExportsCtx'

const IOS_PADDING = '<div hidden>' + '\u200b'.repeat(200) + '</div>'

const renderHeader = ({ js, css }: { js: string[]; css: string[] }) => {
  return renderToStaticMarkup(
    <head>
      {js.length ? (
        <>
          {js.map((src) => (
            <link
              rel="preload"
              href={src}
              as="script"
              crossOrigin="anonymous"
              key={src}
            />
          ))}
          {js.map((src) => (
            <script defer src={src} crossOrigin="anonymous" key={src} />
          ))}
        </>
      ) : null}
      {css.length ? (
        <>
          {css.map((src) => (
            <link key={src} rel="stylesheet" href={src} />
          ))}
        </>
      ) : null}
    </head>
  )
}

const renderHandler =
  ({ manifests }: { manifests: Manifests }): RequestHandler =>
  async (req, res, next) => {
    const { clientManifest, serverManifest } = manifests
    const pageName = req.path.split('/')[1]
    if (!clientManifest?.[pageName]) {
      return next()
    }
    const clienAssets: Manifest | undefined = clientManifest[pageName]
    console.log('---', pageName)

    res.set({
      'X-Accel-Buffering': 'no',
      'Content-Type': 'text/html; charset=UTF-8'
    })

    const pass = new PassThrough()

    pass.pipe(res)

    pass.write(
      `<!DOCTYPE html><html lang="zh-Hans">${renderHeader({
        js: clienAssets.js || [],
        css: clienAssets.css || []
      })}`
    )
    pass.write(`<body>${IOS_PADDING}<div id='app'>`)

    const { default: Comp, getServerSideProps, getSuspenseData } = require(
      path.join(serverManifest?.[flussrServerBundleContext], pageName)
    )

    let initData: InitData | undefined

    const { map, get, set } = createSuspenseMap()

    if (getServerSideProps) {
      initData = {
        data: null,
        error: null,
        status: 'pending'
      }
      try {
        initData.data = await getServerSideProps()
        initData.status = 'fulfilled'
      } catch (e) {
        initData.error = e
        initData.status = 'rejected'
      }
    }

    if (getSuspenseData) {
      getSuspenseData({
        set
      })
    }

    if (!Comp) {
      throw new Error('Cannot find component!')
    }

    const stream = renderToPipeableStream(
      <>
        {initData ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.${flussrInitData} = ${serialize(initData, { isJSON: true })};`
            }}
          />
        ) : null}
        <PageExportsCtx.Provider
          value={{ getServerSideProps, getSuspenseData }}
        >
          <StreamCtx.Provider value={{ map, set, get }}>
            <InitDataCtx.Provider value={initData || {}}>
              <Comp />
            </InitDataCtx.Provider>
          </StreamCtx.Provider>
        </PageExportsCtx.Provider>
      </>,
      {
        onShellReady() {
          stream
            .pipe(
              new PassThrough({
                transform(chunk, _, callback) {
                  console.log('---chunk---', chunk.toString())
                  this.push(chunk)
                  callback()
                },
                flush(callback) {
                  this.push('</div></body></html>')
                  callback()
                }
              })
            )
            .pipe(pass)
        },
        onError(error) {
          console.log(error)
          pass.write('</div></body></html>')
        }
      }
    )

    pass.on('error', (err) => {
      console.log(err)
    })
  }

export default renderHandler
