'use client'

import { HistorySetData } from 'lib/server/interface'
import { accountStore } from 'lib/store/accountStore'
import { formatNumber } from 'lib/utils/numberUtils'
import { getChainInfoByKey, wei2token } from 'lib/wallet/define'

export default function HistoryPagination() {
  const { user_info, userHistory } = accountStore()

  const currentPage = (user_info?.offset || 0) + 1
  const totalPages = (user_info?.last_offset || 0) + 1
  const totalItems = user_info?.item_list_total || 0  // 서버에 존재하는 총 히스토리 개수
  const historySets = (user_info?.historys || []) as unknown as HistorySetData[]  // 현재 offset에 대한 히스토리 세트 리스트

  
  // 페이지 변경 핸들러 (서버에 새 데이터 요청 필요)
  const handlePageChange = async (newPage: number) => {
    await userHistory(newPage - 1)
  }

  // 페이지 번호 생성
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    
    return pages
  }
  
  // 거래 타입에 따른 한글 표시
  const getTypeText = (type: string) => {
    switch (type) {
      case 'deposit':
        return '입금'
      case 'pay':
        return '지급'
      default:
        return type
    }
  }
  
  // 체인명 표시
  const getChainText = (chain: string) => {
    if(!chain) return ''
    return chain.toUpperCase()
  }
  
  // 날짜 포맷팅 (UTC+9)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    // UTC+9 (한국 시간)으로 변환
    const utc9Date = new Date(date.getTime() + (9 * 60 * 60 * 1000))
    
    const year = utc9Date.getUTCFullYear()
    const month = String(utc9Date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(utc9Date.getUTCDate()).padStart(2, '0')
    const hours = String(utc9Date.getUTCHours()).padStart(2, '0')
    const minutes = String(utc9Date.getUTCMinutes()).padStart(2, '0')
    const seconds = String(utc9Date.getUTCSeconds()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}(UTC+9)`
  }
  
  // 트랜잭션 해시 축약
  const shortenHash = (hash: string) => {
    return hash
    // return `${hash.slice(0, 6)}...${hash.slice(-4)}`
  }
  
  if (totalItems === 0) {
    return (
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '6px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
        padding: '12px', 
        marginTop: '12px' 
      }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          marginBottom: '8px', 
          color: '#1f2937' 
        }}>거래 히스토리</h3>
        <div style={{ 
          textAlign: 'center', 
          padding: '16px 0', 
          color: '#6b7280',
          fontSize: '12px'
        }}>
          거래 히스토리가 없습니다.
        </div>
      </div>
    )
  }
  
  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '6px', 
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
      padding: '12px', 
      marginTop: '12px' 
    }}>
      <h3 style={{ 
        fontSize: '16px', 
        fontWeight: '600', 
        marginBottom: '8px', 
        color: '#1f2937' 
      }}>거래 히스토리</h3>
      
      {/* 테이블 형태로 히스토리 표시 */}
      <div style={{ overflowX: 'auto', marginBottom: '12px' }}>
        <table style={{ width: '100%', fontSize: '14px' }}>
          <thead>
            <tr style={{ 
              borderBottom: '1px solid #e5e7eb', 
              backgroundColor: '#f9fafb' 
            }}>
              <th style={{ 
                textAlign: 'left', 
                padding: '8px 10px', 
                fontWeight: '600', 
                color: '#374151',
                fontSize: '13px'
              }}>날짜</th>
              <th style={{ 
                textAlign: 'left', 
                padding: '8px 10px', 
                fontWeight: '600', 
                color: '#374151',
                fontSize: '13px'
              }}>체인</th>
              <th style={{ 
                textAlign: 'left', 
                padding: '8px 10px', 
                fontWeight: '600', 
                color: '#374151',
                fontSize: '13px'
              }}>타입</th>
              <th style={{ 
                textAlign: 'right', 
                padding: '8px 10px', 
                fontWeight: '600', 
                color: '#374151',
                fontSize: '13px'
              }}>수량</th>
              <th style={{ 
                textAlign: 'left', 
                padding: '8px 10px', 
                fontWeight: '600', 
                color: '#374151',
                fontSize: '13px'
              }}>트랜잭션</th>
            </tr>
          </thead>
          <tbody>
            {historySets.map((historySet, setIndex) => {
              // deposit과 pay 데이터를 배열로 만들어서 순서대로 표시
              const historyItems = [historySet.pay, historySet.deposit].filter(item => 
                item && (item.amount !== '0' || item.tx_hash !== '')
              )

              
              
              return historyItems.map((history, itemIndex) => (
                <tr 
                  key={`${setIndex}-${itemIndex}-${history.tx_hash}`} 
                  style={{ 
                    borderBottom: '1px solid #f3f4f6',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {/* 날짜 */}
                  <td style={{ padding: '8px 10px' }}>
                    <div style={{ color: '#6b7280', fontSize: '12px' }}>
                        {history.time && history.time !== '1970-01-01T00:00:00Z' ? formatDate(history.time) : '-'}
                    </div>
                  </td>
                  
                  {/* 체인 */}
                  <td style={{ padding: '8px 10px' }}>
                    <span style={{ 
                      padding: '3px 8px', 
                      backgroundColor: '#f3f4f6', 
                      color: '#374151', 
                      borderRadius: '4px', 
                      fontSize: '12px', 
                      fontWeight: '500' 
                    }}>
                      {getChainText(history.chain)}
                    </span>
                  </td>
                  
                  {/* 타입 */}
                  <td style={{ padding: '8px 10px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: history.tx_hash === '' ? '#ffedd5' : history === historySet.deposit ? '#dbeafe' : '#dcfce7',
                      color: history.tx_hash === '' ? '#9a3412' : history === historySet.deposit ? '#1e40af' : '#166534'
                    }}>
                      {history.tx_hash === '' ? 'PENDING' : getTypeText(history === historySet.deposit ? 'deposit' : 'pay')}
                    </span>
                  </td>
                  
                  {/* 수량 */}
                  <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                    <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '13px' }}>
                      {formatNumber(wei2token(history.amount, 18), 2)} {history === historySet.deposit ? 'USDT' : 'BABI'}
                    </div>
                  </td>
                  
                  {/* 트랜잭션 */}
                  <td style={{ padding: '8px 10px' }}>
                    {history.tx_hash ? (
                      <a 
                        href={`${getChainInfoByKey(history.chain).explorer_tx}${history.tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                          color: '#2563eb', 
                          fontSize: '12px', 
                          fontFamily: 'monospace',
                          textDecoration: 'none'
                        }}
                        title={history.tx_hash}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#1d4ed8'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#2563eb'}
                      >
                        {shortenHash(history.tx_hash)}
                      </a>
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: '12px' }}>-</span>
                    )}
                  </td>
                </tr>
              ))
            }).flat()}
          </tbody>
        </table>
      </div>
      
      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '8px' 
        }}>
          {/* 이전 페이지 버튼 */}
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s',
              border: currentPage === 1 ? 'none' : '1px solid #d1d5db',
              backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
              color: currentPage === 1 ? '#9ca3af' : '#374151',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (currentPage !== 1) {
                e.currentTarget.style.backgroundColor = '#f9fafb'
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== 1) {
                e.currentTarget.style.backgroundColor = 'white'
              }
            }}
          >
            이전
          </button>
          
          {/* 페이지 번호들 */}
          {getPageNumbers().map(pageNum => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                transition: 'all 0.2s',
                border: currentPage === pageNum ? 'none' : '1px solid #d1d5db',
                backgroundColor: currentPage === pageNum ? '#2563eb' : 'white',
                color: currentPage === pageNum ? 'white' : '#374151',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (currentPage !== pageNum) {
                  e.currentTarget.style.backgroundColor = '#f9fafb'
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== pageNum) {
                  e.currentTarget.style.backgroundColor = 'white'
                }
              }}
            >
              {pageNum}
            </button>
          ))}
          
          {/* 다음 페이지 버튼 */}
          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s',
              border: currentPage === totalPages ? 'none' : '1px solid #d1d5db',
              backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
              color: currentPage === totalPages ? '#9ca3af' : '#374151',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (currentPage !== totalPages) {
                e.currentTarget.style.backgroundColor = '#f9fafb'
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== totalPages) {
                e.currentTarget.style.backgroundColor = 'white'
              }
            }}
          >
            다음
          </button>
        </div>
      )}
      
      {/* 페이지 정보 */}
      {totalPages > 1 && (
        <div style={{ 
          textAlign: 'center', 
          fontSize: '11px', 
          color: '#6b7280', 
          marginTop: '8px' 
        }}>
          (페이지 {currentPage}/{totalPages})
        </div>
      )}
    </div>
  )
}
