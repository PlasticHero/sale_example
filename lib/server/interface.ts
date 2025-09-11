
//==================================================================================================
//==================================== TX ========================================
//==================================================================================================

export enum TxState {
    PENDING = 0,
    FAILED = 104,
    SUCCESS = 200,
}
export interface TxReceipt {
    state : TxState
}

//==================================================================================================
//==================================== SALE ========================================
//==================================================================================================

export interface PageOffsetInfo {
    offset: number; //페이지 오프셋 인덱스 ( 0 : 첫페이지 )
    limit: number; //페이지 요청 수량 제한
    last_offset: number; //마지막 페이지 오프셋 인덱스
    item_list_total: number; //페이지 요청 수량 제한 총 개수
}
export interface TokenBalanceInfo {
    token: string; //토큰 주소(USDT)
    symbol: string; //토큰 심볼(USDT)
    balance: string; //유저의 토큰 잔액(wei)
    allowance: string; //유저의 토큰 approve 허용량(wei)
    decimals: number; //토큰 소수점
}

export interface HistoryInfo extends PageOffsetInfo {
    historys: HistorySetData[]; //히스토리 리스트
}


export interface PayTokenInfo {
    address: string; //지급 토큰 주소
    symbol: string; //지급 토큰 심볼
    decimals: number; //지급 토큰 소수점
}

export interface SaleContractInfo {
    address: string; //판매 컨트랙트 주소
    pay_token_balance: string; //판매 컨트랙트 지급 토큰 잔액(wei)
    paused: boolean; //판매 중지 여부
    min_deposit: string; //최소 입금 금액(wei)
    max_deposit: string; //최대 입금 금액(wei)
    token_per_usd: string; //1USDT 당 지급 토큰 수량
}

export interface SaleChainInfo {
    sale_contract: SaleContractInfo; //판매 컨트랙트 정보
    pay_token_info: PayTokenInfo; //지급 토큰 정보
}

export interface SaleInfo {
    bsc: SaleChainInfo; //BSC 체인 정보
    eth: SaleChainInfo; //ETH 체인 정보
}

export interface UserChainInfo {
    coin_balance: string; //유저의 코인 잔액(wei)
    pay_token_balance: string; //유저의 지급 토큰 잔액(wei)
    in_token_list: TokenBalanceInfo[]; //유저의 토큰 잔액 리스트
}
export interface UserInfo extends HistoryInfo {
    bsc: UserChainInfo; //BSC 체인 정보
    eth: UserChainInfo; //ETH 체인 정보
}

export interface UserSaleInfo {
    sale_info: SaleInfo;
    user_info: UserInfo;
}

export interface HistorySetData {
    deposit: HistoryData;
    pay: HistoryData;
}

export interface HistoryData {
    token: string;// usdt or babi
    amount: string;//wei
    time: string; //format : 2025-08-28T11:45:44Z
    tx_hash: string;
    chain: 'bsc' | 'eth';
}




//==================================================================================================
//==================================== POINT ========================================
//==================================================================================================


export interface PointServerCallbackInfo {
    is_exchange: boolean,
    exchange_time: string
}
export interface PointHistoryData extends PointServerCallbackInfo {
    amount: string,
    tx_hash: string,
    tx_time: string,
}
export interface PointHistoryInfo extends PageOffsetInfo {
    logs: PointHistoryData[]
}
export interface ResUserPointInfo extends PointHistoryInfo {
    point_wallet_address: string;
}

export interface ClientUserPointInfo {
    point_info: ResUserPointInfo;
}