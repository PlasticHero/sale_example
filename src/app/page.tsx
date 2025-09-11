'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // 홈페이지 접속 시 자동으로 /sale 페이지로 리다이렉트
    router.push('/sale')
  }, [router])

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{ 
        fontSize: '18px', 
        color: '#6b7280',
        fontWeight: '500'
      }}>
        페이지를 로딩 중입니다...
      </div>
    </div>
  )
}

