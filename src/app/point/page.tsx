'use client'

import { CLIENT_RESULT_CODE } from 'lib/interface'
import { accountStore } from 'lib/store/accountStore'
import { formatNumber } from 'lib/utils/numberUtils'
import { wei2eth } from 'lib/wallet/define'
import { WALLET_TYPE } from 'lib/wallet/walletlib'
import { useEffect, useState } from 'react'
import PointHistoryPagination from '../../components/PointHistoryPagination'


enum ButtonState {
  ACTIVE = 0,
  UNACTIVE = 1,
}


export default function PointPage() {

  const { address, user_info, point_info, initAccount, connectWallet, disconnectWallet, conversionBabiPoint } = accountStore()
 
  const [balanceBabi, setBalanceBabi] = useState('0')
  const [inputAmount, setInputAmount] = useState('')


  useEffect(()=>{
    if(user_info) {
      setBalanceBabi(wei2eth(user_info.bsc.pay_token_balance).toString())
    }

  },[user_info])

  useEffect(() => {
    (async()=>{
      await initAccount()
    })()
  }, [])

  // 지갑 연결 핸들러 (UI만 구현)
  const handleConnectWallet = async() => {
    // 실제 지갑 연결 로직은 여기에 구현
    
    const res = await connectWallet(WALLET_TYPE.Metamask)
    console.log(res)
    if(res !== CLIENT_RESULT_CODE.SUCCESS) {
      alert('지갑 연결 에러 : ' + res)
    }

  }

  const handleDisconnectWallet = async() => {
    const res = await disconnectWallet()
    console.log(res)
    if(res !== CLIENT_RESULT_CODE.SUCCESS) {
      alert('지갑 연결 해제 에러 : ' + res)
    }
  }

  // 수량 입력 핸들러
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const amount = value && value.length > 0 && Number(value) > 0 ? parseFloat(value) : 0

    // 값이 최대 구매 가능 금액을 초과하는 경우 최대값으로 제한
    if (!isNaN(amount) && amount > Number(balanceBabi)) {
      setInputAmount(balanceBabi.toString())
    } else {
      setInputAmount(value)
    }
    
  }

  // 포인트전환 핸들러
  const handlePurchase = async() => {


    const amount = getInputAmount();
    if (amount <=0) {
      return
    }
    // 포인트전환 성공 로직
    const res = await conversionBabiPoint(amount)
    console.log(res)
    if(res !== CLIENT_RESULT_CODE.SUCCESS) {
      console.log(res)
    }

    console.log('포인트전환 성공')
  }

  function getInputAmount(): number {
    if(inputAmount && inputAmount.length > 0 && Number(inputAmount) > 0) {
      return Number(inputAmount)
    }
    return 0;
  }

  function getReceiveAmount(): number {
    const amount = getInputAmount();
    if(amount > 0) {
      return amount
    }
    return 0;
  }


  function getButtonState(): ButtonState {
    const amount = getInputAmount();
    if(amount > 0) {
      return ButtonState.ACTIVE;
    }

    return ButtonState.UNACTIVE;
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '16px 0' }}>
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto', 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', 
        padding: '16px' 
      }}>
        <h1 style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          textAlign: 'center', 
          marginBottom: '16px', 
          color: '#1f2937' 
        }}>
          BABI POINT
        </h1>

        {/* 지갑 연결 섹션 */}
        <div style={{ marginBottom: '16px' }}>
          {!address ? (
            <button
              onClick={handleConnectWallet}
              style={{
                width: '100%',
                backgroundColor: '#2563eb',
                color: 'white',
                fontWeight: '600',
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            >
              지갑 연결
            </button>
          ) : (
            <div style={{ 
              backgroundColor: '#f8fafc', 
              borderRadius: '8px', 
              padding: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              {/* 지갑 주소 정보 */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px'
                }}>
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#475569', 
                    fontWeight: '700'
                  }}>연결된 지갑 주소</div>
                  <button
                    onClick={handleDisconnectWallet}
                    style={{
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                  >
                    연결 해제
                  </button>
                </div>
                <div style={{ 
                  fontFamily: 'monospace', 
                  fontSize: '13px', 
                  color: '#0f172a',
                  backgroundColor: '#f1f5f9',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  border: '1px solid #e2e8f0',
                  fontWeight: '600'
                }}>{address}</div>
              </div>
              
              {/* BABI 잔액 정보 */}
              <div style={{
                backgroundColor: '#eff6ff',
                borderRadius: '6px',
                padding: '10px',
                border: '1px solid #dbeafe'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#1e40af', 
                    fontWeight: '500' 
                  }}>
                    BSC 체인 보유 BABI
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '700', 
                    color: '#1d4ed8' 
                  }}>
                    {formatNumber(balanceBabi, 2)} BABI
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 지갑이 연결된 경우에만 표시 */}
        {address && (
          <>

            {/* 구매 섹션 */}
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '6px', 
              padding: '12px', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
              border: '1px solid #e5e7eb', 
              marginTop: '12px' 
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '12px' 
              }}>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#1f2937',
                  margin: 0
                }}>포인트 전환</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
                {/* 수량 입력 */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '6px' 
                  }}>
                    전환할 BABI 수량
                  </label>
                  <input
                    type="number"
                    value={inputAmount}
                    onChange={handleAmountChange}
                    placeholder="0.0"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px',
                      color: '#1f2937',
                      outline: 'none',
                      fontWeight: '500',
                      boxSizing: 'border-box',
                      textAlign: 'right'
                    }}
                  />
                </div>

                {/* 받을 수량 표기 */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '6px' 
                  }}>
                    전환될 BABI 수량
                  </label>
                  <div style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    color: '#1f2937',
                    fontSize: '16px',
                    fontWeight: '600',
                    boxSizing: 'border-box',
                    textAlign: 'right'
                  }}>
                    {formatNumber(getReceiveAmount(), 2)} BABI
                  </div>
                </div>


                {/* Approve/구매 버튼 */}
                <button
                  onClick={handlePurchase}
                  disabled={getButtonState() === ButtonState.UNACTIVE}
                  style={{
                    width: '100%',
                    fontWeight: '600',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: getButtonState() === ButtonState.UNACTIVE ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    color: 'white',
                    fontSize: '14px',
                    backgroundColor: getButtonState() === ButtonState.ACTIVE ? '#2563eb': '#9ca3af'
                  }}
                  onMouseEnter={(e) => {
                    if (getButtonState() !== ButtonState.UNACTIVE) {
                      e.currentTarget.style.backgroundColor = getButtonState() === ButtonState.ACTIVE ? '#1d4ed8': '#9ca3af'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = getButtonState() === ButtonState.ACTIVE ? '#2563eb': '#9ca3af'
                  }}
                >
                  {'포인트 전환'}
                </button>
              </div>
            </div>

            {/* 히스토리 페이징 컴포넌트 */}
            <PointHistoryPagination />
          </>
        )}
      </div>
    </main>
  )
}

