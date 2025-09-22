import { transfer } from "lib/contract/erc20";
import { USER_HISTORY_PAGING_LIMIT } from "lib/define";
import { api } from "lib/server/api";
import { ClientUserPointInfo, ResUserPointInfo, TokenBalanceInfo, TxReceipt, TxState, UserSaleInfo } from "lib/server/interface";
import { isMobile } from "react-device-detect";
import { makeDataApprove, makeDataDeposit, makeDataDepositBNB } from "../contract/sale";
import { Account, CLIENT_RESULT_CODE, CONVERT_ERROR_WALLET } from "../interface";
import { Storage, STORAGE_KEY } from "../storage/storage";
import { getChainInfoByKey, token2wei, TX_WAIT_TIME_MS, USE_NETWORKS } from "../wallet/define";
import { ParamSendTransaction, RESULT_CODE } from "../wallet/interface/interface";
import { WALLET_TYPE, walletLib } from "../wallet/walletlib";
import { makeStore } from "./store";

//[작성] 상태 자료형 ====================================================================
interface State extends Account, UserSaleInfo, ClientUserPointInfo {
}

//[작성] 액션 자료형 ====================================================================
interface Actions  {
  userInfo: () => Promise<any>;
  txReceipt: (chainId:number, txHash: string) => Promise<any>;
  connectWallet: (wallet_type: WALLET_TYPE) => Promise<CLIENT_RESULT_CODE>;
  disconnectWallet: () => Promise<CLIENT_RESULT_CODE>;
  addRewardChain: () => Promise<CLIENT_RESULT_CODE>;
  approve: (chain: 'eth' | 'bsc', usdt_token: string) => Promise<CLIENT_RESULT_CODE>;
  deposit: (chain: 'eth' | 'bsc', usdt_token: string, amount: number) => Promise<CLIENT_RESULT_CODE>;
  depositBNB: (amount: number) => Promise<CLIENT_RESULT_CODE>;
}

//[작성] 상태 초기값 ====================================================================
const state: State = {
  connected_time: 0,
  wallet_type: WALLET_TYPE.Metamask,
  address: '',
  user_info: {
    bsc: {
        coin_balance: "0",
        pay_token_balance: "0",
        in_token_list: []
    },
    eth: {
        coin_balance: "0",
        pay_token_balance: "0",
        in_token_list: []
    },
    offset: 0,
    limit: 0,
    last_offset: 0,
    item_list_total: 0,
    historys: []
  },
  sale_info: {
      bsc: {
          sale_contract: {
              address: "",
              pay_token_balance: "0",
              paused: false,
              min_deposit: "0",
              max_deposit: "0",
              token_per_usd: "0",
              bnb: {
                paused: false,
                min_deposit: "0",
                max_deposit: "0",
                token_per_bnb: "0"
              }

          },
          pay_token_info: {
              address: "",
              symbol: "",
              decimals: 0
          }
      },
      eth: {
          sale_contract: {
              address: "",
              pay_token_balance: "0",
              paused: false,
              min_deposit: "0",
              max_deposit: "0",
              token_per_usd: "0",
              bnb: {
                paused: false,
                min_deposit: "0",
                max_deposit: "0",
                token_per_bnb: "0"
              }
          },
          pay_token_info: {
              address: "",
              symbol: "",
              decimals: 0
          }
      }
  },
  point_info: {
    offset: 0,
    limit: 0,
    last_offset: 0,
    item_list_total: 0,
    point_wallet_address: "",
    logs: []
  }
}

