import type { Metadata } from 'next'
import TabNavigation from '../components/TabNavigation'
import './globals.css'
import Provider from './provider'
export const metadata: Metadata = {
  title: 'BABI Token Sale',
  description: 'USDT로 BABI TOKEN을 구매하는 토큰 세일 페이지',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {


  
  return (
    <html lang="ko">
      <body>
        <Provider>
          <TabNavigation />
          {children}
        </Provider>
        
      </body>
    </html>
  )
}

