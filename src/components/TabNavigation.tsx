'use client'

import { usePathname, useRouter } from 'next/navigation'

export default function TabNavigation() {
  const pathname = usePathname()
  const router = useRouter()

  const handleTabClick = (path: string) => {
    router.push(path)
  }

  return (
    <div style={{ 
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ 
        maxWidth: '1000px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px'
      }}>
        {/* 로고/타이틀 */}
        <div style={{ 
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#1f2937',
          marginRight: '32px',
          padding: '16px 0'
        }}>
          BABI TOKEN
        </div>

        {/* 탭 메뉴 */}
        <div style={{ display: 'flex', gap: '0' }}>
          <button
            onClick={() => handleTabClick('/sale')}
            style={{
              padding: '16px 24px',
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              borderBottom: pathname === '/sale' ? '3px solid #2563eb' : '3px solid transparent',
              color: pathname === '/sale' ? '#2563eb' : '#6b7280',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (pathname !== '/sale') {
                e.currentTarget.style.color = '#374151'
              }
            }}
            onMouseLeave={(e) => {
              if (pathname !== '/sale') {
                e.currentTarget.style.color = '#6b7280'
              }
            }}
          >
            토큰 세일
          </button>
          
          <button
            onClick={() => handleTabClick('/sale-bnb')}
            style={{
              padding: '16px 24px',
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              borderBottom: pathname === '/sale-bnb' ? '3px solid #2563eb' : '3px solid transparent',
              color: pathname === '/sale-bnb' ? '#2563eb' : '#6b7280',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (pathname !== '/sale-bnb') {
                e.currentTarget.style.color = '#374151'
              }
            }}
            onMouseLeave={(e) => {
              if (pathname !== '/sale-bnb') {
                e.currentTarget.style.color = '#6b7280'
              }
            }}
          >
            토큰 세일(BNB)
          </button>

          <button
            onClick={() => handleTabClick('/point')}
            style={{
              padding: '16px 24px',
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              borderBottom: pathname === '/point' ? '3px solid #2563eb' : '3px solid transparent',
              color: pathname === '/point' ? '#2563eb' : '#6b7280',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (pathname !== '/point') {
                e.currentTarget.style.color = '#374151'
              }
            }}
            onMouseLeave={(e) => {
              if (pathname !== '/point') {
                e.currentTarget.style.color = '#6b7280'
              }
            }}
          >
            포인트
          </button>
        </div>
      </div>
    </div>
  )
}
