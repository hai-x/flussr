import React, { Suspense, lazy } from 'react'
import Post2 from './Post2'
import { ErrorBoundary } from 'react-error-boundary'

import './index.scss'

const Post1 = lazy(() => import('./Post1'))

const Home = () => {
  return (
    <div className="layout">
      <div className="header">flussr</div>
      <div className="post">
        <Suspense fallback={'Lazy import loading...'}>
          <Post1 />
        </Suspense>
      </div>
      <div className="post">
        <ErrorBoundary fallback={'Something error!!!'}>
          <Post2 suspenseId="test" />
        </ErrorBoundary>
      </div>
    </div>
  )
}

export const getSuspenseData = async ({ set }) => {
  set(
    'test',
    async () =>
      await new Promise((r) =>
        setTimeout(() => {
          r('CLIENT DATA')
        }, 2000)
      )
  )
}

export const getServerSideProps = async () => {
  if (process.env.IS_SERVER) {
    return await new Promise((r, reject) => reject('REJECT'))
  } else {
    return new Promise((r) => {
      setTimeout(() => {
        r('RESOLVED')
      }, 2000)
    })
  }
}

export default Home
