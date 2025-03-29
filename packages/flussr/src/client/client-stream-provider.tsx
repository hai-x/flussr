import { FC, ReactNode } from 'react'
import { StreamCtx, createSuspenseMap } from '../context'

export const ClientStreamProvider: FC<{ children: ReactNode }> = (props) => {
  const suspenseMap = createSuspenseMap()

  return (
    <StreamCtx.Provider value={suspenseMap}>
      {props.children}
    </StreamCtx.Provider>
  )
}
