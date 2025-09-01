import { RESULT_CODE } from "./wallet/interface/interface";

import { WALLET_TYPE } from "./wallet/walletlib";

export interface Account {
    connected_time: number;
    wallet_type: WALLET_TYPE;
    address: string;
}


export enum CLIENT_RESULT_CODE {
    SUCCESS = 'result_code.success',
    //CLIENT =============================================
    INSUFFICIENT_BALANCE = 'result_code.insufficient_balance',
    NEED_APPROVE = 'result_code.need_approve',
    PAUSED = 'result_code.paused',
    MAX_DEPOSIT_AMOUNT = 'result_code.max_deposit_amount',
    MIN_DEPOSIT_AMOUNT = 'result_code.min_deposit_amount',
    ERR_NETWORK = 'staking.modals.serverError',
    //CONTRACT =============================================
    SYSTEM_FREEZED = 'result_code.system_freezed',
    SYSTEM_NOT_ACTIVE = 'result_code.system_not_active',
    MIN_STAKING_AMOUNT = 'result_code.min_staking_amount',
    //WALLET =============================================
    WALLET_SUCCESS = 'result_code.wallet_success',
    WALLET_UN_INSTALL = 'result_code.wallet_un_install',
    WALLET_ALREADY_PROCESSING = 'result_code.wallet_already_processing',
    WALLET_ALREADY_CONNECTED = 'result_code.wallet_already_connected',
    WALLET_INVALID_INPUT = 'result_code.wallet_invalid_input',
    WALLET_PARSE_ERROR = 'result_code.wallet_parse_error',
    WALLET_INVALID_REQUEST = 'result_code.wallet_invalid_request',
    WALLET_METHOD_NOT_FOUND = 'result_code.wallet_method_not_found',
    WALLET_INVALID_PARAMS = 'result_code.wallet_invalid_params',
    WALLET_INTERNAL_ERROR = 'result_code.wallet_internal_error',
    WALLET_RESOURCE_NOT_FOUND = 'result_code.wallet_resource_not_found',
    WALLET_TRANSACTION_REJECTED = 'result_code.wallet_transaction_rejected',
    WALLET_METHOD_NOT_SUPPORTED = 'result_code.wallet_method_not_supported',
    WALLET_LIMIT_EXCEEDED = 'result_code.wallet_limit_exceeded',
    WALLET_USER_REJECTED = 'result_code.wallet_user_rejected',
    WALLET_UNAUTHORIZED = 'result_code.wallet_unauthorized',
    WALLET_UNSUPPORTED_METHOD = 'result_code.wallet_unsupported_method',
    WALLET_DISCONNECTED = 'result_code.wallet_disconnected',
    WALLET_CHAIN_DISCONNECTED = 'result_code.wallet_chain_disconnected',
    WALLET_UN_RECOGNIZED_CHAIN_ID = 'result_code.wallet_un_recognized_chain_id',
    WALLET_NOT_MATCH_CHAINID = 'result_code.wallet_not_match_chainid',
    WALLET_TRANSACTION_FAILED = 'result_code.wallet_transaction_failed',
    WALLET_TRANSACTION_NOT_FOUND = 'result_code.wallet_transaction_not_found',
    WALLET_UNKNOWN = 'result_code.wallet_unknown',
    WALLET_NEED_RECONNECT = 'result_code.wallet_need_reconnect',
    WALLET_CHAIN_ALREADY_ADDED = 'result_code.wallet_chain_already_added',
    //SERVER =============================================
  
