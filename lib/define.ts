
export const IS_MAINNET = process.env.NEXT_PUBLIC_CHAIN_MAINNET === 'true' ? true : false
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://192.168.0.163:29290'
export const USER_HISTORY_PAGING_LIMIT = 5;
