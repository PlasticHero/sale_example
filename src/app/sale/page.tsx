'use client'

import { CLIENT_RESULT_CODE } from 'lib/interface'
import { TokenBalanceInfo } from 'lib/server/interface'
import { accountStore } from 'lib/store/accountStore'
import { formatNumber } from 'lib/utils/numberUtils'
import { wei2eth, wei2token } from 'lib/wallet/define'
import { WALLET_TYPE } from 'lib/wallet/walletlib'
import { useEffect, useState } from 'react'
import HistoryPagination from '../../components/HistoryPagination'


enum ButtonState {
  PURCHASE = 0,
  APPROVE = 1,
  PAUSED = 2,
  INPUT_ZERO = 3,
}


export default function SalePage() {

  const { address, sale_info, user_info, getUsdtInfo, initAccount, connectWallet, disconnectWallet, approve, deposit } = accountStore()
  
  const [selectChain, setSelectChain] = useState<'bsc' | 'eth'>('bsc')

  const [balanceBabi, setBalanceBabi] = useState('0')
  const [usdtInfo, setUsdtInfo] = useState<TokenBalanceInfo>({
    token: '',
    symbol: '',
    balance: '0',
    allowance: '0',
    decimals: 0
  })

  const [inputAmount, setInputAmount] = useState('')
  const [errorMessage, setErrorMessage] = useState('')


  useEffect(()=>{
    if(user_info) {
      setBalanceBabi(wei2eth(user_info.bsc.pay_token_balance).toString())
      setUsdtInfo(getUsdtInfo(selectChain))
    }

  },[user_info, sale_info, selectChain])

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
    const maxAmount = getMaxDepositAmount()

    const balance = wei2token(usdtInfo?.balance || '0', Number(usdtInfo?.decimals || 0))
    
    const max = Math.min(maxAmount, balance)
    // 값이 최대 구매 가능 금액을 초과하는 경우 최대값으로 제한
    if (!isNaN(amount) && amount > max) {
      setInputAmount(max.toString())
    } else {
      setInputAmount(value)
    }
    

    if(amount > 10) {
      const minAmount = getMinDepositAmount()
      if (amount < minAmount) {
        setErrorMessage(`최소 구매 금액은 ${minAmount} USDT입니다.`)
        return
      }
    }
    setErrorMessage('') // 입력 시 에러 메시지 초기화
  }

  // 구매 핸들러
  const handlePurchase = async() => {

    if(!isApproved()) {
      const res = await approve(selectChain, usdtInfo.token)
      console.log(res)
      if(res !== CLIENT_RESULT_CODE.SUCCESS) {
        alert('Approve 에러 : ' + res)
        return;
      }
      console.log('approve 성공')
      return;
    }
    const amount = getInputAmount();
    if (amount > parseFloat(wei2token(usdtInfo.balance, Number(usdtInfo.decimals)).toString())) {
      setErrorMessage('잔액이 부족합니다.')
      return
    }
    // 구매 성공 로직
    const res = await deposit(selectChain, usdtInfo.token, amount)
    console.log(res)
    if(res !== CLIENT_RESULT_CODE.SUCCESS) {
      console.log(res)
    }

    console.log('구매 성공')
  }

  function getInputAmount(): number {
    if(inputAmount && inputAmount.length > 0 && Number(inputAmount) > 0) {
      return Number(inputAmount)
    }
    return 0;
  }

  function getMinDepositAmount(): number {
    if(sale_info && sale_info[selectChain]) {
      return wei2eth(sale_info[selectChain].sale_contract.min_deposit)
    }
    return 0;
  }
  function getMaxDepositAmount(): number {

    const payTokenBalance = wei2eth(sale_info?.bsc?.sale_contract?.pay_token_balance || '0')
    const maxDeposit = wei2eth(sale_info?.[selectChain]?.sale_contract?.max_deposit || '0')
    const tokenPerUsd = wei2eth(sale_info?.[selectChain]?.sale_contract?.token_per_usd || '0')
    if(tokenPerUsd > 0 && payTokenBalance > 0 && maxDeposit > 0) {
      const maxPossibleDepositAmount = payTokenBalance / tokenPerUsd
      return Math.min(maxDeposit, maxPossibleDepositAmount)
    }
    return 0;
  }
  function getReceiveAmount(): number {
    const amount = getInputAmount();
    if(amount > 0) {
      const tokenPerUsd = wei2eth(sale_info?.[selectChain]?.sale_contract?.token_per_usd || '0')
      if(tokenPerUsd > 0) {
        return amount * Number(tokenPerUsd)
      }
    }
    return 0;
  }

  function isApproved() {
    if(usdtInfo) {
      const allowance = wei2token(usdtInfo.allowance, Number(usdtInfo.decimals))
      if(allowance > 0) {
        const amount = getInputAmount();
        if(amount > 0 && allowance < amount) {
          return false;
        } 
        return true;
      }
    }
    
    return false;
  }

  function getButtonState(): ButtonState {
    const isPaused = sale_info?.[selectChain]?.sale_contract?.paused || false;
    if(isPaused) {
        return ButtonState.PAUSED;
    }
    if(!isApproved()) {
      return ButtonState.APPROVE;
    }
    const amount = getInputAmount();
    if(amount > 0 && amount >= getMinDepositAmount()) {
      return ButtonState.PURCHASE;
    }

    return ButtonState.INPUT_ZERO;
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
          BABI TOKEN SALE
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
                }}>토큰 구매</h3>
                
                <select
                  value={selectChain}
                  onChange={(e) => setSelectChain(e.target.value as 'bsc' | 'eth')}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    fontSize: '11px',
                    color: '#1f2937',
                    outline: 'none',
                    fontWeight: '500'
                  }}
                >
                  <option value="bsc">BSC 체인</option>
                  <option value="eth">ETH 체인</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* USDT 잔액 표시 */}
                <div style={{ 
                  backgroundColor: '#ecfdf5', 
                  borderRadius: '6px', 
                  padding: '10px', 
                  border: '1px solid #d1fae5' 
                }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#065f46', 
                      fontWeight: '500',
                      marginBottom: '2px'
                    }}>
                      {selectChain === 'bsc' ? 'BSC' : 'ETH'} 체인 USDT 보유 잔액
                    </div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '700', 
                      color: '#047857' 
                    }}>
                      {formatNumber(wei2token(usdtInfo.balance, Number(usdtInfo.decimals)), 2)} {usdtInfo.symbol}
                    </div>
                  </div>
                </div>

                {/* 구매 한도 정보 */}
                <div style={{ 
                  backgroundColor: '#f9fafb', 
                  borderRadius: '6px', 
                  padding: '8px', 
                  border: '1px solid #e5e7eb' 
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontSize: '12px', 
                    color: '#6b7280' 
                  }}>
                    <span>1 USDT당 BABI 수량</span>
                    <span style={{ fontWeight: '600' }}>{formatNumber(Number(wei2eth(sale_info?.[selectChain]?.sale_contract?.token_per_usd || '0')), 2)} BABI</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontSize: '12px', 
                    color: '#6b7280',
                    marginTop: '2px'
                  }}>
                    <span>최소 구매 금액</span>
                    <span style={{ fontWeight: '600' }}>{formatNumber(getMinDepositAmount(), 2)} USDT</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    marginTop: '2px' 
                  }}>
                    <span>최대 구매 금액</span>
                    <span style={{ fontWeight: '600' }}>{formatNumber(getMaxDepositAmount(), 2)} USDT</span>
                  </div>
                </div>

                {/* 수량 입력 */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '6px' 
                  }}>
                    구매할 USDT 수량
                  </label>
                  <input
                    type="number"
                    value={inputAmount}
                    onChange={handleAmountChange}
                    placeholder="0.0"
                    min={getMinDepositAmount()}
                    max={getMaxDepositAmount()}
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
                    받을 BABI 수량
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

                {/* 에러 메시지 (에러가 있을 때만 표시) */}
                {errorMessage && (
                  <div style={{ 
                    backgroundColor: '#fef2f2', 
                    border: '1px solid #fecaca', 
                    borderRadius: '6px', 
                    padding: '8px' 
                  }}>
                    <p style={{ color: '#dc2626', fontSize: '12px' }}>{errorMessage}</p>
                  </div>
                )}

                {/* Approve/구매 버튼 */}
                <button
                  onClick={handlePurchase}
                  disabled={getButtonState() === ButtonState.PAUSED || getButtonState() === ButtonState.INPUT_ZERO}
                  style={{
                    width: '100%',
                    fontWeight: '600',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: getButtonState() === ButtonState.PAUSED || getButtonState() === ButtonState.INPUT_ZERO ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    color: 'white',
                    fontSize: '14px',
                    backgroundColor: getButtonState() === ButtonState.APPROVE 
                      ? '#ea580c' 
                      : getButtonState() === ButtonState.PURCHASE 
                        ? '#2563eb'
                        : '#9ca3af'
                  }}
                  onMouseEnter={(e) => {
                    if (getButtonState() !== ButtonState.PAUSED && getButtonState() !== ButtonState.INPUT_ZERO) {
                      e.currentTarget.style.backgroundColor = getButtonState() === ButtonState.APPROVE 
                        ? '#c2410c' 
                        : getButtonState() === ButtonState.PURCHASE 
                          ? '#1d4ed8'
                          : '#9ca3af'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = getButtonState() === ButtonState.APPROVE 
                      ? '#ea580c' 
                      : getButtonState() === ButtonState.PURCHASE 
                        ? '#2563eb'
                        : '#9ca3af'
                  }}
                >
                  {getButtonState() === ButtonState.APPROVE ? 'APPROVE' : getButtonState() === ButtonState.PAUSED ? 'PAUSED' : 'BUY'}
                </button>
              </div>
            </div>

            {/* 히스토리 페이징 컴포넌트 */}
            <HistoryPagination />
          </>
        )}
      </div>
    </main>
  )
}