    //ETC =============================================
    UNKNOWN = 'result_code.unknown',
}
  
 
export const CONVERT_ERROR_WALLET: Record<RESULT_CODE, CLIENT_RESULT_CODE> = {
  [RESULT_CODE.UN_INSTALL] : CLIENT_RESULT_CODE.WALLET_UN_INSTALL,
  [RESULT_CODE.ALREADY_PROCESSING] : CLIENT_RESULT_CODE.WALLET_ALREADY_PROCESSING,
  [RESULT_CODE.ALREADY_CONNECTED] : CLIENT_RESULT_CODE.WALLET_ALREADY_CONNECTED,
  [RESULT_CODE.INVALID_INPUT] : CLIENT_RESULT_CODE.WALLET_INVALID_INPUT,
  [RESULT_CODE.PARSE_ERROR] : CLIENT_RESULT_CODE.WALLET_PARSE_ERROR,
  [RESULT_CODE.INVALID_REQUEST] : CLIENT_RESULT_CODE.WALLET_INVALID_REQUEST,
  [RESULT_CODE.METHOD_NOT_FOUND] : CLIENT_RESULT_CODE.WALLET_METHOD_NOT_FOUND,
  [RESULT_CODE.INVALID_PARAMS] : CLIENT_RESULT_CODE.WALLET_INVALID_PARAMS,
  [RESULT_CODE.INTERNAL_ERROR] : CLIENT_RESULT_CODE.WALLET_INTERNAL_ERROR,
  [RESULT_CODE.RESOURCE_NOT_FOUND] : CLIENT_RESULT_CODE.WALLET_RESOURCE_NOT_FOUND,
  [RESULT_CODE.TRANSACTION_REJECTED] : CLIENT_RESULT_CODE.WALLET_TRANSACTION_REJECTED,
  [RESULT_CODE.METHOD_NOT_SUPPORTED] : CLIENT_RESULT_CODE.WALLET_METHOD_NOT_SUPPORTED,
  [RESULT_CODE.LIMIT_EXCEEDED] : CLIENT_RESULT_CODE.WALLET_LIMIT_EXCEEDED,
  [RESULT_CODE.USER_REJECTED] : CLIENT_RESULT_CODE.WALLET_USER_REJECTED,
  [RESULT_CODE.UNAUTHORIZED] : CLIENT_RESULT_CODE.WALLET_UNAUTHORIZED,
  [RESULT_CODE.UNSUPPORTED_METHOD] : CLIENT_RESULT_CODE.WALLET_UNSUPPORTED_METHOD,
  [RESULT_CODE.DISCONNECTED] : CLIENT_RESULT_CODE.WALLET_DISCONNECTED,
  [RESULT_CODE.CHAIN_DISCONNECTED] : CLIENT_RESULT_CODE.WALLET_CHAIN_DISCONNECTED,
  [RESULT_CODE.UN_RECOGNIZED_CHAIN_ID] : CLIENT_RESULT_CODE.WALLET_UN_RECOGNIZED_CHAIN_ID,
  [RESULT_CODE.NOT_MATCH_CHAINID] : CLIENT_RESULT_CODE.WALLET_NOT_MATCH_CHAINID,
  [RESULT_CODE.TRANSACTION_FAILED] : CLIENT_RESULT_CODE.WALLET_TRANSACTION_FAILED,
  [RESULT_CODE.TRANSACTION_NOT_FOUND] : CLIENT_RESULT_CODE.WALLET_TRANSACTION_NOT_FOUND,
  [RESULT_CODE.NOT_CONNECTED] : CLIENT_RESULT_CODE.WALLET_NEED_RECONNECT,
  [RESULT_CODE.ACCOUNT_NOT_FOUND] : CLIENT_RESULT_CODE.WALLET_NEED_RECONNECT,
  [RESULT_CODE.UN_KNOWN] : CLIENT_RESULT_CODE.WALLET_UNKNOWN,
  [RESULT_CODE.SUCCESS] : CLIENT_RESULT_CODE.WALLET_SUCCESS,
  [RESULT_CODE.CHAIN_ALREADY_ADDED] : CLIENT_RESULT_CODE.WALLET_CHAIN_ALREADY_ADDED,
}

export enum TxType {
  APPROVE = 'approve',
  DEPOSIT = 'deposit',
}

export interface TxReceiptResult {
  result: CLIENT_RESULT_CODE;
  type: TxType;
  tx_hash?: string;
}

