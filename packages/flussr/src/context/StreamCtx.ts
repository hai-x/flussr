import { createContext, useContext } from 'react'

export type SuspenseMap = {
  map: Record<string, Promise<any> | undefined>
  set: (id: string, fn: () => Promise<any> | undefined) => void
  get: (id: string) => Promise<any> | undefined
}

export const createSuspenseMap = (): SuspenseMap => {
  const map: SuspenseMap['map'] = {}
  const s: SuspenseMap = {
    map,
    set(id, fn) {
      map[id] = fn()
    },
    get(id: string) {
      return map[id]
    }
  }
  return s
}

export const StreamCtx = createContext<SuspenseMap>({
  map: {},
  set: () => {},
  get: () => undefined
})

export const useStreamCtx = () => useContext(StreamCtx)
