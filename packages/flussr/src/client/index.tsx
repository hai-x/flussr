import { hydrateRoot } from 'react-dom/client'
import { flussrPageEntry } from '../constants'
import { ClientInitDataProvider } from './client-init-data-provider'
import { PageExportsCtx } from '../context/PageExportsCtx'
import { ClientStreamProvider } from './client-stream-provider'

const hydrate = () => {
  const { pathname } = new URL(location.href)

  const target = pathname.split('/')[1]

  let clientPageExportsFn

  if (
    !window[flussrPageEntry] ||
    !Array.isArray(window[flussrPageEntry]) ||
    !(clientPageExportsFn = window[flussrPageEntry].find(
      (comp) => comp[0] === target
    )?.[1])
  ) {
    console.error('No target client page.')
    return
  }

  const clientPageExports = clientPageExportsFn()

  const ClientPage =
    clientPageExports.__esModule && 'default' in clientPageExports
      ? clientPageExports.default
      : clientPageExports

  if (ClientPage) {
    const getServerSideProps = clientPageExports?.getServerSideProps
    const getSuspenseData = clientPageExports?.getSuspenseData

    hydrateRoot(
      document.getElementById('app')!,
      <PageExportsCtx.Provider value={{ getServerSideProps, getSuspenseData }}>
        <ClientInitDataProvider>
          <ClientStreamProvider>
            <ClientPage />
          </ClientStreamProvider>
        </ClientInitDataProvider>
      </PageExportsCtx.Provider>
    )
  }
}

hydrate()
