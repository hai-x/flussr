import { flussrInitData } from '../constants'
import { FC, ReactNode, useEffect, useState } from 'react'
import { type InitData, InitDataCtx } from '../context'
import { usePageExports } from '../context/PageExportsCtx'

export const ClientInitDataProvider: FC<{
  children: ReactNode
}> = (props) => {
  const { getServerSideProps } = usePageExports()
  const [initData, setInitData] = useState<InitData>(window[flussrInitData])

  useEffect(() => {
    if (
      initData !== undefined &&
      initData !== null &&
      typeof getServerSideProps === 'function'
    ) {
      if (initData.status !== 'fulfilled') {
        getServerSideProps()
          .then((res) => {
            setInitData({
              ...initData,
              error: null,
              data: res,
              status: 'fulfilled'
            })
          })
          .catch((e) => {
            setInitData({
              ...initData,
              error: e,
              status: 'rejected'
            })
          })
      }
    }
  }, [])

  return (
    <InitDataCtx.Provider value={initData}>
      {props.children}
    </InitDataCtx.Provider>
  )
}
