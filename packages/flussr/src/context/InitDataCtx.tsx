import { createContext, useContext } from 'react'

export type InitData = {
  data?: any
  status?: 'pending' | 'rejected' | 'fulfilled'
  error?: any
}

export const InitDataCtx = createContext<InitData>({})

export const useInitData = () => {
  return useContext(InitDataCtx)
}