const actions = (
  set: (fn: (state: State & Actions) => Partial<State & Actions> | Partial<State & Actions>) => void,
  get: () => State & Actions
) => ({ 
  setLoaded: () => {
    set((state: State & Actions) => ({ ...state, is_loaded: true }))
  },
  //[작성] 기능 작성-START ===============================================================
  
  initAccount: async () => {
    await walletLib.init(USE_NETWORKS)
    const account = Storage.getItem<Account>(STORAGE_KEY.ACCOUNT)
    if(account) {
      set((state: State & Actions) => ({ ...account }))
      await get().userInfo()
    }
  },

  userInfo: async (): Promise<void> => {

    {//sale info
      const res = await api.user_info(get().address, 0, USER_HISTORY_PAGING_LIMIT)
      if(res.success && res.data) {
        const uInfo = res.data as UserSaleInfo
        set((state: State & Actions) => ({ ...state, user_info: uInfo.user_info, sale_info: uInfo.sale_info }))
      }
    }

    {//point info
      const res = await api.point_info(get().address, 0, USER_HISTORY_PAGING_LIMIT)
      if(res.success && res.data) {
        const pInfo = res.data as ResUserPointInfo
        set((state: State & Actions) => ({ ...state, point_info: pInfo }))
      }
    }

    
    
  },

  //sale history
  userHistory: async (offset: number): Promise<void> => {
    const res = await api.user_info(get().address, offset, USER_HISTORY_PAGING_LIMIT)
    if(res.success && res.data) {
      const uInfo = res.data as UserSaleInfo
      set((state: State & Actions) => ({ ...state, user_info: uInfo.user_info, sale_info: uInfo.sale_info }))
    }
  },


  //point history
  userPointHistory: async (offset: number): Promise<void> => {
    const res = await api.point_info(get().address, offset, USER_HISTORY_PAGING_LIMIT)
    if(res.success && res.data) {
      const pInfo = res.data as ResUserPointInfo
      set((state: State & Actions) => ({ ...state, point_info: pInfo }))
    }
  },


  getUsdtInfo: (chain: 'eth' | 'bsc'): TokenBalanceInfo => {
    const user_info = get().user_info
    if(user_info[chain]) {
      const cInfo = user_info[chain]
      if(cInfo && cInfo.in_token_list.length > 0) {
          const cInfo = user_info[chain];
          return cInfo.in_token_list[0]
        }
    }

    return {
      token: '',
      symbol: '',
      balance: '0',
      allowance: '0',
      decimals: 0
    }
  },

  connectWallet: async (wallet_type: WALLET_TYPE): Promise<CLIENT_RESULT_CODE> => {
    if(isMobile) {
      wallet_type = WALLET_TYPE.WalletConnect;
    }
    set((state: State & Actions) => ({ ...state, showConfirm: true }))

    /** 1. 지갑연결 */
    const res = await walletLib.connect(wallet_type)
    if(res.result !== RESULT_CODE.SUCCESS) {
      set((state: State & Actions) => ({ ...state, showConfirm: false }))
      const resultCode = CONVERT_ERROR_WALLET[res.result] || CLIENT_RESULT_CODE.UNKNOWN
      return resultCode
    }
    const address = res.data

    Storage.setItem<Account>(STORAGE_KEY.ACCOUNT, {
      connected_time: Math.floor(Date.now() / 1000),
      wallet_type: wallet_type,
      address: address,
    })
    set((state: State & Actions) => ({ ...state, showConfirm: false, address: address, connected_time: Math.floor(Date.now() / 1000), wallet_type: wallet_type }))
    await get().userInfo()
    return CLIENT_RESULT_CODE.SUCCESS;
  },
  disconnectWallet: async (): Promise<CLIENT_RESULT_CODE> => {
    const res = await walletLib.disconnect(get().wallet_type)
    if(res.result !== RESULT_CODE.SUCCESS) {
      return CONVERT_ERROR_WALLET[res.result] || CLIENT_RESULT_CODE.UNKNOWN
    }
    Storage.removeItem(STORAGE_KEY.ACCOUNT)
    set((s: State & Actions) => ({ ...state }))

    return CLIENT_RESULT_CODE.SUCCESS;
  },
  txReceipt: async (chainId:number, txHash: string): Promise<any> => {

    let result = CLIENT_RESULT_CODE.WALLET_TRANSACTION_NOT_FOUND

    //tx check
    const expireTime = Date.now() + TX_WAIT_TIME_MS;
    while(expireTime > Date.now()) {
      const receipt = await api.tx_receipt(chainId, txHash)
      if(receipt.success) {
        const data = receipt.data as TxReceipt
        if(data.state === TxState.SUCCESS) {
          set((state: State & Actions) => ({ ...state, pendingTx: '' }))
          result = CLIENT_RESULT_CODE.SUCCESS
          break;
        } else if(data.state === TxState.FAILED) {
          set((state: State & Actions) => ({ ...state, pendingTx: '' }))
          result = CLIENT_RESULT_CODE.WALLET_TRANSACTION_FAILED
          break;
        } 
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    set((state: State & Actions) => ({ ...state, pendingTx: '' }))
    return {
      result: result,
      tx_hash: txHash,
    }
  },
  approve: async (chain: 'eth' | 'bsc', usdt_token: string): Promise<CLIENT_RESULT_CODE> => {
    const targetChainInfo = get().sale_info[chain]
    const sale_contract = targetChainInfo.sale_contract.address
    const from = get().address
    const spender = sale_contract
    const token = usdt_token
    
    //make tx param
    const chainInfo = getChainInfoByKey(chain)
    const chainIdHex = `0x${Number(chainInfo.chainId).toString(16)}`
    const paramChain = USE_NETWORKS.find(n => n.chainId === chainIdHex)
    if(!paramChain) {
      return CLIENT_RESULT_CODE.WALLET_UN_RECOGNIZED_CHAIN_ID
    }

    const txParam: ParamSendTransaction = {
      type: chainInfo?.transaction_type ?? '0x0',
      chainId: chainIdHex,
      from: from,
      to: token,
      data: makeDataApprove(spender, '100000000000000000000000000000000000')
    }
    //tx send
    const res = await walletLib.sendTransactionWithChain(get().wallet_type, txParam, paramChain)

    if(res.result !== RESULT_CODE.SUCCESS) {
      if(res.result === RESULT_CODE.NOT_CONNECTED) {
        await get().disconnectWallet()
        return CLIENT_RESULT_CODE.WALLET_DISCONNECTED
      }
      return CONVERT_ERROR_WALLET[res.result] || CLIENT_RESULT_CODE.UNKNOWN
    }

    //tx receipt
    const resReceipt = await get().txReceipt(chainInfo.chainId, res.data)

    if(resReceipt.result !== CLIENT_RESULT_CODE.SUCCESS) {
      return resReceipt.result 
    }
    await new Promise(resolve => setTimeout(resolve, 3000));
    //refresh user info
    await get().userInfo()
    return CLIENT_RESULT_CODE.SUCCESS;
  },

  //sale deposit
  deposit: async (chain: 'eth' | 'bsc', usdt_token: string, amount: number): Promise<CLIENT_RESULT_CODE> => {
    
    const userTargetChainInfo = get().user_info[chain]
    const sale_contract = get().sale_info[chain].sale_contract.address
    const from = get().address

    
    const usdtInfo = userTargetChainInfo.in_token_list.find(f=>f.token === usdt_token)
    if(!usdtInfo) {
      return CLIENT_RESULT_CODE.WALLET_UN_RECOGNIZED_CHAIN_ID
    }
    const amountWei = token2wei(amount, usdtInfo.decimals)
    
    //make tx param
    const chainInfo = getChainInfoByKey(chain)
    const chainIdHex = `0x${Number(chainInfo.chainId).toString(16)}`
    const paramChain = USE_NETWORKS.find(n => n.chainId === chainIdHex)
    if(!paramChain) {
      return CLIENT_RESULT_CODE.WALLET_UN_RECOGNIZED_CHAIN_ID
    }

    
    const txParam: ParamSendTransaction = {
      type: chainInfo?.transaction_type ?? '0x0',
      chainId: chainIdHex,
      from: from,
      to: sale_contract,
      data: makeDataDeposit(usdt_token, amountWei.toString())
    }

    const prevItemListTotal = get().user_info.item_list_total || 0

    //tx send
    const res = await walletLib.sendTransactionWithChain(get().wallet_type, txParam, paramChain)

    if(res.result !== RESULT_CODE.SUCCESS) {
      if(res.result === RESULT_CODE.NOT_CONNECTED) {
        await get().disconnectWallet()
        return CLIENT_RESULT_CODE.WALLET_DISCONNECTED
      }
      return CONVERT_ERROR_WALLET[res.result] || CLIENT_RESULT_CODE.UNKNOWN
    }

    //tx receipt
    const resReceipt = await get().txReceipt(chainInfo.chainId, res.data)

    if(resReceipt.result !== CLIENT_RESULT_CODE.SUCCESS) {
      return resReceipt.result 
    }

    const MAX_RETRY_TIME_MS = 1000 * 30
    const refreshStartTime = Date.now()
    while(refreshStartTime + MAX_RETRY_TIME_MS > Date.now()) {
      await get().userInfo()

      const findEmpty = get().user_info.historys.find(f=>f.pay.tx_hash === '')

      const currentItemListTotal = get().user_info.item_list_total || 0
      const isChanged = prevItemListTotal != currentItemListTotal && !findEmpty
      if(isChanged) {
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return CLIENT_RESULT_CODE.SUCCESS;
  },


  depositBNB: async (amount: number): Promise<CLIENT_RESULT_CODE> => {
    
    const sale_contract = get().sale_info.bsc.sale_contract.address
    const from = get().address

    
    const amountWei = token2wei(amount, 18)
    
    //make tx param
    const chainInfo = getChainInfoByKey('bsc')
    const chainIdHex = `0x${Number(chainInfo.chainId).toString(16)}`
    const paramChain = USE_NETWORKS.find(n => n.chainId === chainIdHex)
    if(!paramChain) {
      return CLIENT_RESULT_CODE.WALLET_UN_RECOGNIZED_CHAIN_ID
    }

    
    const txParam: ParamSendTransaction = {
      type: chainInfo?.transaction_type ?? '0x0',
      chainId: chainIdHex,
      from: from,
      to: sale_contract,
      data: makeDataDepositBNB(amountWei.toString()),
      value: amountWei.toHexString()
    }
    // console.log('txParam, ', txParam)

    const prevItemListTotal = get().user_info.item_list_total || 0

    //tx send
    const res = await walletLib.sendTransactionWithChain(get().wallet_type, txParam, paramChain)

    if(res.result !== RESULT_CODE.SUCCESS) {
      if(res.result === RESULT_CODE.NOT_CONNECTED) {
        await get().disconnectWallet()
        return CLIENT_RESULT_CODE.WALLET_DISCONNECTED
      }
      return CONVERT_ERROR_WALLET[res.result] || CLIENT_RESULT_CODE.UNKNOWN
    }

    //tx receipt
    const resReceipt = await get().txReceipt(chainInfo.chainId, res.data)

    if(resReceipt.result !== CLIENT_RESULT_CODE.SUCCESS) {
      return resReceipt.result 
    }

    const MAX_RETRY_TIME_MS = 1000 * 30
    const refreshStartTime = Date.now()
    while(refreshStartTime + MAX_RETRY_TIME_MS > Date.now()) {
      await get().userInfo()

      const findEmpty = get().user_info.historys.find(f=>f.pay.tx_hash === '')

      const currentItemListTotal = get().user_info.item_list_total || 0
      const isChanged = prevItemListTotal != currentItemListTotal && !findEmpty
      if(isChanged) {
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return CLIENT_RESULT_CODE.SUCCESS;
  },

  //babi token point conversion
  conversionBabiPoint: async (amount: number): Promise<CLIENT_RESULT_CODE> => {
    
    const babi_token = get().sale_info.bsc.pay_token_info.address
    const babi_decimals = get().sale_info.bsc.pay_token_info.decimals
    
    const point_wallet_address = get().point_info.point_wallet_address
    const from = get().address

    if(!babi_token) {
      return CLIENT_RESULT_CODE.WALLET_UN_RECOGNIZED_CHAIN_ID
    }
    if(!point_wallet_address) {
      return CLIENT_RESULT_CODE.WALLET_UN_RECOGNIZED_CHAIN_ID
    }
    const amountWei = token2wei(amount, babi_decimals)
    
    //make tx param
    const chainInfo = getChainInfoByKey('bsc')
    const chainIdHex = `0x${Number(chainInfo.chainId).toString(16)}`
    const paramChain = USE_NETWORKS.find(n => n.chainId === chainIdHex)
    if(!paramChain) {
      return CLIENT_RESULT_CODE.WALLET_UN_RECOGNIZED_CHAIN_ID
    }

    
    const txParam: ParamSendTransaction = {
      type: chainInfo?.transaction_type ?? '0x0',
      chainId: chainIdHex,
      from: from,
      to: babi_token,
      data: transfer(point_wallet_address, amountWei.toString())
    }

    const prevItemListTotal = get().point_info.item_list_total || 0

    //tx send
    const res = await walletLib.sendTransactionWithChain(get().wallet_type, txParam, paramChain)

    if(res.result !== RESULT_CODE.SUCCESS) {
      if(res.result === RESULT_CODE.NOT_CONNECTED) {
        await get().disconnectWallet()
        return CLIENT_RESULT_CODE.WALLET_DISCONNECTED
      }
      return CONVERT_ERROR_WALLET[res.result] || CLIENT_RESULT_CODE.UNKNOWN
    }

    //tx receipt
    const resReceipt = await get().txReceipt(chainInfo.chainId, res.data)

    if(resReceipt.result !== CLIENT_RESULT_CODE.SUCCESS) {
      return resReceipt.result 
    }

    const MAX_RETRY_TIME_MS = 1000 * 30
    const refreshStartTime = Date.now()
    while(refreshStartTime + MAX_RETRY_TIME_MS > Date.now()) {
      await get().userInfo()

      const findEmpty = get().point_info.logs.find(f=>f.tx_hash === '')

      const currentItemListTotal = get().point_info.item_list_total || 0
      const isChanged = prevItemListTotal != currentItemListTotal && !findEmpty
      if(isChanged) {
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return CLIENT_RESULT_CODE.SUCCESS;
  },

  addRewardChain: async (): Promise<CLIENT_RESULT_CODE> => {
    const chainInfo = getChainInfoByKey('bsc')
    const chainIdHex = `0x${Number(chainInfo.chainId).toString(16)}`
    const paramChain = USE_NETWORKS.find(n => n.chainId === chainIdHex)
    if(!paramChain) return CLIENT_RESULT_CODE.WALLET_UN_RECOGNIZED_CHAIN_ID
    const res = await walletLib.addChain(get().wallet_type, paramChain)
    if(res.result !== RESULT_CODE.SUCCESS) {
      return CONVERT_ERROR_WALLET[res.result] || CLIENT_RESULT_CODE.UNKNOWN
    }
    return CLIENT_RESULT_CODE.SUCCESS
  },



  //[작성] 기능 작성-END ==================================================================
})


//[작성] 스토어 이름 =============================================================================
export const accountStore = makeStore(state, actions)



