import { ComponentType, FC, ReactNode, useContext, useState } from 'react'
import React, { createContext, Suspense } from 'react'
import { useStreamCtx } from '../../context/StreamCtx'
import { flussrSuspenseData } from '../../constants'

type SuspenseState = {
  promise?: Promise<any>
  suspenseId?: string
  done?: boolean
  data?: any
  error?: any
  flush?: (v: SuspenseState) => void
}

const isServer = typeof window === 'undefined'

const SuspenseContext = createContext<SuspenseState | undefined>(undefined)

export const useSuspense = () => {
  const suspenseContext = useContext(SuspenseContext) || {}
  const { suspenseId, promise, error, done, data, flush } = suspenseContext

  if (!suspenseId) return null

  const hydrated =
    !isServer &&
    typeof window?.[flussrSuspenseData]?.[suspenseId] !== 'undefined'

  if (hydrated) {
    return window?.[flussrSuspenseData]?.[suspenseId]
  } else if (error) {
    throw error
  } else if (done) {
    return data
  } else if (promise) {
    throw promise
      .then((data) => {
        flush?.({
          done: true,
          data
        })
      })
      .catch((error) => {
        flush?.({ done: true, error })
      })
  }
}

const HydrateScript: FC<{
  suspenseId: string
}> = ({ suspenseId }) => {
  const data = useSuspense()
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
                if (!window.${flussrSuspenseData}) {
                  window.${flussrSuspenseData} = {};
                }
                window.${flussrSuspenseData}["${suspenseId}"] = ${JSON.stringify(data)};
              `
      }}
    />
  )
}

type SuspensableParams = {
  Component: ComponentType<any>
  fallback: () => ReactNode
}

export const Suspensable = function ({
  Component,
  fallback
}: SuspensableParams): FC<{
  suspenseId: string
}> {
  return ({ suspenseId }) => {
    if (!suspenseId) return null

    const streamCtx = useStreamCtx()
    const [state, setState] = useState<SuspenseState>({
      suspenseId,
      promise: streamCtx?.get(suspenseId),
      done: false,
      error: null,
      data: null,
      flush: (newState) => {
        if (isServer) {
          // Use assign to keep one reference.
          // It avoid infinte loop when server side render.
          setState(Object.assign(state, newState))
        } else setState({ ...state, ...newState })
      }
    })

    return (
      <Suspense fallback={fallback()}>
        <SuspenseContext value={state}>
          <Component />
          <HydrateScript suspenseId={suspenseId} />
        </SuspenseContext>
      </Suspense>
    )
  }
}
