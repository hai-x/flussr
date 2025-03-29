import { LoaderContext } from '@rspack/core'
import { flussrPageEntry } from '../../constants'

export function stringifyRequest(
  loaderContext: LoaderContext<any>,
  request: string
) {
  return JSON.stringify(
    loaderContext.utils.contextify(
      loaderContext.context || loaderContext.rootContext,
      request
    )
  )
}

const ClientPageLoader = function (this) {
  const { pageName, pagePath } = this.getOptions()
  return `
    (window.${flussrPageEntry} = window.${flussrPageEntry} || []).push([
      ${JSON.stringify(pageName)},
      function () {
        return require(${stringifyRequest(this, pagePath)});
      }
    ]);
    if(module.hot) {
      module.hot.dispose(function () {
        window.${flussrPageEntry}.push([${JSON.stringify(pageName)}])
      });
    }
  `
}

export default ClientPageLoader
