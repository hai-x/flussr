import { createContext, useContext } from 'react'

export type PageExports = {
  getSuspenseData?: any
  getServerSideProps?: any
}

export const PageExportsCtx = createContext<PageExports>({})

export const usePageExports = () => {
  return useContext(PageExportsCtx)
}
