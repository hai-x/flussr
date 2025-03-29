import React from 'react'

import { Suspensable, useSuspense } from 'flussr/lib'

const B = Suspensable({
  Component: () => {
    const a = performance.now()
    const data = useSuspense()
    console.log('B start', performance.now() - a, 'data', data)
    return (
      <p>
        React Suspense for SSR enables streaming rendering, improving page load
        times by sending content in chunks. This helps render critical content
        faster, while non-essential parts load progressively. Combine with React
        Server Components (RSC) for an even better performance boost! 🚀 Ready
        to optimize your SSR? #React #SSR #Performance
      </p>
    )
  },
  fallback: () => (
    <div className="skeleton-post">
      <div className="skeleton-title"></div>
      <div className="skeleton-meta"></div>
      <div className="skeleton-content"></div>
      <div className="skeleton-content short"></div>
    </div>
  )
})

export default B
