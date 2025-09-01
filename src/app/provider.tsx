'use client'

import { QueryClient } from '@tanstack/react-query'
import { WagmiHandleProvider } from 'lib/wallet/component/WagmiHandleProvider'
import { useState } from 'react'



export default function Provider({
  children,
}: {
  children: React.ReactNode
}) {


  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  )
  
  return (
    <WagmiHandleProvider client={queryClient}>
      {children}
    </WagmiHandleProvider>
  )
}

